'use client';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { fileCategories } from "@/lib/fileTypes";
import { convertFromBytesToSensible } from "@/lib/unitConverter";
import { Label, Pie, PieChart } from "recharts"

export default function FilesByTypeChart({files, showByLimit, limit}: {files: {contentType: string, size: number}[], showByLimit: boolean, limit: number}){
    const chartConfig = {
        size: {
            label: "Size",
        },
        images: {
            label: "Images",
            color: "var(--chart-1)",
        },
        text: {
            label: "Text",
            color: "var(--chart-2)",
        },
        documents: {
            label: "Documents",
            color: "var(--chart-3)",
        },
        other: {
            label: "Other",
            color: "var(--chart-4)",
        },
        ...(showByLimit && limit > 0 ? {
            available: {
                label: "Available",
                color: "var(--secondary)",
            }
        } : {})
    } satisfies ChartConfig
    if (limit > 0){
    }
    const totalFileSize = files.reduce((acc, file)=> acc + file.size, 0)
    const totalConvertedFileSize = convertFromBytesToSensible(totalFileSize)
    const filesByType: Record<string, typeof files> = {
        images: [],
        text: [],
        documents: [],
        other: [],
    ...(showByLimit && limit > 0 ? {
        available: [{
            contentType: "available",
            size: limit - totalFileSize
        }]
    } : {})
    }
    files.map((file)=>{
        if (fileCategories.images.includes(file.contentType)){
            filesByType["images"].push(file)
        } else if (fileCategories.text.includes(file.contentType)){
            filesByType["text"].push(file)
        } else if (fileCategories.documents.includes(file.contentType)){
            filesByType["documents"].push(file)
        } else {
            filesByType["other"].push(file)
        }
    })
    const chartData = Object.entries(filesByType).map((fileTypeFiles)=>{
        const [fileType, files] = fileTypeFiles
        return {
            normalisedType: fileType,
            size: files.reduce((acc, file)=> acc + file.size, 0),
            fill: `var(--color-${fileType})`,
        }
    })
    return <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full"
    >
        <PieChart>
            <ChartTooltip
                cursor={false}
                content = {
                    <ChartTooltipContent
                        formatter={(value, name) => {
                            const size = convertFromBytesToSensible(value as number)
                            return <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                                {chartConfig[name as keyof typeof chartConfig]?.label || name}
                                <div className="ml-auto flex items-baseline gap-0.5 font-medium text-foreground">
                                    {size.value.toFixed(2)}
                                    <span className="font-normal text-muted-foreground">
                                        {size.unit.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        }}
                        hideLabel
                    />
                }
            />
            <Pie
                data={chartData}
                dataKey="size"
                nameKey="normalisedType"
                innerRadius={"60%"}
                strokeWidth={5}
            >
                <Label
                    content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                                <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                >
                                <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                >
                                    {(showByLimit && limit > 0) ? ((totalFileSize/limit) * 100).toFixed(2) + "%" : totalConvertedFileSize.value.toFixed(2)}
                                </tspan>
                                <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                >
                                    {(showByLimit && limit > 0) ? <>used ({totalConvertedFileSize.value.toFixed(2)} {totalConvertedFileSize.unit.toUpperCase()})</> : totalConvertedFileSize.unit.toUpperCase()}
                                </tspan>
                                </text>
                            )
                        }
                    }}
                />
            </Pie>
        </PieChart>
    </ChartContainer>
}

