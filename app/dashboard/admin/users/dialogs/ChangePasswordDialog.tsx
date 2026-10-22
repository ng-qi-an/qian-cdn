import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { generateId } from "better-auth";
import { Copy, RefreshCcw } from "lucide-react";
import { useState } from "react";

export default function ChangePasswordDialog({onConfirm, open, onOpenChange}: {onConfirm: (password: string, revokeSessions: boolean) => void, open: boolean, onOpenChange: (open: boolean) => void}){
    const [password, setPassword] = useState("");
    const [revokeSessions, setRevokeSessions] = useState(true);
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <form className="contents" onSubmit={(e)=>{
                e.preventDefault();
                onConfirm(password, revokeSessions);
            }}>
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                    <Field>
                        <FieldLabel>New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput required type="text" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton onClick={()=>{
                                    setPassword(generateId(10).toUpperCase())
                                }}>
                                    <RefreshCcw/>
                                </InputGroupButton>
                                <InputGroupButton onClick={()=>{
                                    navigator.clipboard.writeText(password)
                                    toast.add({
                                        title: "Copied to clipboard",
                                        type: "success",
                                    })
                                }}>
                                    <Copy/>
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription>This password will not be shown again. Copy it first.</FieldDescription>
                    </Field>
                    <Field orientation="horizontal">
                        <FieldLabel htmlFor="revokeSessionsCheck">Revoke sessions</FieldLabel>
                        <Checkbox id="revokeSessionsCheck" required checked={revokeSessions} onCheckedChange={(x) => setRevokeSessions(x)}/>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Confirm
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}