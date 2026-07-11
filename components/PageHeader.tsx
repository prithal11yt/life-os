export default function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[25px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[13.5px] text-[var(--muted2)]">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
