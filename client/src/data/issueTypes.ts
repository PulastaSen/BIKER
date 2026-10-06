import { BatteryCharging, CircleDot, Fuel, Gauge, TriangleAlert, Wrench, Settings, Link as LinkIcon, type LucideIcon } from 'lucide-react';
import type { IssueType } from '../types/request';

export interface IssueTypeDefinition {
  value: IssueType;
  label: string;
  description: string;
  icon: LucideIcon;
  query: string;
  aliases: string[];
}

export const issueTypes: IssueTypeDefinition[] = [
  {
    value: 'BIKE_NOT_STARTING',
    label: "Bike won't start",
    description: 'No ignition, dead starter, or engine failing to turnover.',
    icon: Wrench,
    query: 'bike-wont-start',
    aliases: ['bike-wont-start', 'bike-won-t-start', 'starting', 'start'],
  },
  {
    value: 'PUNCTURE',
    label: 'Puncture',
    description: 'Flat tyre, puncture, or low air pressure issue.',
    icon: CircleDot,
    query: 'puncture',
    aliases: ['puncture', 'flat-tyre', 'tire'],
  },
  {
    value: 'BATTERY_ELECTRICAL',
    label: 'Battery or electrical issue',
    description: 'Battery drained, blown fuse, or lighting/electrical failure.',
    icon: BatteryCharging,
    query: 'battery',
    aliases: ['battery', 'battery-or-electrical-issue', 'electrical'],
  },
  {
    value: 'FUEL_SHORTAGE',
    label: 'Fuel shortage',
    description: 'Out of fuel or fuel line blockage.',
    icon: Fuel,
    query: 'fuel',
    aliases: ['fuel', 'fuel-shortage', 'petrol'],
  },
  {
    value: 'ENGINE_PROBLEM',
    label: 'Engine problem',
    description: 'Unusual noise, overheating, oil leak, or performance loss.',
    icon: Gauge,
    query: 'engine',
    aliases: ['engine', 'engine-problem', 'overheating'],
  },
  {
    value: 'CHAIN_CLUTCH',
    label: 'Chain or clutch issue',
    description: 'Snapped or loose chain, clutch wire issue, or transmission trouble.',
    icon: LinkIcon,
    query: 'chain',
    aliases: ['chain', 'chain-or-clutch-issue', 'clutch'],
  },
  {
    value: 'ACCIDENT',
    label: 'Accident',
    description: 'Collision, fall, or severe vehicle damage.',
    icon: TriangleAlert,
    query: 'accident',
    aliases: ['accident', 'crash'],
  },
  {
    value: 'OTHER',
    label: 'Other issue',
    description: 'Brake issues, key loss, lock issue, or unspecified trouble.',
    icon: Settings,
    query: 'other',
    aliases: ['other', 'other-issue'],
  },
];

export function findIssueByQuery(queryStr: string | null | undefined): IssueType | undefined {
  if (!queryStr) return undefined;
  const normalized = queryStr.toLowerCase().trim();
  const hyphenated = normalized.replace(/\s+/g, '-');
  const matched = issueTypes.find(
    (item) =>
      item.query === normalized ||
      item.query === hyphenated ||
      item.aliases.includes(normalized) ||
      item.aliases.includes(hyphenated)
  );
  return matched?.value;
}
