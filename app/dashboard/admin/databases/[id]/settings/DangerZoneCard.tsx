import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DangerZoneCard({appId}: {appId: string}){
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteInterval, setDeleteInterval] = useState<NodeJS.Timeout | null>(null);
    const [deleteCountdown, setDeleteCountdown] = useState(3);
    const router = useRouter();
    useEffect(()=>{
        (async()=> {
            if (deleteCountdown <= 0){
                clearInterval(deleteInterval!);
                try {
                    const response = await fetch(`/api/dashboard/applications/delete`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({appId})
                    });
                    const responseData = await response.json();
                    if (!response.ok){
                        console.log("Error deleting application:", response);
                        return toast.add({
                            title: "Error deleting application",
                            description: responseData.message || "An error occurred while deleting the application. Please try again.",
                            type: "error"
                        })
                    }
                    toast.add({
                        title: "Application deleted",
                        description: "The application has been deleted successfully.",
                        type: "success"
                    })
                    router.push('/dashboard/applications');
                } catch (error) {
                    console.log("Error deleting application:", error);
                    return toast.add({
                        title: "Error deleting application",
                        description: "An error occurred while deleting the application. Please try again.",
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
                            <FieldLabel>Delete application</FieldLabel>
                            <FieldDescription>This action will permanently delete this application and all of its data.</FieldDescription>
                        </div>
                        <Button type="button" variant="destructive" className="ml-2" size="sm" onClick={() => setShowDeleteDialog(true)}>Delete</Button>
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                    <AlertDialogDescription className="text-wrap">All data including files, API keys & logs will be deleted <b>permanently</b>. Ensure you migrate your applications before continuing.</AlertDialogDescription>
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