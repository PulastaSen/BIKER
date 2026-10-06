type SectionHeadingProps = { eyebrow?: string; title: string; children?: string };

export function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}
