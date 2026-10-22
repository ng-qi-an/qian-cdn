'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DeleteUserDialog({onConfirm, open, onOpenChange}: {onConfirm: () => void, open: boolean, onOpenChange: (open: boolean) => void}){

    return <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                <AlertDialogDescription className="text-wrap">
                    This will permanently delete the user and all of their applications, databases, and files. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel type="button">
                    Close
                </AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={()=> onConfirm()}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}