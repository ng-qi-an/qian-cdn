'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { formatLocalDateTime } from "@/lib/time";
import { useEffect, useState } from "react";

export default function BanUserDialog({onConfirm, open, onOpenChange}: {onConfirm: (reason: string, expiryDate: Date | null) => void, open: boolean, onOpenChange: (open: boolean) => void}){
    const [reason, setReason] = useState("No reason provided.");
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState(formatLocalDateTime(new Date()));
    useEffect(()=>{
        if (open){
            setReason("No reason provided.");
            setHasExpiry(false);
            setExpiryDate(formatLocalDateTime(new Date()));
        }
    }, [open])
    return <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <form className="contents" onSubmit={(e)=>{
                e.preventDefault();
                if (hasExpiry && expiryDate && new Date(expiryDate).getTime() <= Date.now()) {
                    return toast.add({
                        title: "Error banning user",
                        description: "Expiry date must be in the future.",
                    })
                }
                onConfirm(reason, hasExpiry ? new Date(expiryDate) : null);
            }}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Ban user</AlertDialogTitle>
                    <AlertDialogDescription className="text-wrap">
                        This will prevent them from signing in to their account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Reason</FieldLabel>
                        <Input type="text" placeholder="No reason provided." value={reason} onChange={(e) => setReason(e.target.value)}/>
                    </Field>
                    <Field orientation="horizontal">
                        <div className="w-full space-y-1">
                            <FieldLabel htmlFor="expiryCheckbox">Expires</FieldLabel>
                            <FieldDescription >Enables a timed-based ban.</FieldDescription>
                        </div>
                        <Checkbox id={"expiryCheckbox"} checked={hasExpiry} onCheckedChange={(x)=> setHasExpiry(x)} />
                    </Field>
                    {hasExpiry && <Field>
                        <FieldLabel>Expiry date</FieldLabel>
                        <Input required type="datetime-local" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}/>
                        <FieldDescription>The user will be unbanned after this date.</FieldDescription>
                    </Field>}
                </FieldGroup>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button">
                        Close
                    </AlertDialogCancel>
                    <AlertDialogAction variant="destructive" type="submit">
                        Confirm Ban
                    </AlertDialogAction>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>
}