export default function BarChart({
  data,
  valueFormatter,
  height = 140,
}: {
  data: { label: string; value: number }[];
  valueFormatter?: (value: number) => string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const format = valueFormatter ?? ((v: number) => String(v));

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const px = d.value > 0 ? Math.max(2, Math.round((d.value / max) * height)) : 0;
        return (
          <div
            key={`${d.label}-${i}`}
            className="group relative flex-1"
            title={`${d.label}: ${format(d.value)}`}
          >
            <div
              className="w-full rounded-t bg-walnut-300 transition-colors group-hover:bg-walnut-500"
              style={{ height: px }}
            />
          </div>
        );
      })}
    </div>
  );
}
