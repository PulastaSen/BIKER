import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Bike as BikeIcon, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBikes } from '../utils/appStorage';
import { createSubscriptionApi, fetchUserSubscriptionsApi } from '../services/ecosystemApi';
import type { Bike, RsaPlan, UserSubscription } from '../types/app';

export const RSA_PLANS: RsaPlan[] = [
  {
    tier: 'FREEDOM',
    name: 'MotoAssist Freedom',
    tagline: 'Pay-As-You-Go. Zero annual commitment.',
    priceInr: 0,
    durationMonths: 12,
    features: {
      maxFreeBreakdowns: 0,
      towingDistanceLimitKm: 0,
      includesPunctureRepair: false,
      includesBatteryJumpstart: false,
      includesMinorMechanicalLabor: false,
      includesFuelDeliveryLabor: false,
      includesMountainWinchRecovery: false,
      highwayPriorityDispatch: false
    },
    includedBulletPoints: [
      'Access to 24/7 pan-India mechanic network',
      'Pay standard transparent rate card per callout',
      'Live GPS technician tracking & ETA',
      'Toll-free emergency helpline access 1800 2100 007'
    ],
    exclusions: [
      'No free breakdown callouts included',
      'Towing charged at standard ₹1200 base + ₹45/km',
      'No priority mountain dispatch'
    ],
    waitingPeriodHours: 0
  },
  {
    tier: 'COMMUTER',
    name: 'Commuter Shield',
    tagline: 'Ideal for daily city riders & metro commuters.',
    priceInr: 999,
    durationMonths: 12,
    badge: 'POPULAR CITY',
    features: {
      maxFreeBreakdowns: 2,
      towingDistanceLimitKm: 25,
      includesPunctureRepair: true,
      includesBatteryJumpstart: true,
      includesMinorMechanicalLabor: true,
      includesFuelDeliveryLabor: false,
      includesMountainWinchRecovery: false,
      highwayPriorityDispatch: false
    },
    includedBulletPoints: [
      '2 Free breakdown callouts per year',
      'Free flatbed towing up to 25 km to nearest workshop',
      '1 Free 12V battery jumpstart included',
      'Tubeless puncture repair labor included',
      'Minor mechanical cable & fuse labor covered'
    ],
    exclusions: [
      'Towing distance beyond 25 km billed at ₹45/km',
      'Fuel delivery labor not included',
      'Severe off-road / mountain winch recovery excluded'
    ],
    waitingPeriodHours: 48
  },
  {
    tier: 'TOURING_PRO',
    name: 'Touring Pro Roadside Shield',
    tagline: 'Comprehensive highway & inter-state coverage for touring motorcyclists.',
    priceInr: 1999,
    durationMonths: 12,
    highlight: true,
    badge: 'RECOMMENDED FOR RIDERS',
    features: {
      maxFreeBreakdowns: 4,
      towingDistanceLimitKm: 50,
      includesPunctureRepair: true,
      includesBatteryJumpstart: true,
      includesMinorMechanicalLabor: true,
      includesFuelDeliveryLabor: true,
      includesMountainWinchRecovery: false,
      highwayPriorityDispatch: true
    },
    includedBulletPoints: [
      '4 Free breakdown callouts per year across India',
      'Free flatbed towing up to 50 km to nearest authorized OEM dealer',
      'Unlimited minor mechanical labor (clutch cable, spark plug, fuses)',
      'Free emergency petrol delivery labor (fuel at actuals)',
      'Free 12V LiFePO4 battery jumpstart',
      'Priority highway dispatch with SLA guarantee'
    ],
    exclusions: [
      'Towing distance beyond 50 km billed at ₹45/km',
      'Consumables (tubes, oils, cables) billed at MRP'
    ],
    waitingPeriodHours: 48
  },
  {
    tier: 'HILL_EXPLORER',
    name: 'High-Altitude & Hill Explorer',
    tagline: 'Engineered for Ladakh, Spiti, Northeast, and extreme remote terrains.',
    priceInr: 3499,
    durationMonths: 12,
    badge: 'EXTREME TERRAIN',
    features: {
      maxFreeBreakdowns: 6,
      towingDistanceLimitKm: 100,
      includesPunctureRepair: true,
      includesBatteryJumpstart: true,
      includesMinorMechanicalLabor: true,
      includesFuelDeliveryLabor: true,
      includesMountainWinchRecovery: true,
      highwayPriorityDispatch: true
    },
    includedBulletPoints: [
      '6 Free breakdown callouts per year',
      'Free flatbed recovery up to 100 km',
      'Includes 5-ton mountain winch ditch/ravine recovery',
      'High-altitude pass priority emergency dispatch',
      'Chain master-link & spoked tube repairs included',
      'Satellite/SMS emergency check-in beacon coordination'
    ],
    exclusions: [
      'Towing distance beyond 100 km billed at ₹45/km',
      'Submerged riverbed extraction requiring crane'
    ],
    waitingPeriodHours: 48
  }
];

export function SubscriptionsPage() {
  const { user } = useAuth();

  const [activeSubscriptions, setActiveSubscriptions] = useState<UserSubscription[]>([]);
  const [userBikes, setUserBikes] = useState<Bike[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<RsaPlan | null>(null);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  
  // Custom bike entry fallback
  const [customBrand, setCustomBrand] = useState('KTM');
  const [customModel, setCustomModel] = useState('390 Adventure');
  const [customReg, setCustomReg] = useState('WB 74 AB 8921');

  // Checkout State
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<UserSubscription | null>(null);

  const loadData = async () => {
    if (user) {
      const bikes = getBikes(user.id);
      setUserBikes(bikes);
      if (bikes.length > 0) {
        setSelectedBikeId(bikes[0].id);
      }
      const subs = await fetchUserSubscriptionsApi(user.id);
      setActiveSubscriptions(subs.filter(s => s.status === 'ACTIVE'));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    const chosenBike = userBikes.find(b => b.id === selectedBikeId);
    const linkedBike = chosenBike ? {
      bikeId: chosenBike.id,
      brand: chosenBike.brand,
      model: chosenBike.model,
      registrationNumber: chosenBike.registrationNumber
    } : {
      bikeId: 'bike-custom-01',
      brand: customBrand,
      model: customModel,
      registrationNumber: customReg
    };

    try {
      const newSub = await createSubscriptionApi({
        userId: user?.id || 'user-rider-1',
        planTier: selectedPlan.tier,
        planName: selectedPlan.name,
        priceInr: selectedPlan.priceInr,
        durationMonths: selectedPlan.durationMonths,
        linkedBike,
        features: {
          ...selectedPlan.features,
          usedBreakdowns: 0
        },
        waitingPeriodHours: selectedPlan.waitingPeriodHours,
        paymentDetails: {
          paymentMode: 'TEST_DEMO',
          transactionRef: `TXN-${Date.now().toString(36).toUpperCase()}`,
          paidAmount: selectedPlan.priceInr,
          paidAt: new Date().toISOString()
        }
      });

      setCheckoutSuccess(newSub);
      await loadData();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151515] text-white pt-20 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF174]/15 border border-[#FFF174]/30 text-[#FFF174] text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} />
            <span>MOTOASSIST ANNUAL ROADSIDE COVERAGE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Motorcycle Roadside Protection Plans</h1>
          <p className="text-sm sm:text-base text-[#C5C5C5]">
            Benchmark roadside assistance engineered exclusively for two-wheelers. Zero hidden towing tariffs, pan-India highway coverage, and flatbed recovery.
          </p>
        </div>

        {/* Active Subscriptions Dashboard Bar (If User has an active plan) */}
        {activeSubscriptions.length > 0 && (
          <div className="bg-[#1D1D1D] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">ACTIVE COVERAGE</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                      ID: {activeSubscriptions[0].subscriptionId}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{activeSubscriptions[0].planName}</h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 block">Covered Motorcycle</span>
                <span className="text-sm font-black text-[#FFF174]">
                  {activeSubscriptions[0].linkedBike.brand} {activeSubscriptions[0].linkedBike.model} ({activeSubscriptions[0].linkedBike.registrationNumber})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[11px]">Free Breakdowns Left</span>
                <strong className="text-lg text-white font-black">
                  {activeSubscriptions[0].features.maxFreeBreakdowns - activeSubscriptions[0].features.usedBreakdowns} / {activeSubscriptions[0].features.maxFreeBreakdowns}
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[11px]">Towing Allowance</span>
                <strong className="text-lg text-white font-black">
                  Up to {activeSubscriptions[0].features.towingDistanceLimitKm} km free
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[11px]">Minor Labor</span>
                <strong className="text-lg text-emerald-400 font-black">Covered 100%</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[11px]">Valid Until</span>
                <strong className="text-lg text-[#FFF174] font-black">
                  {new Date(activeSubscriptions[0].endDate).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {RSA_PLANS.map(plan => {
            const isHighlight = plan.highlight;
            return (
              <div 
                key={plan.tier}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                  isHighlight 
                    ? 'bg-gradient-to-b from-[#222222] to-[#1a1a1a] border-2 border-[#FFF174] shadow-2xl shadow-yellow-500/10' 
                    : 'bg-[#1D1D1D] border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-md ${
                    isHighlight 
                      ? 'bg-[#FFF174] text-black border-[#FFF174]' 
                      : 'bg-white/10 text-white border-white/20 backdrop-blur-md'
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-[#C5C5C5] mt-1 min-h-[34px]">{plan.tagline}</p>
                  </div>

                  <div className="border-t border-b border-white/10 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#FFF174]">
                        {plan.priceInr === 0 ? '₹0' : `₹${plan.priceInr}`}
                      </span>
                      <span className="text-xs text-gray-400">/ {plan.durationMonths} months</span>
                    </div>
                    {plan.priceInr > 0 ? (
                      <span className="text-[11px] text-gray-400 block mt-0.5">All-inclusive annual plan</span>
                    ) : (
                      <span className="text-[11px] text-gray-400 block mt-0.5">Pay actual rate per incident</span>
                    )}
                  </div>

                  {/* Bullet Inclusions */}
                  <div className="space-y-2.5 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Included Coverage:</span>
                    {plan.includedBulletPoints.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Exclusions */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Exclusions / Limits:</span>
                    {plan.exclusions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <XCircle size={13} className="text-gray-500 shrink-0 mt-0.5" />
                        <span className="text-gray-400 text-[11px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full py-3 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                      isHighlight
                        ? 'bg-[#FFF174] text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span>{plan.priceInr === 0 ? 'Select Free Plan' : 'Choose This Plan'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFF174]">TRANSPARENT DIRECT COMPARISON</span>
            <h2 className="text-2xl font-black text-white">Full Feature Breakdown</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Capability / Service</th>
                  <th className="py-3 px-3">Freedom</th>
                  <th className="py-3 px-3">Commuter</th>
                  <th className="py-3 px-3 text-[#FFF174]">Touring Pro</th>
                  <th className="py-3 px-3">Hill Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-3 font-bold text-white">Free Breakdown Callouts</td>
                  <td className="py-3 px-3 text-gray-400">Pay as you go</td>
                  <td className="py-3 px-3 font-bold text-white">2 / year</td>
                  <td className="py-3 px-3 font-bold text-[#FFF174]">4 / year</td>
                  <td className="py-3 px-3 font-bold text-white">6 / year</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">Free Towing Distance</td>
                  <td className="py-3 px-3 text-gray-400">Standard rate</td>
                  <td className="py-3 px-3 font-bold text-white">25 km</td>
                  <td className="py-3 px-3 font-bold text-[#FFF174]">50 km</td>
                  <td className="py-3 px-3 font-bold text-white">100 km</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">Tubeless Puncture Labor</td>
                  <td className="py-3 px-3 text-gray-400">₹350</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Included</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Included</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">12V Battery Jumpstart</td>
                  <td className="py-3 px-3 text-gray-400">₹300</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Included (1x)</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Included (2x)</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">Emergency Fuel Delivery Labor</td>
                  <td className="py-3 px-3 text-gray-400">₹200</td>
                  <td className="py-3 px-3 text-gray-400">₹200</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Free delivery</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Free delivery</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">5-Ton Winch Ditch Recovery</td>
                  <td className="py-3 px-3 text-gray-400">₹2200</td>
                  <td className="py-3 px-3 text-gray-400">₹2200</td>
                  <td className="py-3 px-3 text-gray-400">₹2200</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">Highway Priority Dispatch</td>
                  <td className="py-3 px-3 text-gray-400">Standard</td>
                  <td className="py-3 px-3 text-gray-400">Standard</td>
                  <td className="py-3 px-3 text-[#FFF174] font-bold">High Priority</td>
                  <td className="py-3 px-3 text-[#FFF174] font-bold">Top Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CHECKOUT & VEHICLE LINKING MODAL */}
      {selectedPlan && !checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1D1D1D] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl relative">
            
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FFF174] tracking-widest block">SUBSCRIBE TO PLAN</span>
                <h2 className="text-2xl font-black text-white">{selectedPlan.name}</h2>
                <span className="text-sm font-black text-[#FFF174]">₹{selectedPlan.priceInr} / year</span>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 border border-white/10"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <BikeIcon size={14} className="text-[#FFF174]" />
                  <span>Select Motorcycle to Protect</span>
                </label>

                {userBikes.length > 0 ? (
                  <select
                    value={selectedBikeId}
                    onChange={(e) => setSelectedBikeId(e.target.value)}
                    className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#FFF174] focus:outline-none"
                  >
                    {userBikes.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.brand} {b.model} • {b.registrationNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Brand (e.g. KTM)"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        className="bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Model (e.g. 390 Adventure)"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        className="bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Registration Number (e.g. WB 74 AB 8921)"
                      value={customReg}
                      onChange={(e) => setCustomReg(e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase"
                      required
                    />
                  </div>
                )}
                <p className="text-[11px] text-gray-400">
                  RSA coverage is strictly bound to the registered chassis and license plate of this motorcycle.
                </p>
              </div>

              {/* Payment Gateway Transparent Disclosure */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-yellow-300 font-bold">
                  <CreditCard size={16} />
                  <span>Transparent Sandbox / Demo Checkout</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  MotoAssist does not store raw credit card details. In production, this initiates a secure Razorpay / Stripe UPI session. Clicking "Confirm Subscription" simulates a successful payment and immediately activates coverage.
                </p>
              </div>

              {/* Summary */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Subscription:</span>
                  <span className="font-bold text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-bold text-white">12 Months (365 Days)</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1.5">
                  <span className="font-bold text-white">Total Amount Due:</span>
                  <span className="font-black text-[#FFF174] text-sm">₹{selectedPlan.priceInr}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="flex-2 py-3 rounded-xl bg-[#FFF174] text-black font-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {isProcessing ? 'Activating Coverage...' : `Confirm & Activate Coverage (₹${selectedPlan.priceInr})`}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT SUCCESS MODAL */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1D1D1D] border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <ShieldCheck size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">COVERAGE ACTIVATED</span>
              <h2 className="text-2xl font-black text-white">Roadside Shield Live</h2>
              <p className="text-xs text-[#C5C5C5]">
                Subscription <strong className="text-[#FFF174] font-mono">{checkoutSuccess.subscriptionId}</strong> has been linked to your motorcycle.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="font-bold text-white">{checkoutSuccess.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Motorcycle:</span>
                <span className="font-bold text-[#FFF174]">{checkoutSuccess.linkedBike.brand} {checkoutSuccess.linkedBike.model} ({checkoutSuccess.linkedBike.registrationNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Free Breakdown Limit:</span>
                <span className="font-bold text-white">{checkoutSuccess.features.maxFreeBreakdowns} Callouts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Free Towing Radius:</span>
                <span className="font-bold text-emerald-400">Up to {checkoutSuccess.features.towingDistanceLimitKm} km</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCheckoutSuccess(null);
                setSelectedPlan(null);
              }}
              className="w-full py-3 rounded-xl bg-[#FFF174] text-black font-black text-xs hover:bg-yellow-400 transition-colors shadow-md shadow-yellow-500/20"
            >
              Done & View Active Coverage
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
