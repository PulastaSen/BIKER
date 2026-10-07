export type Bike = {
  id: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  category?: string;
  engine?: string;
  power?: string;
  torque?: string;
  weight?: string;
  tankCapacity?: string;
  seatHeight?: string;
  groundClearance?: string;
  brakes?: string;
  features?: string[];
};
export type IssueType = 'BIKE_NOT_STARTING' | 'PUNCTURE' | 'BATTERY_ELECTRICAL' | 'FUEL_SHORTAGE' | 'ENGINE_PROBLEM' | 'CHAIN_CLUTCH' | 'ACCIDENT' | 'OTHER';
export type HelpRequest = { id: string; bike: Bike; issue: IssueType; description: string; imageName?: string; approximateLocation?: string; locationShared: boolean; latitude?: number; longitude?: number; createdAt: string; status: 'OPEN' };
