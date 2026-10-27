'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteUserDialog({userId, open, onOpenChange}: {userId: string, open: boolean, onOpenChange: (open: boolean) => void}){
    const [showDeleteUserResult, setShowDeleteUserResult] = useState(false);
    const [deleteUserResult, setDeleteUserResult] = useState<{status: string, message: string, details?: {status: string, message: string}[]} | null>();
    const router = useRouter();
    return <>
        <AlertDialog open={open} onOpenChange={onOpenChange}>
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
                    <AlertDialogAction variant="destructive" onClick={()=> {
                        onOpenChange(false);
                        toast.promise((async() => {
                            const response = await fetch(`/api/dashboard/users/delete`, {
                                method: "DELETE",
                                body: JSON.stringify({
                                    userId: userId,
                                }),
                                headers: {
                                    "Content-Type": "application/json",
                                }
                            });
                            const data = await response.json();
                            if (response.status == 500){
                                if (data.error == "FAILED_DELETE_DB_OBJECTS" || data.error == "FAILED_DELETE_USER"){
                                    setShowDeleteUserResult(true);
                                    setDeleteUserResult({status: "error", ...data});
                                    throw new Error("Some databases/applications could not be deleted. Check details for exact failures.");
                                } else {
                                    throw new Error(data.message || "Unknown error");
                                }
                            } else if (response.ok){
                                setDeleteUserResult(data);
                                if (data.details.some((r: {status: string, message: string}) => r.status === "warning")){
                                    return setShowDeleteUserResult(true);
                                }
                                router.push("/dashboard/admin/users");
                            } else {
                                throw new Error(data.message || "Unknown error");
                            }
                        })(), {
                            loading: "Deleting user...",
                            success: "User deleted successfully.",
                            error: "Error from deleting user.",
                        })
                    }}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <Dialog open={showDeleteUserResult} onOpenChange={setShowDeleteUserResult}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{deleteUserResult?.status == "success" ? "User deleted successfully" : "Error deleting user"}</DialogTitle>
                    <DialogDescription>{deleteUserResult?.message}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <p className="text-muted-foreground">Additional details:</p>
                    {deleteUserResult?.details?.map((detail, index)=> {
                        return <p key={index} className="gap-1">
                            <span className="font-semibold">{detail.status.toUpperCase()}:</span> {detail.message}
                        </p>
                    })}
                </div>
                <DialogFooter>
                    <Button onClick={()=> {setShowDeleteUserResult(false); router.push("/dashboard/admin/users")}}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}