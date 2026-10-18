'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import revalidateData from "@/lib/revalidateData";
import { useState } from "react";

export default function RenameFileDialog({currentName, fileId, open, onOpenChange}: {currentName: string, fileId: string, open: boolean, onOpenChange: (open: boolean) => void}) {
    const [name, setName] = useState(currentName);
    const [submitting, setSubmitting] = useState(false);
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <form className="contents" onSubmit={async(e) => {
                e.preventDefault();
                if (!name || name.trim() === ""){
                    return
                }
                setSubmitting(true);
                try {
                    const response = await fetch(`/api/files/${fileId}/rename`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({ name })
                    })
                    if (!response.ok){
                        console.error("Error renaming file:", response);
                        setSubmitting(false);
                        return toast.add({
                            title: "Error renaming file",
                            description: "An error occurred while renaming the file. Please try again.",
                            type: "error"
                        })
                    }
                    await revalidateData(window.location.pathname);
                    onOpenChange(false);
                } catch (error) {
                    console.error("Error renaming file:", error);
                    toast.add({
                        title: "Error renaming file",
                        description: "An error occurred while renaming the file. Please try again.",
                        type: "error"
                    })
                } finally {
                    setSubmitting(false);
                }
            }}>
                <DialogHeader>
                    <DialogTitle>Rename file</DialogTitle>
                </DialogHeader>
                <Field>
                    <FieldLabel>File name</FieldLabel>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Untitled file" required/>
                </Field>
                <DialogFooter>
                    <Button variant="secondary" disabled={submitting} onClick={() => onOpenChange(false)} type="button">Cancel</Button>
                    <Button type="submit" disabled={submitting}>Confirm</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}