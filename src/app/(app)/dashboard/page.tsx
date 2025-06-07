
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, HardHat, LayoutDashboard, Activity, CheckCircle, Eye } from 'lucide-react';
import { useMockData } from '@/hooks/use-mock-data';
import { EQUIPMENT_ICONS, EQUIPMENT_LABELS, METRIC_CONFIGS } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function DashboardPage() {
  const { equipmentData, alerts } = useMockData();

  const totalEquipment = equipmentData.length;
  const activeAlertsCount = alerts.filter(alert => {
    const alertDate = new Date(alert.timestamp);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return alertDate > fiveMinutesAgo;
  }).length;
  
  // Calculate overall health: 100% if no active alerts, decreases with alerts
  const overallHealth = Math.max(0, 100 - (activeAlertsCount * 20)); // Example: each alert reduces health by 20%

  const overviewStats = [
    { title: 'Total Equipment', value: totalEquipment, icon: HardHat, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { title: 'Active Alerts', value: activeAlertsCount, icon: AlertTriangle, color: activeAlertsCount > 0 ? 'text-destructive' : 'text-green-500', bgColor: activeAlertsCount > 0 ? 'bg-red-50' : 'bg-green-50' },
    { title: 'Overall Health', value: `${overallHealth.toFixed(0)}%`, icon: overallHealth > 70 ? CheckCircle : Activity, color: overallHealth > 70 ? 'text-green-500' : 'text-yellow-500', bgColor: overallHealth > 70 ? 'bg-green-50' : 'bg-yellow-50' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your mining equipment health." icon={LayoutDashboard} />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {overviewStats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Equipment Status</CardTitle>
            <CardDescription>Quick view of individual equipment health.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipmentData.map((eq) => {
              const eqAlerts = alerts.filter(a => a.equipmentType === eq.id && new Date(a.timestamp) > new Date(Date.now() - 5 * 60 * 1000)).length;
              const EquipmentIcon = EQUIPMENT_ICONS[eq.id];
              return (
                <Card key={eq.id} className="p-4 bg-card hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EquipmentIcon className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{EQUIPMENT_LABELS[eq.id]}</h3>
                        <p className={`text-sm ${eqAlerts > 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {eqAlerts > 0 ? `${eqAlerts} active alert(s)` : 'All systems normal'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/equipment?tab=${eq.id.toLowerCase()}`}>
                       <Button variant="outline" size="sm">
                         <Eye className="mr-2 h-4 w-4" /> View Details
                       </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent Alerts</CardTitle>
            <CardDescription>Latest critical alerts from the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <li key={alert.id} className="flex items-start gap-3 p-3 rounded-md border bg-destructive/10 border-destructive/30">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        {EQUIPMENT_LABELS[alert.equipmentType]} - {METRIC_CONFIGS[alert.metricName].label}
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground/70">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                 <Image src="https://placehold.co/100x100.png" alt="No Alerts" width={80} height={80} className="opacity-50 mb-2 rounded-full" data-ai-hint="illustration peace" />
                <p className="text-muted-foreground">No active alerts. System is stable.</p>
              </div>
            )}
             {alerts.length > 0 && (
                <Link href="/alerts" className="mt-4 block">
                  <Button variant="outline" className="w-full">View All Alerts</Button>
                </Link>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
