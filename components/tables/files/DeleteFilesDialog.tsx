'use client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import revalidateData from "@/lib/revalidateData";
import { useState } from "react";

export default function DeleteFilesDialog({fileIds, appId, open, onOpenChange}: {fileIds: string[], appId: string, open: boolean, onOpenChange: (open: boolean) => void}) {
    const [submitting, setSubmitting] = useState(false);
    return <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete {fileIds.length} file{fileIds.length != 1 && "s"}?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. Make sure to migrate your application before continuing.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction disabled={submitting} variant="destructive" onClick={async()=>{
                    setSubmitting(true);
                    try {
                        const response = await fetch(`/api/files/delete`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({files: fileIds, appId: appId})
                        })
                        if (!response.ok){
                            console.error("Error deleting files:", response);
                            setSubmitting(false);
                            try {
                                const error = await response.json();
                                return toast.add({
                                    title: "Error deleting files",
                                    description: error.message,
                                    type: "error"
                                })
                            } catch (error) {
                                console.error("Error showing toast:", error);
                                return toast.add({
                                    title: "Error deleting files",
                                    description: "An error occurred while deleting these files. Please try again.",
                                    type: "error"
                                })
                            }
                        }
                        await revalidateData(window.location.pathname);
                        onOpenChange(false);
                    } catch (error) {
                        console.error("Error deleting files:", error);
                        toast.add({
                            title: "Error deleting files",
                            description: "An error occurred while deleting these files. Please try again.",
                            type: "error",
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