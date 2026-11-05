import type { Bike } from '../types/app';
import { getAssetUrl } from './assets';

export interface ManufacturerOption {
  name: string;
  country: string;
  popularModels: string[];
}

export const MOTORCYCLE_CATALOG: ManufacturerOption[] = [
  {
    name: 'Royal Enfield',
    country: 'India',
    popularModels: ['Himalayan 450', 'Hunter 350', 'Classic 350', 'Meteor 350', 'Continental GT 650', 'Interceptor 650', 'Super Meteor 650', 'Bullet 350']
  },
  {
    name: 'Honda',
    country: 'Japan',
    popularModels: ['XL750 Transalp', 'CB350 / H\'ness', 'CB350RS', 'NX500', 'Africa Twin CRF1100L', 'CB300R', 'Hornet 2.0', 'Shine 125']
  },
  {
    name: 'Triumph',
    country: 'United Kingdom',
    popularModels: ['Tiger 900 Rally Pro', 'Scrambler 400X', 'Speed 400', 'Tiger 1200 Rally Pro', 'Bonneville T120', 'Trident 660', 'Street Triple 765']
  },
  {
    name: 'KTM',
    country: 'Austria',
    popularModels: ['390 Adventure', 'Duke 390', 'RC 390', '250 Adventure', 'Duke 250', 'Duke 200', 'RC 200']
  },
  {
    name: 'Bajaj',
    country: 'India',
    popularModels: ['Pulsar N160', 'Dominar 400', 'Dominar 250', 'Pulsar NS200', 'Pulsar N250', 'Pulsar 150', 'Avenger Cruise 220']
  },
  {
    name: 'Yamaha',
    country: 'Japan',
    popularModels: ['MT-15 V2', 'YZF-R15 V4', 'FZ-X', 'FZ-S V4', 'Aerox 155', 'R3', 'MT-03', 'Ténéré 700']
  },
  {
    name: 'BMW Motorrad',
    country: 'Germany',
    popularModels: ['G 310 GS', 'G 310 R', 'F 900 GS', 'R 1300 GS', 'R 1250 GS Adventure', 'S 1000 RR']
  },
  {
    name: 'Kawasaki',
    country: 'Japan',
    popularModels: ['Versys 650', 'Ninja 400', 'Ninja 500', 'Versys 1000', 'Z900', 'Ninja 650', 'KLX 300']
  },
  {
    name: 'Suzuki',
    country: 'Japan',
    popularModels: ['V-Strom SX 250', 'Gixxer SF 250', 'Gixxer 150', 'V-Strom 800DE', 'Hayabusa', 'Katana']
  },
  {
    name: 'Hero MotoCorp',
    country: 'India',
    popularModels: ['Xpulse 200 4V', 'Xpulse 200T', 'Mavrick 440', 'Karizma XMR 210', 'Splendor Plus', 'Xtreme 160R']
  },
  {
    name: 'TVS',
    country: 'India',
    popularModels: ['Apache RTR 310', 'Apache RR 310', 'Ronin 225', 'Apache RTR 200 4V', 'Apache RTR 160 4V', 'Raider 125']
  }
];

export function getBikeImage(bike: Bike): string {
  const bModel = (bike.model || '').toLowerCase();
  const bBrand = (bike.brand || '').toLowerCase();

  if (bModel.includes('himalayan') || bBrand.includes('royal enfield')) {
    return getAssetUrl('/images/bikes/himalayan-450/himalayan-450-main.jpg');
  }
  if (bModel.includes('transalp') || (bBrand.includes('honda') && bModel.includes('750'))) {
    return getAssetUrl('/images/bikes/transalp-750/transalp-750-main.jpg');
  }
  if (bModel.includes('tiger') || bBrand.includes('triumph')) {
    return getAssetUrl('/images/bikes/tiger-900/tiger-900-main.jpg');
  }
  if (bModel.includes('390 adventure') || bModel.includes('ktm') || bBrand.includes('ktm')) {
    return getAssetUrl('/images/bikes/ktm-390-adventure/ktm-390-adventure-main.jpg');
  }
  if (bModel.includes('pulsar') || bModel.includes('n160') || bBrand.includes('bajaj')) {
    return getAssetUrl('/images/bikes/pulsar-n160/pulsar-n160-main.jpg');
  }
  return getAssetUrl('/images/motoassist-hero.jpg');
}

export function getBikeDisplayName(bike: Bike): string {
  const brandName = (bike.brand || '').trim();
  const modelName = (bike.model || '').trim();
  if (!brandName && !modelName) return 'Motorcycle';
  if (!brandName) return modelName;
  if (!modelName) return brandName;
  if (modelName.toLowerCase().includes(brandName.toLowerCase())) {
    return modelName;
  }
  return `${brandName} ${modelName}`;
}

export function maskRegistrationNumber(reg: string, masked: boolean = true): string {
  if (!reg) return 'UNREGISTERED';
  const clean = reg.trim().toUpperCase();
  if (!masked) return clean;
  // Mask middle characters: "WB 74 H 4500" -> "WB 74 •••• 4500" or "WB 74 ••••"
  const parts = clean.split(' ');
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1]} •••• ${parts[parts.length - 1]}`;
  }
  if (clean.length > 6) {
    return `${clean.substring(0, 4)} •••• ${clean.substring(clean.length - 2)}`;
  }
  return clean;
}

