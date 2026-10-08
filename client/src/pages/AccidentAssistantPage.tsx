import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, MapPin, Heart, Users, Camera, 
  Truck, CheckCircle, ArrowRight, ArrowLeft, ShieldAlert, Save 
} from 'lucide-react';
import { submitAccidentReport } from '../services/ecosystemApi';
import type { AccidentReport } from '../types/app';

const STEPS = [
  'Immediate Safety',
  'Emergency Call',
  'GPS Location',
  'Medical / Family',
  'Incident Details',
  'Damage & Photos',
  'Insurance Checklist',
  'Bike Recovery'
];

export function AccidentAssistantPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState<AccidentReport | null>(null);

  // Form state
  const [isSafeFromTraffic, setIsSafeFromTraffic] = useState<boolean | null>(null);
  const [isInjured, setIsInjured] = useState<boolean | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Incident details
  const [otherVehicles, setOtherVehicles] = useState('');
  const [witnessDetails, setWitnessDetails] = useState('');
  const [roadCondition, setRoadCondition] = useState('Dry asphalt');
  const [weatherCondition, setWeatherCondition] = useState('Clear daylight');
  const [damageDescription, setDamageDescription] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');

  // Insurance Checklist
  const [checklist, setChecklist] = useState({
    exchangeDetails: false,
    photosTaken: false,
    avoidAdmittingFault: false,
    policeNotified: false,
    towingArranged: false
  });

  // GPS Acquisition
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.longitude, pos.coords.latitude]);
          setLocationAccuracy(Math.round(pos.coords.accuracy));
          setAddress(`GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        },
        (err) => {
          setLocationError(err.message || 'GPS location could not be acquired');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSaveReport = async () => {
    setSubmitting(true);
    try {
      const payload: Partial<AccidentReport> = {
        location: {
          coordinates: coords || [0, 0],
          address: address || 'Highway Incident'
        },
        dateTime: new Date().toISOString(),
        injuryReported: isInjured === true,
        damageDescription,
        otherVehiclesInvolved: otherVehicles ? otherVehicles.split(',').map((s) => s.trim()) : [],
        witnessContact: witnessDetails,
        roadCondition,
        weatherCondition,
        insuranceClaimNumber: insurancePolicyNumber,
        status: 'LOGGED'
      };
      const res = await submitAccidentReport(payload);
      if (res) {
        setReportSubmitted(res);
      }
    } catch (err) {
      console.error('Failed to submit accident report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
            Emergency Protocol
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Accident Assistant</h1>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-2">
          <span>Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}</span>
          <span>{Math.round(((activeStep + 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Contents */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 shadow-xl space-y-6">
        {/* Step 1: Immediate Safety */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
              <ShieldAlert size={28} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-black text-white">First: Check Your Personal Safety</h2>
                <p className="text-xs text-red-200 mt-1">
                  Move yourself away from active highway traffic or blind mountain bends. Turn on bike hazard lights if reachable and safe.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2">
                  Are you currently out of danger from incoming vehicles?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSafeFromTraffic(true)}
                    className={`p-4 rounded-2xl border text-sm font-bold text-center transition-all ${
                      isSafeFromTraffic === true
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Yes, I am in a safe spot
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSafeFromTraffic(false)}
                    className={`p-4 rounded-2xl border text-sm font-bold text-center transition-all ${
                      isSafeFromTraffic === false
                        ? 'bg-red-600/20 border-red-500 text-red-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    No, I need immediate shelter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2">
                  Is anyone injured or in pain?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInjured(false)}
                    className={`p-4 rounded-2xl border text-sm font-bold text-center transition-all ${
                      isInjured === false
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    No injuries apparent
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInjured(true)}
                    className={`p-4 rounded-2xl border text-sm font-bold text-center transition-all ${
                      isInjured === true
                        ? 'bg-red-600/20 border-red-500 text-red-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Yes, medical attention needed
                  </button>
                </div>
              </div>
            </div>

            {isInjured && (
              <div className="p-4 rounded-2xl bg-red-600 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm">Emergency Medical Attention Required</h4>
                  <p className="text-xs text-red-100">Connect to National Emergency Hotline 112 or Ambulance 108 immediately.</p>
                </div>
                <a
                  href="tel:112"
                  className="px-4 py-2 rounded-xl bg-white text-red-600 font-black text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Phone size={14} /> Call 112
                </a>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Emergency Call */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Official Emergency Dispatch Hotlines</h2>
            <p className="text-xs text-gray-400">
              MotoAssist provides roadside recovery and coordination. For injuries, active road disputes, or police FIR, contact official response:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="tel:112"
                className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 hover:bg-red-900/40 flex items-center justify-between transition-all"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400">All-in-One Helpline</span>
                  <h3 className="text-lg font-black text-white">112</h3>
                  <span className="text-xs text-gray-300">National Emergency Response</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
                  <Phone size={18} />
                </div>
              </a>

              <a
                href="tel:108"
                className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 hover:bg-blue-900/40 flex items-center justify-between transition-all"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Medical Ambulance</span>
                  <h3 className="text-lg font-black text-white">108</h3>
                  <span className="text-xs text-gray-300">Highway Emergency Ambulance</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Heart size={18} />
                </div>
              </a>

              <a
                href="tel:100"
                className="p-4 rounded-2xl bg-neutral-800 border border-white/10 hover:bg-neutral-750 flex items-center justify-between transition-all"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Police Patrol</span>
                  <h3 className="text-lg font-black text-white">100</h3>
                  <span className="text-xs text-gray-300">Highway Traffic Police</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-neutral-700 flex items-center justify-center text-white">
                  <ShieldAlert size={18} />
                </div>
              </a>

              <button
                onClick={() => navigate('/emergency-services')}
                className="p-4 rounded-2xl bg-neutral-800 border border-white/10 hover:bg-neutral-750 flex items-center justify-between transition-all text-left"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Hospitals & Police</span>
                  <h3 className="text-sm font-black text-white">Nearby Emergency Directory</h3>
                  <span className="text-xs text-gray-300">Verified locations & contacts</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ArrowRight size={18} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: GPS Location */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Incident Coordinates</h2>
            <p className="text-xs text-gray-400">
              Accurate coordinates are vital for highway police, ambulance, and recovery flatbeds.
            </p>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-red-400" /> Current Coordinates
                </span>
                {locationAccuracy !== null && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Accuracy: ±{locationAccuracy}m
                  </span>
                )}
              </div>

              {coords ? (
                <div className="text-lg font-mono font-bold text-white">
                  {coords[1].toFixed(5)}° N, {coords[0].toFixed(5)}° E
                </div>
              ) : (
                <div className="text-sm text-amber-400 font-bold">
                  {locationError || 'Waiting for high-accuracy GPS fix...'}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Landmark / Highway Kilometer Marker (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. NH-10 near Coronation Bridge pillar 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Medical / Family */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Emergency Identification & Family Alert</h2>
            <p className="text-xs text-gray-400">
              Provide first responders with your critical clinical data or notify your trusted safety circle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-800 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <Heart size={18} />
                  <span>My Emergency Medical ID</span>
                </div>
                <p className="text-xs text-gray-300">
                  Quick access to blood group, medication, allergies, and physician emergency contact.
                </p>
                <button
                  onClick={() => navigate('/medical-id')}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                >
                  Open Medical ID Card
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-800 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Users size={18} />
                  <span>Safety Circle Broadcast</span>
                </div>
                <p className="text-xs text-gray-300">
                  Notify family with live coordinates and incident notification with one tap.
                </p>
                <button
                  onClick={() => navigate('/safety-circle')}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                >
                  Manage Safety Circle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Incident Details */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Document Incident Details</h2>
            <p className="text-xs text-gray-400">
              Objective factual documentation for insurance claims and legal record. Do not state assumptions of fault.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Other Vehicles Involved (Make/Model/Plate):</label>
                <input
                  type="text"
                  placeholder="e.g. White SUV WB 74 B 1234"
                  value={otherVehicles}
                  onChange={(e) => setOtherVehicles(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Witness Name & Contact (If available):</label>
                <input
                  type="text"
                  placeholder="e.g. Tea shop owner near bridge, 9876543210"
                  value={witnessDetails}
                  onChange={(e) => setWitnessDetails(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Road Condition:</label>
                  <select
                    value={roadCondition}
                    onChange={(e) => setRoadCondition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400"
                  >
                    <option value="Dry asphalt">Dry asphalt</option>
                    <option value="Wet / Rain slick">Wet / Rain slick</option>
                    <option value="Gravel / Loose stones">Gravel / Loose stones</option>
                    <option value="Mud / Slush">Mud / Slush</option>
                    <option value="Oil slick / Debris">Oil slick / Debris</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Weather / Visibility:</label>
                  <select
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400"
                  >
                    <option value="Clear daylight">Clear daylight</option>
                    <option value="Night / Dark">Night / Dark</option>
                    <option value="Heavy fog / Mist">Heavy fog / Mist</option>
                    <option value="Heavy rain / Storm">Heavy rain / Storm</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Damage & Photos */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Damage Assessment & Photo Log</h2>
            <p className="text-xs text-gray-400">
              Note the motorcycle damage points. Photographs should be taken from 4 angles plus wide perspective of the road context.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Motorcycle Damage Description:</label>
              <textarea
                rows={3}
                placeholder="e.g. Scratched crash guard, bent handlebar, cracked headlight casing, front brake lever snapped..."
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-dashed border-white/20 text-center space-y-2">
              <Camera size={28} className="mx-auto text-gray-400" />
              <h4 className="text-xs font-bold text-white">Recommended Photos:</h4>
              <ul className="text-[11px] text-gray-400 space-y-1 list-disc list-inside text-left max-w-sm mx-auto">
                <li>Wide shot showing both vehicles and road lane markings</li>
                <li>Close-up of point of contact and damage points</li>
                <li>License plates of all involved vehicles</li>
                <li>Skid marks, road debris, or oil slicks</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 7: Insurance Checklist */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Insurance Protection Checklist</h2>
            <p className="text-xs text-gray-400">
              Follow these vital insurance rules to protect your claim validity:
            </p>

            <div className="space-y-2.5">
              {[
                { key: 'avoidAdmittingFault', title: 'Do not admit liability or sign verbal agreements on site', desc: 'State factual observations only to authorities.' },
                { key: 'photosTaken', title: 'Captured wide and detailed photographic evidence', desc: 'Ensure timestamps and coordinates are retained.' },
                { key: 'exchangeDetails', title: 'Exchanged driver details (License, phone, insurer)', desc: 'Obtain policy company name from other party.' },
                { key: 'policeNotified', title: 'Notified police / GD (General Diary) requested if required', desc: 'Required for third-party or major damage claims.' }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-800 border border-white/10 cursor-pointer hover:bg-neutral-750 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key as keyof typeof checklist]}
                    onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-black/40 border-white/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Your Insurer (e.g. ICICI, HDFC, Digit):</label>
                <input
                  type="text"
                  placeholder="Insurance Company"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Policy / Claim Ref #:</label>
                <input
                  type="text"
                  placeholder="Policy Number"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Bike Recovery */}
        {activeStep === 7 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white">Motorcycle Recovery & Report Submission</h2>
            <p className="text-xs text-gray-400">
              Save your accident report securely on the server and book certified towing or recovery flatbed.
            </p>

            <div className="p-4 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck size={18} className="text-amber-400" />
                  Flatbed Towing & Recovery
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Safe carrier transport to authorized dealership or home.
                </p>
              </div>
              <button
                onClick={() => navigate('/save-my-bike')}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors shrink-0"
              >
                Book Recovery
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle size={32} className="mx-auto text-emerald-400" />
                <h3 className="text-base font-bold text-white">Accident Report Saved</h3>
                <p className="text-xs text-emerald-200">
                  Incident ID: <span className="font-mono font-bold">{reportSubmitted.id}</span>
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/rider/dashboard')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/rider-recovery')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Rider Recovery Options
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSaveReport}
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30"
              >
                <Save size={16} />
                <span>{submitting ? 'Saving Accident Incident...' : 'Save Structured Accident Report'}</span>
              </button>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {activeStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-black text-xs font-black flex items-center gap-1.5 transition-colors"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <span className="text-xs text-gray-500">Final Step</span>
          )}
        </div>
      </div>
    </div>
  );
}
