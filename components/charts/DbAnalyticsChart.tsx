'use client';
import { Area, AreaChart, CartesianGrid, Label, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { AppAnalytics } from "@/lib/schema/schemaTypes";
import { getDateRange } from "@/lib/time";
import getGroupedAnalyticsChartData from "@/lib/actions/analytics/getGroupedAnalyticsChartData";
import { convertFromBytesToSensible } from "@/lib/unitConverter";

export default function DbAnalyticsChart({data, showLimit, limit, alerts, apps, createdAt, showOverall}: {data: AppAnalytics[], showLimit: boolean, limit: number, alerts: number[], apps: {id: string, name: string}[], createdAt: Date, showOverall?: boolean}){
    const chartConfig: ChartConfig = {}
    if (showOverall){
        chartConfig["total"] = {
            label: "Total",
            color: "var(--chart-1)",
        }
    } else {
      apps.map((app, index)=> {
          chartConfig[app.id] = {
              label: app.name,
              color: `var(--chart-${(index % 5) + 1})`, 
          }
      })
    }
    if (!process.env.NEXT_PUBLIC_TIMEZONE){
      return <p>TIMEZONE NOT SET</p>
    }
    console.log("Chart config", chartConfig)
    const {start, end} = getDateRange(new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000), 30, process.env.NEXT_PUBLIC_TIMEZONE)
    if (createdAt.getTime() > start.getTime()){
        start.setTime(createdAt.getTime())
    }
    console.log("Start date:", start, "End date:", end, "Created at:", createdAt)
    let chartData = getGroupedAnalyticsChartData({data, timezone: process.env.NEXT_PUBLIC_TIMEZONE, startDate: start, endDate: end})
    if (showOverall){
      chartData = chartData.map((dataPoint)=> {
          return {date: dataPoint.date, total: Object.values(dataPoint).filter((value)=> typeof value === "number").reduce((acc, value)=> acc + (value as number), 0)}
      })
    }
    console.log("Chart data:", chartData)
    return <ChartContainer config={chartConfig} className="h-full max-h-[300px] w-full">
        <AreaChart accessibilityLayer data={chartData} responsive>
            <defs>
              {Object.keys(chartConfig).map((key)=> {
                return <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.2}
                  />
                </linearGradient>
              })}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            {showLimit && data[0]?.type == "size" && <YAxis 
              domain={[0, limit > 0 && showLimit ? limit : "auto"]}
              tickFormatter={(value) => {
                const formattedSize = convertFromBytesToSensible(value as number)
                return `${formattedSize.value.toFixed(2)} ${formattedSize.unit.toUpperCase()}`
              }}
              axisLine={false}
            />}
            <ChartTooltip
              cursor={false}
              content = {
                  <ChartTooltipContent
                      formatter={(value, name) => {
                          const size = convertFromBytesToSensible(value as number)
                          return <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                              <div style={{backgroundColor: `var(--color-${name})`}} className="size-3 mr-2"/>
                              {chartConfig[name as keyof typeof chartConfig]?.label || name}
                              <div className="ml-auto flex items-baseline gap-0.5 font-medium text-foreground">
                                  {data[0]?.type == "size" ? size.value.toFixed(2) : size.value}
                                  {data[0]?.type == "size" && <span className="font-normal text-muted-foreground">
                                      {size.unit.toUpperCase()}
                                  </span>}
                              </div>
                          </div>
                      }}
                      labelFormatter={(label)=>{
                        const date = new Date(label)
                        return date.toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                        })
                      }}
                  />
              }
            />
            {Object.keys(chartConfig).map((key)=> {
              return <Area
                key={key}
                dataKey={key}
                type="monotone"
                fill={`url(#fill${key})`}
                stroke={`var(--color-${key})`}
                stackId="a"
              />
            })}
            {data[0]?.type == "size" && alerts[0] && alerts[0] > 0 && showLimit && <ReferenceLine y={(alerts[0] / 100) * limit} stroke={'var(--primary)'} label={<Label position="insideTopRight" fill="var(--primary)" offset={10}>Limit alert</Label>} strokeDasharray={"3 3"}/>}
            {data[0]?.type == "size" && limit > 0 && showLimit && <ReferenceLine y={limit} stroke={'var(--destructive)'} label={<Label position="insideTopRight" fill="var(--destructive)" offset={10}>Limit</Label>} strokeDasharray={"4 3"}/>}
        </AreaChart>
    </ChartContainer>
}