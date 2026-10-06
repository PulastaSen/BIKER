import { ArrowLeft, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
export function SimpleInfoPage({ title, description }: { title: string; description: string }) { return <main className="placeholder-page"><section className="placeholder-card"><div className="feature-card__icon"><Navigation /></div><p className="eyebrow">MotoAssist · Roadside Assistance</p><h1>{title}</h1><p>{description}</p><Link className="text-link" to="/"><ArrowLeft size={18} /> Back to home</Link></section></main>; }
