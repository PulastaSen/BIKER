import type { LucideIcon } from 'lucide-react';

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  children: string;
};

export function FeatureCard({ icon: Icon, title, children }: FeatureCardProps) {
  return (
    <article className="feature-card">
      <div className="feature-card__icon" aria-hidden="true"><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}
