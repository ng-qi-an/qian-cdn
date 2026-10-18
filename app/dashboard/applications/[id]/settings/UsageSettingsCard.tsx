import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { convertUnit, Unit } from "@/lib/unitConverter";

export default function UsageSettingsCard({limit, setLimit, dbLimit, limitUnit, setLimitUnit, usageAlert, setUsageAlert}: {limit: string, dbLimit?: number, setLimit: (limit: string) => void, limitUnit: string, setLimitUnit: (unit: Unit) => void, usageAlert: string, setUsageAlert: (alert: string) => void}){
    return <Card className="shrink-0">
        <CardHeader>
            <CardTitle>Usage limits</CardTitle>
            <CardDescription>Control the storage limits of this application</CardDescription>
        </CardHeader>
        <CardContent>
            <FieldGroup>
                <Field>
                    <FieldLabel>App limits</FieldLabel>
                    <div className="flex items-center">
                        <Slider max={100} step={0.5} value={Number(limit)} onValueChange={(value)=> setLimit(value.toString())} />
                        <Input value={limit} onChange={(e)=> setLimit(Number(e.target.value) >= 0 ? e.target.value.replace(/^0+(?=\d)/, "") : 0 || "0")} className="w-14 text-center mx-2"/>
                        <Select items={[{label: "GB", value: "gb"}, {label: "MB", value: "mb"}, {label: "KB", value: "kb"}, {label: "B", value: "b"}]} onValueChange={(value)=> setLimitUnit(value! as Unit)} value={limitUnit}>
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gb">GB</SelectItem>
                                <SelectItem value="mb">MB</SelectItem>
                                <SelectItem value="kb">KB</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {dbLimit != undefined && dbLimit != 0 && dbLimit < convertUnit(Number(limit), limitUnit as Unit, "b") ? <FieldError>This is larger than the database limit, and may cause unexpected behavior regarding alerts.</FieldError> : <FieldDescription>{Number(limit) == 0 ? "The application will not have a size limit." : `The application will stop accepting files when it exceeds ${limit} ${limitUnit.toUpperCase()}.`}</FieldDescription>}
                </Field>
                <Field>
                    <FieldLabel>Limit alert</FieldLabel>
                    <div className="flex items-center">
                        <Slider max={100} step={1} value={Number(usageAlert)} onValueChange={(value)=> setUsageAlert(value.toString())} />
                        <Input value={usageAlert} onChange={(e)=> setUsageAlert(Math.max(0, Math.min(Number(e.target.value) || 0, 100)).toString() || "0")} className="w-14 text-center mx-2"/>
                        %
                    </div>
                    <FieldDescription>{Number(limit) * Number(usageAlert) == 0 ? "You will not receive any alerts." : `You will recieve alerts when the application exceeds ${((Number(usageAlert) / 100) * Number(limit)).toFixed(2)} ${limitUnit.toUpperCase()}.`}</FieldDescription>
                </Field>
            </FieldGroup>
        </CardContent>
    </Card>
}