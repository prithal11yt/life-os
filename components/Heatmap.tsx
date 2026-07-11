const SCALE = ["#ebedf0", "#c9f0d6", "#8ce0aa", "#43c47c", "#16a34a"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Activity level from a raw daily count (captures + completions).
function level(count: number): string {
  if (count <= 0) return SCALE[0];
  if (count <= 2) return SCALE[1];
  if (count <= 4) return SCALE[2];
  if (count <= 7) return SCALE[3];
  return SCALE[4];
}

export default function Heatmap({
  countByDay,
  days,
  today,
  activeDays,
}: {
  countByDay: Record<string, number>;
  days: string[];
  today: string;
  activeDays?: number;
}) {
  const firstDow = new Date(days[0] + "T12:00:00Z").getUTCDay();
  const cells: (string | null)[] = [...Array(firstDow).fill(null), ...days];
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  let lastMonth = -1;
  const monthLabels = weeks.map((col) => {
    const firstDay = col.find(Boolean) as string | undefined;
    if (!firstDay) return "";
    const m = new Date(firstDay + "T12:00:00Z").getUTCMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      return MONTHS[m];
    }
    return "";
  });

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold">Activity Heatmap</span>
        {activeDays !== undefined && (
          <span className="text-[12px] font-semibold text-[var(--muted)]">{activeDays} active days</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="mb-1.5 flex pl-8 text-[11px] font-semibold text-[var(--faint)]">
          {monthLabels.map((m, i) => (
            <span key={i} className="w-[15px] shrink-0">{m}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-[7px] text-[11px] font-semibold text-[var(--faint)]">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((day, ri) => {
                  if (!day) return <span key={ri} className="h-3 w-3" />;
                  const count = countByDay[day] ?? 0;
                  return (
                    <span
                      key={ri}
                      title={`${day}: ${count} ${count === 1 ? "activity" : "activities"}`}
                      className={`h-3 w-3 rounded-[3px] ${day === today ? "ring-1 ring-[var(--green)] ring-offset-1" : ""}`}
                      style={{ background: level(count) }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-[var(--faint)]">
        <span>Less</span>
        {SCALE.map((c) => (
          <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
