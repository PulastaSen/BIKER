import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmergencyContacts, saveEmergencyContact, deleteEmergencyContact as removeContact } from '../../utils/appStorage';
import type { EmergencyContact } from '../../types/app';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { SafetyNotice } from '../../components/SafetyNotice';
import { PhoneCall, Plus, Trash2, ShieldAlert, Check, X } from 'lucide-react';

export function EmergencyContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');

  const loadContacts = () => {
    if (user) {
      setContacts(getEmergencyContacts(user.id));
    }
  };

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !phone) return;

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      userId: user.id,
      name,
      relationship: relationship || 'Family / Friend',
      phone,
    };

    saveEmergencyContact(newContact);
    loadContacts();
    setShowModal(false);
    setName('');
    setRelationship('');
    setPhone('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this emergency contact?')) {
      removeContact(id);
      loadContacts();
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">SAFETY FIRST</p>
          <h1>Emergency Contacts (ICE)</h1>
          <p className="subtitle">Keep family and riding buddies informed during rides.</p>
        </div>
        <div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Contact
          </Button>
        </div>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <SafetyNotice accident />
      </div>

      <h2 className="section-title">In Case of Emergency (ICE) List</h2>

      {contacts.length > 0 ? (
        <div className="contacts-grid">
          {contacts.map((c) => (
            <div key={c.id} className="contact-card">
              <div className="contact-card__icon">
                <PhoneCall size={22} />
              </div>
              <div className="contact-card__info">
                <h3>{c.name}</h3>
                <span className="relationship-tag">{c.relationship}</span>
                <strong className="phone-num">{c.phone}</strong>
              </div>
              <div className="contact-card__actions">
                <a href={`tel:${c.phone}`} className="button button--primary button--sm">
                  Call Now
                </a>
                <button
                  type="button"
                  className="icon-action-btn icon-action-btn--danger"
                  onClick={() => handleDelete(c.id)}
                  title="Remove contact"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PhoneCall}
          title="No Emergency Contacts Added"
          description="Add a trusted contact or riding partner so they can be notified if you require emergency roadside help."
          actionLabel="Add Emergency Contact"
          onAction={() => setShowModal(true)}
        />
      )}

      <div className="official-hotlines-card">
        <h3><ShieldAlert size={20} /> Official Emergency Hotlines (India)</h3>
        <div className="hotlines-grid">
          <div className="hotline-item">
            <strong>National Emergency: 112</strong>
            <span>All-in-one emergency dispatch</span>
            <a href="tel:112">Call 112</a>
          </div>
          <div className="hotline-item">
            <strong>Police Hotline: 100</strong>
            <span>Law enforcement assistance</span>
            <a href="tel:100">Call 100</a>
          </div>
          <div className="hotline-item">
            <strong>Ambulance: 102 / 108</strong>
            <span>Medical emergency response</span>
            <a href="tel:108">Call 108</a>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="custom-bike-modal">
          <div className="custom-bike-modal__content">
            <div className="modal-header">
              <h3>Add Emergency Contact</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="modal-form">
              <div className="form-group">
                <label htmlFor="contactNameInput">Contact Name *</label>
                <input
                  id="contactNameInput"
                  required
                  type="text"
                  autoComplete="name"
                  enterKeyHint="next"
                  placeholder="e.g. Anish Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactRelInput">Relationship</label>
                <input
                  id="contactRelInput"
                  type="text"
                  enterKeyHint="next"
                  placeholder="e.g. Brother, Riding Buddy, Spouse"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhoneInput">Phone Number *</label>
                <input
                  id="contactPhoneInput"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="done"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Check size={18} /> Save Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
