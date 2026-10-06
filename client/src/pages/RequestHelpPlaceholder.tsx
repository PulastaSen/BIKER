import { ArrowLeft, Wrench } from 'lucide-react';

type RequestHelpPlaceholderProps = { onReturn: () => void };

export function RequestHelpPlaceholder({ onReturn }: RequestHelpPlaceholderProps) {
  return (
    <main className="placeholder-page">
      <section className="placeholder-card" aria-labelledby="request-help-title">
        <div className="feature-card__icon" aria-hidden="true"><Wrench size={28} /></div>
        <p className="eyebrow">MotoAssist assistance</p>
        <h1 id="request-help-title">Request Help</h1>
        <p>This request flow will be available once rider accounts and assistance requests are built.</p>
        <button className="text-link" onClick={onReturn}><ArrowLeft size={18} /> Return to home</button>
      </section>
    </main>
  );
}
