'use client';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { User } from "better-auth";
import { Ban, Copy, Key, Trash } from "lucide-react";
import ChangePasswordDialog from "../dialogs/ChangePasswordDialog";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import BanUserDialog from "../dialogs/BanUserDialog";
import revalidateData from "@/lib/revalidateData";
import { user as userSchema } from "@/lib/schema/auth-schema";
import DeleteUserDialog from "../dialogs/DeleteUserDialog";

export default function UserActions({user, currentUser}: {user: typeof userSchema.$inferSelect, currentUser: User}){
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
    const [banUserDialogOpen, setBanUserDialogOpen] = useState(false);
    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
    return <div className="space-y-2 mt-4">
        <Button className="w-full" size="sm" variant="outline" onClick={()=> setChangePasswordDialogOpen(true)}><Key/> Change password</Button>
        <ChangePasswordDialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen} userId={user.id}/>
        <Button className="w-full" size="sm" variant="outline" onClick={()=>{
            navigator.clipboard.writeText(user.id)
            toast.add({
                title: "Copied to clipboard",
                type: "success",
            })
        }}><Copy/> Copy User ID</Button>
        <Separator className="my-2"/>
        {user.banned ? <Button className="w-full" size="sm" variant="destructive" onClick={async()=>{
            const {error} = await authClient.admin.unbanUser({
                userId: user.id,
            });
            if (error) {
                return toast.add({
                    title: "Error unbanning user",
                    description: error.message,
                    type: "error",
                })
            }
            toast.add({
                title: "Success",
                description: "The user has been unbanned successfully.",
                type: "success",
            })
            await revalidateData(window.location.pathname)
        }}>
           <Ban/> Unban
        </Button>
        : <>
            <Button disabled={user.id === currentUser.id} className="w-full" size="sm" variant="destructive" onClick={()=> setBanUserDialogOpen(true)}><Ban/> Ban</Button>
            <BanUserDialog open={banUserDialogOpen} onOpenChange={setBanUserDialogOpen} userId={user.id}/>
        </>}
        <Button disabled={user.id === currentUser.id} className="w-full" size="sm" variant="destructive" onClick={()=> setDeleteUserDialogOpen(true)}><Trash/> Delete</Button>
        <DeleteUserDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen} userId={user.id}/>
        
    </div>
}