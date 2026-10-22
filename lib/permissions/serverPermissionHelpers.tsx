import 'server-only'
import { headers } from "next/headers";
import { auth } from "../auth";
import { User } from "../schema/schemaTypes";
import { CustomHttpError, InsufficientPermissionsError, UnauthorisedError } from "../errors";
import { NextRequest } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { ApiKey } from '@better-auth/api-key';

export async function getUser(){
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session) {
        throw new UnauthorisedError();
    }
    const user = session.user;
    if (!user) {
        throw new UnauthorisedError();
    }
    return user;
}

export async function userHasPermissionServer(permissions: Record<string, string[]>, existingUser?: User) {
    const user = existingUser ?? await getUser();
    const data = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            role: user.role as any,
            permissions
        }
    })
    return {isAuthorised: data.success, user, error: data.error};
}
// For API
export function errorToResponse(error: unknown): Response {
    unstable_rethrow(error)
    if (error instanceof CustomHttpError) {
        return Response.json({ error: error.name, message: error.message },{ status: error.status_code })
    }
    console.error(error)
    return Response.json({ error: 'INTERNAL', message: "An unexpected error occured"}, { status: 500 })
}

export function verifyUser<C extends { params: Promise<unknown> }>(handler: (req: NextRequest, ctx: C, user: User)=> Promise<Response>){
    return async(req: NextRequest, ctx: C)=>{
        let user: User;
        try {
            user = await getUser();
        } catch (error) {
            return errorToResponse(error);
        }
        return handler(req, ctx, user);
    }
}

export function verifyUserWithPermission<C extends { params: Promise<unknown> }>(permissionCheck: (user: User) => Promise<boolean>, handler: (req: NextRequest, ctx: C, user: User)=> Promise<Response>){
    return verifyUser(async(req, ctx: C, user: User)=>{
        const hasPermission = await permissionCheck(user);
        if (!hasPermission) {
            return errorToResponse(new InsufficientPermissionsError());
        }
        return handler(req, ctx, user);
    })
}

export function verifyAPIKey<C extends { params: Promise<unknown> }>(handler: (req: NextRequest, ctx: C, apiKey: ApiKey)=> Promise<Response>){
    return async(req: NextRequest, ctx: C)=>{
        let user: User;
        const _headers = await headers();
        if (!_headers.has("Authorization")){
            return errorToResponse(new UnauthorisedError());
        }
        const key = _headers.get("Authorization")?.split(" ")[1];
        if (!key) {
            return errorToResponse(new UnauthorisedError());
        }
        try {
            const data = await auth.api.verifyApiKey({
                body: {
                    key: key
                },
            });
            if (!data.valid || !data.key) {
                return errorToResponse(new UnauthorisedError());
            }
            const finalKey = {...data.key, key: key};
            return handler(req, ctx, finalKey);
        } catch (error) {
            return errorToResponse(error);
        }
    }
}

export function verifyAPIKeyOrUser<C extends { params: Promise<unknown> }>(handler: (req: NextRequest, ctx: C, apiKey?: ApiKey, user?: User)=> Promise<Response>){
    return async(req: NextRequest, ctx: C)=>{
        if (req.headers.has("Authorization")){
            return verifyAPIKey((request, context, apiKey) =>
                handler(request, ctx, apiKey, undefined)
            )(req, ctx);
        } else {
            return verifyUser((request, context, user) =>
                handler(request, ctx, undefined, user)
            )(req, ctx);
        }
    }
}