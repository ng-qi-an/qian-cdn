import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Ellipsis, Key, Pen, Trash } from "lucide-react"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import KeyDialogContent from "./KeyDialogContent";
import { toast } from "@/components/ui/toast";
import { ApiKey } from "@better-auth/api-key";
import { formatLocalDateTime } from "@/lib/time";
import revalidateData from "@/lib/revalidateData";
import { usePathname } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apikey } from "@/lib/schema/auth-schema";

export default function ApiKeyItem({apiKey, appId}: {apiKey: Omit<typeof apikey.$inferSelect, "key">, appId: string}){
    const { resolvedTheme } = useTheme();
    const [rendered, setRendered] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [name, setName] = useState(apiKey.name);
    const [hasExpiry, setHasExpiry] = useState(!!apiKey.expiresAt);
    const [expiryDate, setExpiryDate] = useState(apiKey.expiresAt ? formatLocalDateTime(new Date(apiKey.expiresAt)) : formatLocalDateTime(new Date()));
    const pathname = usePathname();
    useEffect(()=>{
        setRendered(true);
    }, [])
    return rendered && <>
        <Item variant={resolvedTheme == "light" ? "outline" : "muted"}>
            <ItemMedia variant="icon">
                <Key/>
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{apiKey.name}</ItemTitle>
                <ItemDescription>Created on {new Date(apiKey.createdAt).toLocaleString(undefined, {month: "numeric", day: "numeric", year: "numeric", hour: "2-digit", hour12: true, minute: "2-digit"})}{apiKey.expiresAt && `. Expires on ${new Date(apiKey.expiresAt).toLocaleString(undefined, {month: "numeric", day: "numeric", year: "numeric", hour: "2-digit", hour12: true, minute: "2-digit"})}`}</ItemDescription>
            </ItemContent>
            <ItemActions>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm">
                        <Ellipsis/>
                    </Button>}/>
                    <DropdownMenuContent>
                            <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setShowEditDialog(true)}><Pen/> Edit</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash/> Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </ItemActions>
        </Item>
        
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
                <form className="contents" onSubmit={async (e)=>{
                    e.preventDefault();
                    if (!name || hasExpiry && !expiryDate) {
                        return toast.add({
                            title: "Error editing API key",
                            description: "Please fill in all required fields.",
                            type: "error",
                        })
                    }
                    if (hasExpiry && new Date(expiryDate).getTime() <= Date.now()) {
                        return toast.add({
                            title: "Error editing API key",
                            description: "Expiry date must be in the future.",
                            type: "error",
                        })
                    }
                    try {
                        const response = await fetch('/api/dashboard/applications/api-keys/edit', {
                            method: 'POST',
                            body: JSON.stringify({
                                name,
                                keyId: apiKey.id,
                                hasExpiry,
                                expiryDate: hasExpiry ? new Date(expiryDate).toISOString() : null,
                                appId
                            }),
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                        })
                        const data = await response.json();
                        if (!response.ok) {
                            return toast.add({
                                title: "Error editing API key",
                                description: data?.message || "An unknown error occurred.",
                                type: "error",
                            })
                        }
                        setShowEditDialog(false);
                        await revalidateData(pathname);
                    } catch (error) {
                        console.error(error)
                        toast.add({
                            title: "Error creating API key",
                            description: error instanceof Error ? error.message : "An unknown error occurred.",
                            type: "error",
                        })
                    }
                }}>
                    <DialogHeader>
                        <DialogTitle>Edit key</DialogTitle>
                    </DialogHeader>
                    <KeyDialogContent name={name || "Untitled"} setName={setName} hasExpiry={hasExpiry} setHasExpiry={setHasExpiry} expiryDate={expiryDate} setExpiryDate={setExpiryDate}/>
                    <DialogFooter>
                        <Button type="button" variant="secondary">Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this API key?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. Make sure to migrate your apps first, or they will stop working.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={async()=>{
                        setShowDeleteDialog(false);
                        const response = await fetch('/api/dashboard/applications/api-keys/delete', {
                            method: 'DELETE',
                            body: JSON.stringify({ keyId: apiKey.id }),
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                        })
                        try {
                            const data = await response.json();
                            if (!response.ok) {
                                return toast.add({
                                    title: "Error deleting API key",
                                    description: data?.message || "An unknown error occurred.",
                                    type: "error",
                                })
                            }
                            await revalidateData(pathname);
                        } catch (error) {
                            console.error(error)
                            toast.add({
                                title: "Error deleting API key",
                                description: error instanceof Error ? error.message : "An unknown error occurred.",
                                type: "error",
                            })
                        }
                    }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
}