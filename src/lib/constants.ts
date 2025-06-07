import type { EquipmentType, MetricConfig, MetricName } from './types';
import {
  LayoutDashboard,
  HardHat,
  SlidersHorizontal,
  AlertTriangle,
  Brain,
  Thermometer,
  ShieldAlert,
  Scaling, // Using Scaling for diameter reduction
  Zap,       // Using Zap for strength
  Unlink,    // Winding Rope (visual metaphor for cable/rope)
  Disc3,     // Sheave
  Container, // Drum
} from 'lucide-react';

export const APP_NAME = 'Mine Health Insights';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/equipment', label: 'Equipment Monitoring', icon: HardHat },
  { href: '/thresholds', label: 'Thresholds', icon: SlidersHorizontal },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/failure-prediction', label: 'Failure Prediction', icon: Brain },
];

export const EQUIPMENT_TYPES: EquipmentType[] = ['WindingRope', 'Sheave', 'Drum'];

export const EQUIPMENT_ICONS: Record<EquipmentType, React.ElementType> = {
  WindingRope: Unlink,
  Sheave: Disc3,
  Drum: Container,
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  WindingRope: 'Winding Rope',
  Sheave: 'Sheave',
  Drum: 'Drum',
};

export const METRIC_CONFIGS: Record<MetricName, MetricConfig> = {
  temperature: { name: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, min: -50, max: 200, step: 1 },
  corrosion: { name: 'corrosion', label: 'Corrosion', unit: '/10', icon: ShieldAlert, min: 0, max: 10, step: 0.1 },
  diameterReduction: { name: 'diameterReduction', label: 'Diameter Reduction', unit: 'mm', icon: Scaling, min: 0, max: 50, step: 0.1 },
  strength: { name: 'strength', label: 'Strength', unit: 'MPa', icon: Zap, min: 0, max: 5000, step: 10 },
};

export const ALL_METRICS: MetricName[] = Object.keys(METRIC_CONFIGS) as MetricName[];
