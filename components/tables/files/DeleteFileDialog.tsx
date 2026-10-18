'use client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import revalidateData from "@/lib/revalidateData";
import { useState } from "react";

export default function DeleteFileDialog({fileId, open, onOpenChange}: {fileId: string, open: boolean, onOpenChange: (open: boolean) => void}) {
    const [submitting, setSubmitting] = useState(false);
    return <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. Make sure to migrate your application off this file before continuing.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction disabled={submitting} variant="destructive" onClick={async()=>{
                    setSubmitting(true);
                    try {
                        const response = await fetch(`/api/files/${fileId}/delete`, {
                            method: "DELETE"
                        })
                        if (!response.ok){
                            console.error("Error deleting file:", response);
                            setSubmitting(false);
                            return toast.add({
                                title: "Error deleting file",
                                description: "An error occurred while deleting the file. Please try again.",
                                type: "error"
                            })
                        }
                        await revalidateData(window.location.pathname);
                        onOpenChange(false);
                    } catch (error) {
                        console.error("Error deleting file:", error);
                        toast.add({
                            title: "Error deleting file",
                            description: "An error occurred while deleting the file. Please try again.",
                            type: "error"
                        })
                    } finally {
                        setSubmitting(false);
                    }
                }}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}