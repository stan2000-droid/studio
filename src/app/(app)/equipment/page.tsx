
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, LineChart, HardHat, Settings } from 'lucide-react';
import { useMockData } from '@/hooks/use-mock-data';
import { EQUIPMENT_TYPES, METRIC_CONFIGS, ALL_METRICS, EQUIPMENT_LABELS, EQUIPMENT_ICONS } from '@/lib/constants';
import type { EquipmentType, MetricName, HistoricalDataPoint } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const chartConfigBase = {
  value: { label: "Value" },
};

const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function MetricChart({ data, metricName, unit }: { data: HistoricalDataPoint[], metricName: string, unit: string }) {
  const chartConfig = {
    ...chartConfigBase,
    [metricName]: { label: METRIC_CONFIGS[metricName as MetricName]?.label || metricName, color: chartColors[0] }
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis 
            tickFormatter={(value) => `${value}${unit}`} 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
            fontSize={12} 
            width={50}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" labelKey="date" />}
          />
          <Line
            dataKey="value"
            name={metricName}
            type="monotone"
            stroke={chartConfig[metricName]?.color || chartColors[0]}
            strokeWidth={2}
            dot={{ r: 4, fill: chartConfig[metricName]?.color || chartColors[0] }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


export default function EquipmentPage() {
  const { equipmentData } = useMockData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialTab = searchParams.get('tab') || EQUIPMENT_TYPES[0].toLowerCase();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar'>('line');


  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentEquipment = useMemo(() => {
    return equipmentData.find(eq => eq.id.toLowerCase() === activeTab);
  }, [activeTab, equipmentData]);

  if (!currentEquipment) {
    return <div>Loading equipment data or invalid tab...</div>;
  }
  
  const EquipmentIcon = EQUIPMENT_ICONS[currentEquipment.id];

  return (
    <>
      <PageHeader title="Equipment Monitoring" description="Detailed metrics and historical data for mining equipment." icon={HardHat} />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {EQUIPMENT_TYPES.map((type) => (
            <TabsTrigger key={type} value={type.toLowerCase()}>
              {EQUIPMENT_LABELS[type]}
            </TabsTrigger>
          ))}
        </TabsList>

        {EQUIPMENT_TYPES.map((type) => (
          <TabsContent key={type} value={type.toLowerCase()}>
            {currentEquipment && currentEquipment.id === type && (
              <Card className="shadow-lg">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       {EquipmentIcon && <EquipmentIcon className="h-8 w-8 text-primary" />}
                       <CardTitle className="font-headline text-2xl">{EQUIPMENT_LABELS[type]}</CardTitle>
                    </div>
                    <Select value={selectedChartType} onValueChange={(value: 'line' | 'bar') => setSelectedChartType(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="line"><LineChart className="inline-block mr-2 h-4 w-4" />Line Chart</SelectItem>
                            <SelectItem value="bar"><BarChart className="inline-block mr-2 h-4 w-4" />Bar Chart</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <CardDescription>Current status and historical performance data.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Current Metrics</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {ALL_METRICS.map((metricName) => {
                        const metricInfo = METRIC_CONFIGS[metricName];
                        const metricData = currentEquipment.metrics[metricName];
                        const MetricIcon = metricInfo.icon || Settings;
                        const isPlaceholderTimestamp = metricData && metricData.timestamp === new Date(0).toISOString();
                        return (
                          <Card key={metricName} className="p-4 bg-card hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-1">
                               <h4 className="text-sm font-medium text-muted-foreground">{metricInfo.label}</h4>
                               <MetricIcon className="h-5 w-5 text-primary/80" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                              {metricData ? `${metricData.value.toLocaleString()}${metricInfo.unit}` : 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Last updated: {metricData ? (isPlaceholderTimestamp ? 'Initializing...' : new Date(metricData.timestamp).toLocaleTimeString()) : 'N/A'}
                            </p>
                          </Card>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Historical Data</h3>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {ALL_METRICS.map((metricName) => {
                        const metricInfo = METRIC_CONFIGS[metricName];
                        const history = currentEquipment.historicalData?.[metricName] || [];
                        if (history.length === 0) return null;

                        return (
                          <Card key={metricName} className="p-4">
                            <h4 className="text-md font-medium mb-2 text-foreground">{metricInfo.label} Trend</h4>
                            <MetricChart data={history} metricName={metricName} unit={metricInfo.unit} />
                          </Card>
                        );
                      })}
                    </div>
                     {ALL_METRICS.every(m => (currentEquipment.historicalData?.[m] || []).length === 0) && (
                        <p className="text-muted-foreground text-center py-4">No historical data available for this equipment.</p>
                     )}
                  </section>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
