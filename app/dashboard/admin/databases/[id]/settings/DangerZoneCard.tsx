import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DangerZoneCard({dbId}: {dbId: string}){
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteInterval, setDeleteInterval] = useState<NodeJS.Timeout | null>(null);
    const [deleteCountdown, setDeleteCountdown] = useState(3);
    const router = useRouter();
    useEffect(()=>{
        (async()=> {
            if (deleteCountdown <= 0){
                clearInterval(deleteInterval!);
                try {
                    const response = await fetch(`/api/dashboard/databases/delete`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({dbId})
                    });
                    const responseData = await response.json();
                    if (!response.ok){
                        console.log("Error deleting database:", response);
                        return toast.add({
                            title: "Error deleting database",
                            description: responseData.message || "An error occurred while deleting the database. Please try again.",
                            type: "error"
                        })
                    }
                    toast.add({
                        title: "Database deleted",
                        description: "The database has been deleted successfully.",
                        type: "success"
                    })
                    router.push('/dashboard/admin/databases');
                } catch (error) {
                    console.log("Error deleting database:", error);
                    return toast.add({
                        title: "Error deleting database",
                        description: "An error occurred while deleting the database. Please try again.",
                        type: "error"
                    })
                }
            }
        })();
    }, [deleteCountdown])
    return <>
        <Card id="danger-zone" className="shrink-0">
            <CardHeader>
                <CardTitle>Danger zone</CardTitle>
                <CardDescription>Perform irreversible actions here</CardDescription>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field orientation="horizontal">
                        <div className="w-full">
                            <FieldLabel>Delete database</FieldLabel>
                            <FieldDescription>This action will permanently delete this database and all of its data.</FieldDescription>
                        </div>
                        <Button type="button" variant="destructive" className="ml-2" size="sm" onClick={() => setShowDeleteDialog(true)}>Delete</Button>
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this database?</AlertDialogTitle>
                    <AlertDialogDescription className="text-wrap">All data including all applications and files will be deleted <b>permanently</b>, even from your file storage. <br/>Ensure all users have migrated off this database before continuing.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction disabled={deleteCountdown <= 0} variant={deleteInterval ? "destructive" : 'outline'} className={!deleteInterval ? `border-destructive` : ""} onMouseDown={()=>{
                        clearInterval(deleteInterval!);
                        setDeleteInterval(setInterval(()=>{
                            setDeleteCountdown((prev)=> prev - 1);
                        }, 1000))
                    }} onMouseUp={()=>{
                        clearInterval(deleteInterval!);                    
                        if (deleteCountdown > 0){
                            setDeleteInterval(null);
                            setDeleteCountdown(3);
                        }
                    }} onMouseLeave={()=> {
                        clearInterval(deleteInterval!);
                        if (deleteCountdown > 0){
                            setDeleteInterval(null);
                            setDeleteCountdown(3);
                        }
                    }}>
                        {deleteInterval ? deleteCountdown <= 0 ? "Deleting.." : `Keep holding.. ${deleteCountdown}` :  'Hold to delete'}
                    </AlertDialogAction>
                    <AlertDialogCancel variant="default">
                        Cancel
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
}