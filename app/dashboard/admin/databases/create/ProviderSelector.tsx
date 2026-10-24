'use client';
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemHeader, ItemMedia } from "@/components/ui/item"
import { availableServices } from "@/lib/services"
import { cn } from "cn"

export default function ProviderSelector({value, onChange, disabled, className}: {value: string, onChange: (value: string) => void, disabled?: boolean, className?: string}){
    return <div className={cn("grid grid-cols-1 mt-2 gap-2", className)}>
        {availableServices.map((service, index)=>{
            return <Item onClick={()=> onChange(service.id)} key={index} variant="outline" className={`${service.id == value ? "border-primary bg-muted cursor-default" : `${disabled ? "opacity-50" : "hover:border-primary/30 cursor-pointer hover:bg-muted/50"}`}`}>
                <ItemMedia variant={"icon"}>
                    <service.icon className="size-6"/>
                </ItemMedia>
                <ItemContent>
                    <ItemHeader>{service.name}</ItemHeader>
                    {/* <ItemDescription><a href={service.href} target="_blank" onClick={(e) => e.stopPropagation()} rel="noopener noreferrer">{service.href}</a></ItemDescription> */}
                </ItemContent>
                <ItemActions>
                    <Button size="xs" disabled={service.id == value || disabled} variant={service.id == value ? "secondary" : "secondary"}>{service.id == value ? "Selected" : "Select"}</Button>
                </ItemActions>
            </Item>
        })}
    </div>
}