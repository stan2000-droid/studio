
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EquipmentData, Threshold, Alert, EquipmentType, MetricName, HistoricalDataPoint } from '@/lib/types';
import { EQUIPMENT_TYPES, ALL_METRICS, METRIC_CONFIGS, EQUIPMENT_LABELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

// Initial state with placeholder, non-random values
const placeholderEquipmentData: EquipmentData[] = EQUIPMENT_TYPES.map(type => ({
  id: type,
  name: EQUIPMENT_LABELS[type],
  metrics: ALL_METRICS.reduce((acc, metricName) => {
    // Use a fixed, non-random value for initial render
    acc[metricName] = { value: 0, timestamp: new Date(0).toISOString() };
    return acc;
  }, {} as Record<MetricName, { value: number; timestamp: string }>),
  historicalData: ALL_METRICS.reduce((acc, metricName) => {
    acc[metricName] = Array.from({ length: 12 }, (_, i) => {
      const baseDate = new Date(2023, 0, 1); // Use a fixed base date
      baseDate.setMonth(baseDate.getMonth() - (11 - i));
      return {
        date: baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: 0, // Use a fixed, non-random value
      };
    });
    return acc;
  }, {} as Record<MetricName, HistoricalDataPoint[]>),
}));


const initialThresholds: Threshold[] = [
  { id: '1', equipmentType: 'WindingRope', metricName: 'temperature', upperLimit: 40 },
  { id: '2', equipmentType: 'WindingRope', metricName: 'corrosion', upperLimit: 5 },
  { id: '3', equipmentType: 'Sheave', metricName: 'temperature', upperLimit: 50 },
];

export function useMockData() {
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>(placeholderEquipmentData);
  const [thresholds, setThresholds] = useState<Threshold[]>(initialThresholds);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  // useEffect to generate and set initial random data on the client side after mount
  useEffect(() => {
    const generateRandomInitialData = (): EquipmentData[] => {
      return EQUIPMENT_TYPES.map(type => ({
        id: type,
        name: EQUIPMENT_LABELS[type],
        metrics: ALL_METRICS.reduce((acc, metricName) => {
          const config = METRIC_CONFIGS[metricName];
          let value: number;
          switch (metricName) {
            case 'temperature': value = Math.random() * 40 + 10; break; // 10-50 C
            case 'corrosion': value = Math.random() * 3; break; // 0-3 /10
            case 'diameterReduction': value = Math.random() * 5; break; // 0-5 mm
            case 'strength': value = Math.random() * 1000 + 3000; break; // 3000-4000 MPa
            default: value = 0;
          }
          acc[metricName] = { value: parseFloat(value.toFixed(1)), timestamp: new Date().toISOString() };
          return acc;
        }, {} as Record<MetricName, { value: number; timestamp: string }>),
        historicalData: ALL_METRICS.reduce((acc, metricName) => {
          acc[metricName] = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(); // Current date for generation
            date.setMonth(date.getMonth() - (11 - i));
            let value: number;
            switch (metricName) {
              case 'temperature': value = Math.random() * 40 + 10 + (Math.sin(i/2)*5) ; break;
              case 'corrosion': value = Math.random() * 3 + (i * 0.1); break;
              case 'diameterReduction': value = Math.random() * 5 + (i * 0.2); break;
              case 'strength': value = (Math.random() * 1000 + 3000) - (i * 50); break;
              default: value = 0;
            }
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: parseFloat(value.toFixed(1)),
            };
          });
          return acc;
        }, {} as Record<MetricName, HistoricalDataPoint[]>),
      }));
    };
    setEquipmentData(generateRandomInitialData());
  }, []); // Empty dependency array: runs once on mount (client-side)


  const updateThreshold = useCallback((newThreshold: Threshold) => {
    setThresholds(prev => {
      const existingIndex = prev.findIndex(t => t.id === newThreshold.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newThreshold;
        return updated;
      }
      return [...prev, { ...newThreshold, id: Date.now().toString() }];
    });
    toast({ title: "Threshold Updated", description: `${EQUIPMENT_LABELS[newThreshold.equipmentType]} - ${METRIC_CONFIGS[newThreshold.metricName].label} threshold saved.` });
  }, [toast]);

  const removeThreshold = useCallback((thresholdId: string) => {
    setThresholds(prev => prev.filter(t => t.id !== thresholdId));
    toast({ title: "Threshold Removed", description: "The threshold has been successfully removed." });
  }, [toast]);


  const checkForAlerts = useCallback(() => {
    const newAlerts: Alert[] = [];
    // Only check for alerts if equipmentData is not the placeholder data
    if (equipmentData === placeholderEquipmentData || equipmentData.length === 0 || equipmentData[0].metrics.temperature?.timestamp === new Date(0).toISOString()) {
        return;
    }

    equipmentData.forEach(eq => {
      ALL_METRICS.forEach(metricName => {
        const metricValue = eq.metrics[metricName]?.value;
        if (metricValue === undefined) return;

        const relevantThresholds = thresholds.filter(
          t => t.equipmentType === eq.id && t.metricName === metricName
        );

        relevantThresholds.forEach(th => {
          let alertTriggered = false;
          let thresholdType: 'upper' | 'lower' | undefined;
          let thresholdValue = 0;

          if (th.upperLimit !== undefined && metricValue > th.upperLimit) {
            alertTriggered = true;
            thresholdType = 'upper';
            thresholdValue = th.upperLimit;
          } else if (th.lowerLimit !== undefined && metricValue < th.lowerLimit) {
            alertTriggered = true;
            thresholdType = 'lower';
            thresholdValue = th.lowerLimit;
          }
          
          if (alertTriggered && thresholdType) {
            const alertId = `${eq.id}-${metricName}-${thresholdType}-${new Date().getTime()}`;
            // Avoid duplicate alerts for the same condition within a short timeframe (e.g., 1 minute)
            const existingAlert = alerts.find(a => 
              a.equipmentType === eq.id && 
              a.metricName === metricName && 
              a.thresholdType === thresholdType &&
              Math.abs(new Date(a.timestamp).getTime() - new Date().getTime()) < 60000 
            );

            if (!existingAlert) {
              const newAlert: Alert = {
                id: alertId,
                equipmentType: eq.id,
                metricName: metricName,
                currentValue: metricValue,
                thresholdValue: thresholdValue,
                thresholdType: thresholdType,
                timestamp: new Date().toISOString(),
                severity: 'critical', // Simplified severity
                message: `${EQUIPMENT_LABELS[eq.id]} ${METRIC_CONFIGS[metricName].label} (${metricValue}${METRIC_CONFIGS[metricName].unit}) has breached the ${thresholdType} limit of ${thresholdValue}${METRIC_CONFIGS[metricName].unit}.`,
              };
              newAlerts.push(newAlert);
              toast({
                title: `🚨 Alert: ${EQUIPMENT_LABELS[eq.id]}`,
                description: newAlert.message,
                variant: 'destructive',
              });
            }
          }
        });
      });
    });
    if (newAlerts.length > 0) {
       setAlerts(prevAlerts => [...newAlerts, ...prevAlerts].slice(0, 20)); // Keep only latest 20 alerts
    }
  }, [equipmentData, thresholds, alerts, toast]);


  useEffect(() => {
    // Only start interval if data is not placeholder (i.e., initial random data has been set)
    if (equipmentData === placeholderEquipmentData || equipmentData.length === 0 || equipmentData[0].metrics.temperature?.timestamp === new Date(0).toISOString()) {
      return;
    }

    const interval = setInterval(() => {
      setEquipmentData(prevData =>
        prevData.map(eq => ({
          ...eq,
          metrics: ALL_METRICS.reduce((acc, metricName) => {
            const config = METRIC_CONFIGS[metricName];
            const oldValue = eq.metrics[metricName]?.value || 0;
            let newValue = oldValue + (Math.random() * (config.step || 1) * 2 - (config.step || 1)); // Fluctuate
            if (config.min !== undefined) newValue = Math.max(config.min, newValue);
            if (config.max !== undefined) newValue = Math.min(config.max, newValue);
            
            acc[metricName] = { value: parseFloat(newValue.toFixed(1)), timestamp: new Date().toISOString() };
            return acc;
          }, {} as Record<MetricName, { value: number; timestamp: string }>),
        }))
      );
    }, 5000); // Update metrics every 5 seconds

    return () => clearInterval(interval);
  }, [equipmentData]); // Depend on equipmentData to restart interval if it's repopulated

  useEffect(() => {
    checkForAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentData, thresholds]); // Check for alerts when data or thresholds change. Explicitly not including checkForAlerts in deps

  return { equipmentData, thresholds, alerts, updateThreshold, removeThreshold };
}
