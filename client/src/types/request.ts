export type Bike = { id: string; brand: string; model: string; year: number; registrationNumber: string };
export type IssueType = 'BIKE_NOT_STARTING' | 'PUNCTURE' | 'BATTERY_ELECTRICAL' | 'FUEL_SHORTAGE' | 'ENGINE_PROBLEM' | 'CHAIN_CLUTCH' | 'ACCIDENT' | 'OTHER';
export type HelpRequest = { id: string; bike: Bike; issue: IssueType; description: string; imageName?: string; approximateLocation?: string; locationShared: boolean; latitude?: number; longitude?: number; createdAt: string; status: 'OPEN' };
