
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Brain, Sparkles, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { predictFailure, type PredictFailureInput, type PredictFailureOutput } from '@/ai/flows/failure-prediction';
import { EQUIPMENT_TYPES, METRIC_CONFIGS, ALL_METRICS, EQUIPMENT_LABELS } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

const failurePredictionSchema = z.object({
  componentType: z.enum(['WindingRope', 'Sheave', 'Drum'], {
    required_error: "Component type is required.",
  }),
  temperature: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(-50, "Temperature too low").max(200, "Temperature too high")
  ),
  corrosion: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Corrosion cannot be less than 0").max(10, "Corrosion cannot be more than 10")
  ),
  diameterReduction: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Diameter reduction cannot be negative").max(100, "Diameter reduction seems too high")
  ),
  strength: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Strength cannot be negative").max(10000, "Strength seems too high")
  ),
  historicalData: z.string().optional(),
});

type FailurePredictionFormValues = z.infer<typeof failurePredictionSchema>;

export default function FailurePredictionPage() {
  const [predictionResult, setPredictionResult] = useState<PredictFailureOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FailurePredictionFormValues>({
    resolver: zodResolver(failurePredictionSchema),
    defaultValues: {
      componentType: undefined, // Ensure it's undefined initially for placeholder
      temperature: 25,
      corrosion: 1,
      diameterReduction: 0,
      strength: 3500,
      historicalData: '',
    },
  });

  const onSubmit = async (data: FailurePredictionFormValues) => {
    setIsLoading(true);
    setPredictionResult(null);
    try {
      const result = await predictFailure(data as PredictFailureInput); // Cast needed due to enum Zod type
      setPredictionResult(result);
      toast({
        title: "Prediction Successful",
        description: "Failure probability has been calculated.",
      });
    } catch (error) {
      console.error("Failure prediction error:", error);
      toast({
        title: "Prediction Failed",
        description: "An error occurred while predicting failure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability > 0.7) return 'bg-destructive';
    if (probability > 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };


  return (
    <>
      <PageHeader 
        title="AI Failure Prediction" 
        description="Predict potential equipment failures using AI-powered analysis." 
        icon={Brain}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Input Sensor Data</CardTitle>
            <CardDescription>Provide the current operational data for the component.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="componentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Component Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select component" /></SelectTrigger>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature ({METRIC_CONFIGS.temperature.unit})</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 45" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="corrosion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Corrosion ({METRIC_CONFIGS.corrosion.unit})</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diameterReduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diameter Reduction ({METRIC_CONFIGS.diameterReduction.unit})</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g., 1.2" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strength ({METRIC_CONFIGS.strength.unit})</FormLabel>
                        <FormControl><Input type="number" step="10" placeholder="e.g., 3200" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="historicalData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Data (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter relevant historical data, e.g., previous high temperatures, corrosion spikes, maintenance logs..." {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Predicting... </>
                  ) : (
                    <> <Sparkles className="mr-2 h-4 w-4" /> Predict Failure </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Prediction Results</CardTitle>
            <CardDescription>AI-generated failure probability and recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing data and generating prediction...</p>
              </div>
            )}
            {!isLoading && !predictionResult && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Submit data on the left to get a failure prediction.
                </p>
              </div>
            )}
            {predictionResult && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm text-muted-foreground">Failure Probability (next month)</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Progress value={predictionResult.failureProbability * 100} className="w-full h-6" indicatorClassName={getProbabilityColor(predictionResult.failureProbability)} />
                    <span className="text-2xl font-bold text-foreground">
                      {(predictionResult.failureProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                   {predictionResult.failureProbability > 0.7 && <p className="text-xs text-destructive mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> High risk of failure.</p>}
                   {predictionResult.failureProbability <= 0.7 && predictionResult.failureProbability > 0.4 && <p className="text-xs text-yellow-600 mt-1 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>Moderate risk. Monitor closely.</p>}
                   {predictionResult.failureProbability <= 0.4 && <p className="text-xs text-green-600 mt-1 flex items-center"><CheckCircle className="h-3 w-3 mr-1"/>Low risk.</p>}
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-1 text-foreground">Reasoning:</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                    {predictionResult.reasoning}
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-1 text-foreground">Recommendations:</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                    {predictionResult.recommendations}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
