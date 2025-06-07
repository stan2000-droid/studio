export type EquipmentType = 'WindingRope' | 'Sheave' | 'Drum';
export type MetricName = 'temperature' | 'corrosion' | 'diameterReduction' | 'strength';

export interface MetricConfig {
  name: MetricName;
  label: string;
  unit: string;
  icon?: React.ElementType;
  min?: number;
  max?: number;
  step?: number;
}

export interface EquipmentMetric {
  value: number;
  timestamp: string; // ISO string date
}

export interface HistoricalDataPoint {
  date: string; // e.g., "Jan 22"
  value: number;
}

export interface Threshold {
  id: string;
  equipmentType: EquipmentType;
  metricName: MetricName;
  upperLimit?: number;
  lowerLimit?: number;
}

export interface Alert {
  id: string;
  equipmentType: EquipmentType;
  metricName: MetricName;
  currentValue: number;
  thresholdValue: number;
  thresholdType: 'upper' | 'lower';
  timestamp: string; // ISO string date
  severity: 'warning' | 'critical';
  message: string;
}

export interface EquipmentData {
  id: EquipmentType;
  name: string;
  metrics: Partial<Record<MetricName, EquipmentMetric>>;
  historicalData?: Partial<Record<MetricName, HistoricalDataPoint[]>>;
}
