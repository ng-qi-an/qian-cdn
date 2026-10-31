import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GeneralSettingsCard({otherDbs, dbId, name, setName, visibility, setVisibility}: {dbId: string, otherDbs: {name: string, id: string}[], name: string, setName: (name: string) => void, visibility: string, setVisibility: (visibility: string) => void}){
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
                    {otherDbs.find((x) => x.name == name.trim() && x.id != dbId) ? <FieldError>A database with this name already exists.</FieldError> : <FieldDescription>This must be unique from other databases.</FieldDescription>}
                </Field>
                <Field>
                    <FieldLabel>Visibility</FieldLabel>
                    <Select items={[{label: "Public", value: "public"}, {label: "Private", value: "private"}]} onValueChange={(value)=> setVisibility(value!)} value={visibility} required>
                        <SelectTrigger>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldDescription>{visibility == "public" ? "All users can view and use this database. Only you can edit it." : "Only you and super admins can use and edit this database. Existing applications remain connected."} </FieldDescription>
                </Field>
            </FieldGroup>
        </CardContent>
    </Card>
}