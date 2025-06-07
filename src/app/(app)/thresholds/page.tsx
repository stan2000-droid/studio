
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SlidersHorizontal, PlusCircle, Edit2, Trash2, Save } from 'lucide-react';
import { useMockData } from '@/hooks/use-mock-data';
import { EQUIPMENT_TYPES, METRIC_CONFIGS, ALL_METRICS, EQUIPMENT_LABELS } from '@/lib/constants';
import type { Threshold, EquipmentType, MetricName } from '@/lib/types';

const thresholdSchema = z.object({
  id: z.string().optional(),
  equipmentType: z.custom<EquipmentType>((val) => EQUIPMENT_TYPES.includes(val as EquipmentType), {
    message: "Invalid equipment type",
  }),
  metricName: z.custom<MetricName>((val) => ALL_METRICS.includes(val as MetricName), {
    message: "Invalid metric",
  }),
  lowerLimit: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(String(val))),
    z.number().optional()
  ),
  upperLimit: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(String(val))),
    z.number().optional()
  ),
}).refine(data => data.lowerLimit !== undefined || data.upperLimit !== undefined, {
  message: "At least one limit (upper or lower) must be set.",
  path: ["lowerLimit"], // You can point this to one field or make it a form-level error
});


type ThresholdFormValues = z.infer<typeof thresholdSchema>;

interface ThresholdDialogProps {
  threshold?: Threshold;
  onSave: (data: ThresholdFormValues) => void;
  trigger: React.ReactNode;
}

function ThresholdDialog({ threshold, onSave, trigger }: ThresholdDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: threshold || {
      equipmentType: EQUIPMENT_TYPES[0],
      metricName: ALL_METRICS[0],
      lowerLimit: undefined,
      upperLimit: undefined,
    },
  });

  const onSubmit = (data: ThresholdFormValues) => {
    onSave(data);
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{threshold ? 'Edit Threshold' : 'Add New Threshold'}</DialogTitle>
          <DialogDescription>
            Define the upper and lower limits for a metric.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="equipmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EQUIPMENT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{EQUIPMENT_LABELS[type]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metricName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_METRICS.map(metric => (
                        <SelectItem key={metric} value={metric}>{METRIC_CONFIGS[metric].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lowerLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lower Limit (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={`e.g. ${METRIC_CONFIGS[form.watch('metricName')].min ?? 0}`} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="upperLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upper Limit (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={`e.g. ${METRIC_CONFIGS[form.watch('metricName')].max ?? 100}`} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Threshold</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export default function ThresholdsPage() {
  const { thresholds, updateThreshold, removeThreshold } = useMockData();

  const handleSaveThreshold = (data: ThresholdFormValues) => {
    const thresholdToSave: Threshold = {
      id: data.id || Date.now().toString(), // Generate new ID if not present
      equipmentType: data.equipmentType,
      metricName: data.metricName,
      lowerLimit: data.lowerLimit,
      upperLimit: data.upperLimit,
    };
    updateThreshold(thresholdToSave);
  };

  return (
    <>
      <PageHeader 
        title="Metric Thresholds" 
        description="Manage alert thresholds for equipment metrics." 
        icon={SlidersHorizontal}
        actions={
          <ThresholdDialog 
            onSave={handleSaveThreshold}
            trigger={
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Threshold</Button>
            }
          />
        }
      />

      {thresholds.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {thresholds.map((th) => (
            <Card key={th.id} className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-lg">{EQUIPMENT_LABELS[th.equipmentType]}</CardTitle>
                    <CardDescription>{METRIC_CONFIGS[th.metricName].label}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                     <ThresholdDialog 
                        threshold={th}
                        onSave={handleSaveThreshold}
                        trigger={<Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>}
                      />
                    <Button variant="ghost" size="icon" onClick={() => removeThreshold(th.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {th.lowerLimit !== undefined && (
                    <p><span className="font-medium text-muted-foreground">Lower Limit:</span> {th.lowerLimit}{METRIC_CONFIGS[th.metricName].unit}</p>
                  )}
                  {th.upperLimit !== undefined && (
                    <p><span className="font-medium text-muted-foreground">Upper Limit:</span> {th.upperLimit}{METRIC_CONFIGS[th.metricName].unit}</p>
                  )}
                  {(th.lowerLimit === undefined && th.upperLimit === undefined) && (
                     <p className="text-muted-foreground italic">No limits set for this threshold.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 shadow-md">
          <CardHeader>
            <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4 text-xl font-semibold">No Thresholds Defined</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start by adding thresholds to monitor your equipment effectively.
            </p>
             <ThresholdDialog 
                onSave={handleSaveThreshold}
                trigger={
                  <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Your First Threshold</Button>
                }
              />
          </CardContent>
        </Card>
      )}
    </>
  );
}
