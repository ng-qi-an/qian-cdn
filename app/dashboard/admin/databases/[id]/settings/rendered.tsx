'use client';

import { Database } from "@/lib/schema/schemaTypes";
import { convertFromBytesToSensible, convertUnit, Unit } from "@/lib/unitConverter";
import { useEffect, useState } from "react";
import GeneralSettingsCard from "./GeneralSettingsCard";
import UsageSettingsCard from "./UsageSettingsCard";
import { Button } from "@/components/ui/button";
import DangerZoneCard from "./DangerZoneCard";
import { toast } from "@/components/ui/toast";
import revalidateData from "@/lib/revalidateData";
import { useRouter } from "next/navigation";
import ServiceSettingsCard from "./ServiceSettingsCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
export default function DBSettingsRendered({dbData, otherDbs}:{dbData: Database & {files: {size: number}[] | null}, otherDbs: {name: string, id: string}[]}){
    const [name, setName] = useState(dbData.name);
    const [visibility, setVisibility] = useState(dbData.visibility);
    const convertedAppLimit = convertFromBytesToSensible(dbData.limit);
    const [limit, setLimit] = useState(convertedAppLimit.value.toString());
    const [limitUnit, setLimitUnit] = useState<Unit>(convertedAppLimit.value == 0 ? "gb" : convertedAppLimit.unit);
    const [usageAlert, setUsageAlert] = useState(dbData.alerts[0]?.toString() || "80");
    const [keys, setKeys] = useState(dbData.keys);
    const [changeMade, setChangeMade] = useState(false);
    const keysChanged = Object.keys({...dbData.keys, ...keys}).some((key) => keys[key] !== dbData.keys[key]);
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [showMigrationWarning, setShowMigrationWarning] = useState(false);

    useEffect(()=>{
        setChangeMade(name != dbData.name || visibility != dbData.visibility || keysChanged || limit != convertedAppLimit.value.toString() || (convertedAppLimit.value == 0 ? limitUnit != 'gb' : limitUnit != convertedAppLimit.unit) || usageAlert != (dbData.alerts[0] || "80"));
    }, [name, visibility, keys, limit, limitUnit, usageAlert])
    async function updateDatabase(){
        setSubmitting(true);
        try {
            const response = await fetch("/api/dashboard/databases/edit", {
                method: "PATCH",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    dbId: dbData.id,
                    visibility,
                    keys,
                    limit: convertUnit(Number(limit), limitUnit, "b"),
                    usageAlert: Number(usageAlert),
                })
            });
            const responseData = await response.json();
            setSubmitting(false);
            if (!response.ok){
                return toast.add({
                    title: "Error updating database",
                    description: responseData.message || "An unknown error occurred while updating your database.",
                    type: "error"
                })
            }
            toast.add({
                title: "Database saved",
                description: "Your database has been saved successfully.",
                type: "success",
            });
            await revalidateData(window.location.pathname);
            setChangeMade(false);
        } catch (error) {
            setSubmitting(false);
            console.log(error);
            return toast.add({
                title: "Error updating database",
                description: "An unknown error occurred while updating your database.",
                type: "error"
            })
        }
    }
    
    return <>
        <form className="flex flex-col h-full" onSubmit={async (e)=>{
            e.preventDefault();
            if (!name || name.trim() == ""){
                return toast.add({
                    title: "Invalid name",
                    description: "The application name cannot be empty.",
                    type: "error"
                })
            }
            if (keysChanged){
                return setShowMigrationWarning(true);
            }
            updateDatabase();
        }}>
            <div className="flex flex-col gap-4 pt-4 scroll-fade h-full overflow-auto pb-4">
                <GeneralSettingsCard dbId={dbData.id} otherDbs={otherDbs} name={name} setName={setName} visibility={visibility} setVisibility={setVisibility}/>
                <UsageSettingsCard limit={limit} setLimit={setLimit} limitUnit={limitUnit} setLimitUnit={setLimitUnit} usageAlert={usageAlert} setUsageAlert={setUsageAlert}/>
                <ServiceSettingsCard provider={dbData.provider} keys={keys} setKeys={setKeys}/>
                <DangerZoneCard dbId={dbData.id}/>
            </div>
            {changeMade && <div className="flex justify-between gap-2">
                <Button type="button" variant="secondary" disabled={submitting} onClick={async()=>{
                    setName(dbData.name);
                    setVisibility(dbData.visibility);
                    setKeys(dbData.keys);
                    const convertedAppLimit = convertFromBytesToSensible(dbData.limit);
                    setLimit(convertedAppLimit.value.toString());
                    setLimitUnit(convertedAppLimit.value == 0 ? "gb" : convertedAppLimit.unit);
                    setUsageAlert(dbData.alerts[0] || "80");
                    setChangeMade(false);
                }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>Save changes</Button>
            </div>}
        </form>
        <AlertDialog open={showMigrationWarning} onOpenChange={setShowMigrationWarning}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Data migration warning</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-destructive">Unified CDN does not check or migrate your data when you change your file service keys.</p>
                    <p className="text-sm text-muted-foreground">If necessary, ensure that you have migrated your data manually to the new bucket or account before proceeding.</p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={()=>{
                        setShowMigrationWarning(false);
                        updateDatabase();
                    }}>
                        I understand
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
}