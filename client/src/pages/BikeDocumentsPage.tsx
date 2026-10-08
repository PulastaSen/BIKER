import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, ShieldCheck, Plus, Trash2, ArrowLeft, 
  Calendar, Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBikes } from '../utils/appStorage';
import { fetchBikeDocuments, addBikeDocument, deleteBikeDocument } from '../services/ecosystemApi';
import type { BikeDocument } from '../types/app';

const DOCUMENT_TYPES = [
  { type: 'RC', label: 'Registration Certificate (RC)', desc: 'Official government vehicle registration card' },
  { type: 'INSURANCE', label: 'Motor Insurance Policy', desc: 'Comprehensive or third-party insurance certificate' },
  { type: 'PUC', label: 'Pollution Under Control (PUC)', desc: 'Mandatory emissions fitness certificate' },
  { type: 'DRIVING_LICENCE', label: 'Driving Licence (DL)', desc: 'Rider valid motorcycle driving license' },
  { type: 'WARRANTY', label: 'OEM Manufacturer Warranty', desc: 'Factory warranty card or extended roadside warranty' },
  { type: 'SERVICE_RECORD', label: 'Authorised Service Record', desc: 'Last periodic maintenance invoice or log' }
];

export function BikeDocumentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bikes, setBikes] = useState<{ id: string; name: string }[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('primary');
  const [documents, setDocuments] = useState<BikeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [docType, setDocType] = useState('RC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const userBikes = getBikes(user.id);
      if (userBikes.length > 0) {
        setBikes(userBikes.map((b) => ({ id: b.id, name: `${b.brand} ${b.model} (${b.registrationNumber || 'No Plate'})` })));
        setSelectedBikeId(userBikes[0].id);
      } else {
        setBikes([{ id: 'primary', name: 'Primary Motorcycle' }]);
      }
    }
  }, [user]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await fetchBikeDocuments(selectedBikeId);
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [selectedBikeId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber) return;
    setSaving(true);
    try {
      await addBikeDocument({
        bikeId: selectedBikeId,
        docType,
        documentNumber,
        issuer: issuer || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes || undefined
      });
      setShowAddModal(false);
      setDocumentNumber('');
      setIssuer('');
      setExpiryDate('');
      setNotes('');
      loadDocs();
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document reference?')) {
      await deleteBikeDocument(id);
      loadDocs();
    }
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = (target - now) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <div className="shell py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Encrypted Vault
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Digital Bike Document Wallet</h1>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black flex items-center gap-1.5 transition-colors"
        >
          <Plus size={16} /> Add Document
        </button>
      </div>

      {/* Security Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-neutral-900 border border-white/10 flex items-start gap-3">
        <Lock size={20} className="text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300">
          <strong className="text-white block font-bold">Authenticated Private Storage</strong>
          Your vehicle paperwork references are strictly private. They are never exposed publicly or shared with unauthorized third parties. Only you and authorized emergency responders have access when explicitly shared.
        </div>
      </div>

      {/* Bike Selector if multiple bikes */}
      {bikes.length > 1 && (
        <div className="mb-6 flex items-center gap-3">
          <label className="text-xs text-gray-400 font-bold">Select Motorcycle:</label>
          <select
            value={selectedBikeId}
            onChange={(e) => setSelectedBikeId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
          >
            {bikes.map((b) => (
              <option key={b.id} value={b.id} className="bg-neutral-900">{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Document Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading secured documents...</div>
      ) : documents.length === 0 ? (
        <div className="p-8 rounded-3xl bg-neutral-900 border border-white/10 text-center space-y-4">
          <FileText size={48} className="mx-auto text-gray-600" />
          <h3 className="text-base font-bold text-white">No Documents in Wallet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Store your vehicle RC, insurance policy numbers, and PUC validity so you never get caught without vital papers during highway checks or insurance claims.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-black text-xs font-black transition-colors"
          >
            Add Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const expired = isExpired(doc.expiryDate);
            const expiringSoon = isExpiringSoon(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        {doc.docType.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-mono font-bold text-white mt-0.5">{doc.documentNumber}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id || doc.documentId || '')}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-400 my-3">
                    {doc.issuer && (
                      <p>Issuer / Authority: <strong className="text-white">{doc.issuer}</strong></p>
                    )}
                    {doc.expiryDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>Valid until: <strong className="text-white">{new Date(doc.expiryDate).toLocaleDateString()}</strong></span>
                        {expired ? (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            EXPIRED
                          </span>
                        ) : expiringSoon ? (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            EXPIRING SOON
                          </span>
                        ) : (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    )}
                    {doc.notes && (
                      <p className="text-[11px] text-gray-500 pt-1 italic">Note: {doc.notes}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-400" /> Secured in Cloud
                  </span>
                  <span>Updated {new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Add Vehicle Document</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Document Type:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {DOCUMENT_TYPES.map((d) => (
                    <option key={d.type} value={d.type} className="bg-neutral-900">{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Document Number / Ref #:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WB74-2023-0001234 or POL-99887766"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Issuer / Company (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. West Bengal RTO, ICICI Lombard, Bharat Petroleum"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Expiry / Renewal Date (Optional):</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Additional Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Zero-depreciation rider add-on included"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-colors"
                >
                  {saving ? 'Saving...' : 'Save to Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
