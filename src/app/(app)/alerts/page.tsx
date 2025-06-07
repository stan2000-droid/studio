
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useMockData } from '@/hooks/use-mock-data';
import { EQUIPMENT_LABELS, METRIC_CONFIGS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

export default function AlertsPage() {
  const { alerts } = useMockData();

  const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <>
      <PageHeader title="System Alerts" description="View all active and historical alerts." icon={AlertTriangle} />

      {sortedAlerts.length > 0 ? (
        <div className="space-y-6">
          {sortedAlerts.map((alert) => (
            <Card key={alert.id} className={`shadow-md border-l-4 ${alert.severity === 'critical' ? 'border-destructive bg-destructive/5' : 'border-yellow-500 bg-yellow-500/5'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`font-headline text-lg ${alert.severity === 'critical' ? 'text-destructive' : 'text-yellow-600'}`}>
                    {EQUIPMENT_LABELS[alert.equipmentType]} - {METRIC_CONFIGS[alert.metricName].label} Alert
                  </CardTitle>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'} className={alert.severity !== 'critical' ? 'bg-yellow-500 hover:bg-yellow-500/90' : ''}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-1">{alert.message}</p>
                <p className="text-sm text-muted-foreground">
                  Current: <span className="font-semibold text-foreground">{alert.currentValue}{METRIC_CONFIGS[alert.metricName].unit}</span>
                  , Threshold: <span className="font-semibold text-foreground">{alert.thresholdValue}{METRIC_CONFIGS[alert.metricName].unit}</span> ({alert.thresholdType} limit)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <Card className="text-center py-12 shadow-md">
          <CardHeader>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="mt-4 text-xl font-semibold">All Clear!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">There are no active alerts at the moment.</p>
            <Image 
              src="https://placehold.co/300x200.png"
              alt="No alerts visual"
              width={300}
              height={200}
              className="mt-4 mx-auto rounded-md opacity-75"
              data-ai-hint="empty state illustration"
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
