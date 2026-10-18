import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import UsageBar from "@/components/UsageBar";
import { Application, Database } from "@/lib/schema/schemaTypes";
import { availableServices } from "@/lib/services";
import { DatabaseIcon, Eye, Lock, User } from "lucide-react";

export default function GeneralSettingsCard({otherApps, appId, database, name, setName, description, setDescription}: {appId: string, otherApps: {name: string, id: string}[], database: Omit<Database, "keys"> & {owner: {name: string, id: string} | null, files: {size: number}[] | null} | null, name: string, setName: (name: string) => void, description: string, setDescription: (description: string) => void}){
    const selectedDbProvider = database ? availableServices.find((provider) => provider.id === database.provider) : null;
    return <Card className="shrink-0">
        <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Information about your application</CardDescription>
        </CardHeader>
        <CardContent>
            <FieldGroup>
                <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Untitled application"/>
                    {otherApps.find((x) => x.name == name.trim() && x.id != appId) ? <FieldError>An application with this name already exists.</FieldError> : <FieldDescription>This must be unique from other applications.</FieldDescription>}
                </Field>
                <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="No description provided."/>
                </Field>
                <Field>
                    <FieldLabel>Database details</FieldLabel>
                    {database && <Item variant="outline" className="mt-3">
                        <ItemMedia variant="icon">
                            {selectedDbProvider ? <selectedDbProvider.icon className="size-6"/> : <DatabaseIcon className="size-6"/>}
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>
                                {database.name}
                                <Tooltip>
                                    <TooltipTrigger render={database.visibility == "public" ? <Eye className="size-3 text-muted-foreground"/> : <Lock className="size-3 text-muted-foreground"/>}/>
                                    <TooltipContent>
                                        <span className='capitalize'>{database.visibility}</span>
                                    </TooltipContent>
                                </Tooltip>
                                <Badge variant="outline" className="border px-1 py-0.5">
                                    <User data-icon="inline-start"/>
                                    {database.owner?.name || "Unknown user"}
                                </Badge>
                            </ItemTitle>
                            <div className="mt-1">
                                <UsageBar files={database.files || []} limit={database.limit || 0} alerts={database.alerts}/>
                            </div>
                        </ItemContent>
                    </Item>}
                </Field>
            </FieldGroup>
        </CardContent>
    </Card>
}