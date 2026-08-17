export default function HorizontalBars({
  data,
  valueFormatter,
  emptyLabel = "No data yet.",
}: {
  data: { label: string; value: number }[];
  valueFormatter?: (value: number) => string;
  emptyLabel?: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-ink/50">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));
  const format = valueFormatter ?? ((v: number) => String(v));

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-ink/70">{d.label}</span>
            <span className="shrink-0 font-medium text-ink">{format(d.value)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-walnut-50">
            <div
              className="h-2 rounded-full bg-walnut-400"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
