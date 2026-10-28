'use client';
import { ApiKey } from "@better-auth/api-key"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Key } from "lucide-react"
import { useState } from "react";
import CreateKeyDialog from "./CreateKeyDialog";
import ApiKeyItem from "./ApiKeyItem";
import { apikey } from "@/lib/schema/auth-schema";

export default function KeysList({appId, apiKeys, disableCreate, showFooter=true}: {appId: string, apiKeys: Omit<typeof apikey.$inferSelect, "key">[], disableCreate?: boolean, showFooter?: boolean}){
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    return <>{apiKeys.length > 0 ? 
        <div className="overflow-auto grid grid-cols-1 gap-2">
            {apiKeys.map((key)=>{
                return <ApiKeyItem appId={appId} key={key.id} apiKey={key}/>
            })}
            {showFooter && <div className="flex items-center justify-between mt-2">
                <Button onClick={()=> setShowCreateDialog(true)} className="w-max" disabled={disableCreate}>Create API Key</Button>
                <p className="text-sm text-muted-foreground text-right">All expired keys are deleted automatically.</p>
            </div>}
        </div>
    : <Empty className="h-full">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <Key/>
            </EmptyMedia>
            <EmptyTitle>No API Keys</EmptyTitle>
            <EmptyDescription>
                You have not created any API keys for this application yet.
            </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button onClick={()=> setShowCreateDialog(true)} disabled={disableCreate}>Create API Key</Button>
        </EmptyContent>
    </Empty>}
    <CreateKeyDialog appId={appId} isOpen={showCreateDialog} onOpenChange={setShowCreateDialog}/>
    </>
}