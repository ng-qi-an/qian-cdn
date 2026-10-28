import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "./db";
import { admin } from "better-auth/plugins"
import * as schema from "./schema/auth-schema";
import { ac, adminRole, superAdminRole, userRole, viewOnlyRole } from "./permissions/permissions";
import { apiKey } from "@better-auth/api-key";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    trustedOrigins: process.env.NEXT_PUBLIC_TRUSTED_ORIGINS?.split(",") || [],
    emailAndPassword: { 
        enabled: true, 
        revokeSessionsOnPasswordReset: true, 
        disableSignUp: process.env.NEXT_PUBLIC_ALLOW_SIGNUP == "false" ? true : false,
    }, 
    user: {
        additionalFields: {

        }
    },
    session: {
        additionalFields: {
            countryCode: {
                type: "string",
                required: false,
                input: false,
            },
            countryName: {
                type: "string",
                required: false,
                input: false,
            },
            cityName: {
                type: "string",
                required: false,
                input: false,
            },
            latitude: {
                type: "string",
                required: false,
                input: false,
            },
            longitude: {
                type: "string",
                required: false,
                input: false,
            },
        }
    },
    databaseHooks: {
        session: {
            create: {
                before: async(session, ctx) => {
                    console.log("Session created, fetching location data for IP:", session.ipAddress)
                    try {
                        const response = await fetch(`https://ip.hackclub.com/ip/${session.ipAddress}`)
                        if (response.ok){
                            const data = await response.json()
                            return {
                                data: {
                                    ...session,
                                    countryCode: data.country_iso_code,
                                    countryName: data.country_name,
                                    cityName: data.city_name,
                                    latitude: data.latitude,
                                    longitude: data.longitude,
                                },
                            }
                        } else {
                            console.log("Error fetching location data when making sesssion:", response.statusText)
                        }
                    } catch (error) {
                        console.log("Error fetching location data when making sesssion:", error)
                    }
                    return { data: session }
                }
            }
        }
    },
    plugins: [
        admin({
            ac,
            roles: {
                superAdmin: superAdminRole,
                admin: adminRole,
                user: userRole,
                viewOnly: viewOnlyRole
            }
        }),
        apiKey([
            {
                configId: "default",
                defaultPrefix: "uni_",
                keyExpiration: {
                    minExpiresIn: 0,
                },
                enableMetadata: true,
            }
        ])
    ]
});
