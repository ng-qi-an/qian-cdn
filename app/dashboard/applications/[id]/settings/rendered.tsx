'use client';

import { Application, Database } from "@/lib/schema/schemaTypes";
import { convertFromBytesToSensible, convertUnit, Unit } from "@/lib/unitConverter";
import { useEffect, useState } from "react";
import GeneralSettingsCard from "./GeneralSettingsCard";
import UsageSettingsCard from "./UsageSettingsCard";
import { Button } from "@/components/ui/button";
import DangerZoneCard from "./DangerZoneCard";
import { toast } from "@/components/ui/toast";
import revalidateData from "@/lib/revalidateData";
import { useRouter } from "next/navigation";
export default function AppSettingsRendered({appData, otherApps}:{appData: Application & {database: Omit<Database, "keys"> & {owner: {name: string, id: string} | null, files: {size: number}[] | null} | null}, otherApps: {name: string, id: string}[]}){
    const [name, setName] = useState(appData.name);
    const [description, setDescription] = useState(appData.description);
    const convertedAppLimit = convertFromBytesToSensible(appData.limit);
    const [limit, setLimit] = useState(convertedAppLimit.value.toString());
    const [limitUnit, setLimitUnit] = useState<Unit>(convertedAppLimit.value == 0 ? "gb" : convertedAppLimit.unit);
    const [usageAlert, setUsageAlert] = useState(appData.alerts[0]?.toString() || "80");
    const [changeMade, setChangeMade] = useState(false);
    const router = useRouter();

    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        if (name != appData.name || description != appData.description || limit != convertedAppLimit.value.toString() || (convertedAppLimit.value == 0 ? limitUnit != 'gb' : limitUnit != convertedAppLimit.unit) || usageAlert != (appData.alerts[0] || "80")){
            setChangeMade(true);
        }
    }, [name, description, limit, limitUnit, usageAlert])
    return <form className="flex flex-col h-full" onSubmit={async (e)=>{
        e.preventDefault();
        if (!name || name.trim() == ""){
            return toast.add({
                title: "Invalid name",
                description: "The application name cannot be empty.",
                type: "error"
            })
        }
        setSubmitting(true);
        try {
            const response = await fetch("/api/dashboard/applications/edit", {
                method: "PATCH",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    appId: appData.id,
                    description: description.trim() || "No description provided.",
                    limit: convertUnit(Number(limit), limitUnit, "b"),
                    usageAlert: Number(usageAlert),
                })
            });
            const responseData = await response.json();
            setSubmitting(false);
            if (!response.ok){
                return toast.add({
                    title: "Error updating application",
                    description: responseData.message || "An unknown error occurred while updating your application.",
                    type: "error"
                })
            }
            toast.add({
                title: "Application saved",
                description: "Your application has been saved successfully.",
                type: "success",
            });
            await revalidateData(window.location.pathname);
            setChangeMade(false);
        } catch (error) {
            setSubmitting(false);
            console.log(error);
            return toast.add({
                title: "Error updating application",
                description: "An unknown error occurred while updating your application.",
                type: "error"
            })
        }
    }}>
        <div className="flex flex-col gap-4 pt-4 scroll-fade h-full overflow-auto pb-4">
            <GeneralSettingsCard appId={appData.id} otherApps={otherApps} database={appData.database} name={name} setName={setName} description={description} setDescription={setDescription}/>
            <UsageSettingsCard limit={limit} setLimit={setLimit} dbLimit={appData.database?.limit} limitUnit={limitUnit} setLimitUnit={setLimitUnit} usageAlert={usageAlert} setUsageAlert={setUsageAlert}/>
            <DangerZoneCard appId={appData.id}/>
        </div>
        {changeMade && <div className="flex justify-between gap-2">
            <Button type="button" variant="secondary" disabled={submitting} onClick={async()=>{
                setName(appData.name);
                setDescription(appData.description);
                const convertedAppLimit = convertFromBytesToSensible(appData.limit);
                setLimit(convertedAppLimit.value.toString());
                setLimitUnit(convertedAppLimit.value == 0 ? "gb" : convertedAppLimit.unit);
                setUsageAlert(appData.alerts[0] || "80");
                setChangeMade(false);
            }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>Save changes</Button>
        </div>}
    </form>
}