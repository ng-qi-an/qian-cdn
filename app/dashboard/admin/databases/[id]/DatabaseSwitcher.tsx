'use client';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DatabaseSwitcher({otherDbs, dbId, dbName}: {otherDbs: {label: string, value: string}[], dbId: string, dbName: string}){
    const router = useRouter();
    return <Combobox autoHighlight items={otherDbs} value={dbId} onValueChange={(val)=>{
        if (val != dbId) {
            router.push(`/dashboard/admin/databases/${val}`);
        }
    }}>
        <ComboboxTrigger nativeButton={false} render={<div className="flex items-center cursor-pointer">
            <span className="text-foreground">{dbName}</span>
            <Button variant="ghost" size="icon-xs" className="ml-2"><ChevronsUpDown/></Button>
        </div>}/>
        <ComboboxContent className="w-56">
            <ComboboxInput placeholder="Search applications..." showTrigger={false}/>
            <ComboboxEmpty>No other applications found</ComboboxEmpty>
            <ComboboxList>
                {(item) => (
                    <ComboboxItem key={item.value} value={item.value}>
                        {item.label}
                    </ComboboxItem>
                )}
            </ComboboxList>
        </ComboboxContent>
    </Combobox>
}