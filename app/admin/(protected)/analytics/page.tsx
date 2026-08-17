import BarChart from "@/components/BarChart";
import HorizontalBars from "@/components/HorizontalBars";
import { getAnalytics } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

function formatDayLabel(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const cardClass = "rounded-2xl border border-walnut-100 bg-white/60 p-5";
const panelClass = "rounded-2xl border border-walnut-100 bg-white/60 p-5";
const panelTitleClass = "mb-4 font-serif text-lg font-semibold text-ink";

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalytics();
  const { health } = analytics;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink/60">
          Sales, traffic, and site health for the last 30 days.
        </p>
      </div>

      {/* Site health */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              health.dbOk ? "bg-emerald-500" : "bg-danger-500"
            }`}
          />
          <h2 className="font-serif text-lg font-semibold text-ink">
            Site health — {health.dbOk ? "All systems normal" : "Database unreachable"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Database</p>
            <p
              className={`mt-2 font-serif text-xl font-semibold ${
                health.dbOk ? "text-ink" : "text-danger-500"
              }`}
            >
              {health.dbOk ? "Connected" : "Down"}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">DB latency</p>
            <p className="mt-2 font-serif text-xl font-semibold text-ink">
              {health.dbOk ? `${health.dbLatencyMs}ms` : "—"}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">App uptime</p>
            <p className="mt-2 font-serif text-xl font-semibold text-ink">
              {formatDuration(health.uptimeSeconds)}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Node</p>
            <p className="mt-2 font-serif text-xl font-semibold text-ink">
              {health.nodeVersion}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Environment</p>
            <p className="mt-2 font-serif text-xl font-semibold capitalize text-ink">
              {health.env}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Last order</p>
            <p className="mt-2 font-serif text-xl font-semibold text-ink">
              {formatDateTime(health.lastOrderAt)}
            </p>
          </div>
        </div>
        {!health.dbOk && (
          <p className="mt-3 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">
            The database could not be reached, so sales and traffic figures below are unavailable.
          </p>
        )}
      </section>

      {/* Sales */}
      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Sales</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Revenue (30d)
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink">
              {formatPrice(analytics.revenueLast30)}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Orders (30d)
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink">
              {analytics.ordersLast30}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Avg. order value
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink">
              {formatPrice(analytics.avgOrderValue)}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              All-time revenue
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink">
              {formatPrice(analytics.totalRevenue)}
            </p>
          </div>
        </div>

        <div className={`mt-6 ${panelClass}`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-ink">Revenue, last 30 days</h3>
            <p className="text-xs text-ink/50">
              {formatDayLabel(analytics.salesByDay[0]?.day)} –{" "}
              {formatDayLabel(analytics.salesByDay[analytics.salesByDay.length - 1]?.day)}
            </p>
          </div>
          <BarChart
            data={analytics.salesByDay.map((d) => ({ label: formatDayLabel(d.day), value: d.revenue }))}
            valueFormatter={(v) => formatPrice(v)}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className={panelClass}>
            <h3 className={panelTitleClass}>Top products</h3>
            <HorizontalBars
              data={analytics.topProducts.map((p) => ({ label: p.name, value: p.revenue }))}
              valueFormatter={(v) => formatPrice(v)}
              emptyLabel="No sales yet."
            />
          </div>
          <div className={panelClass}>
            <h3 className={panelTitleClass}>Sales by category</h3>
            <HorizontalBars
              data={analytics.salesByCategory.map((c) => ({
                label: c.category,
                value: c.revenue,
              }))}
              valueFormatter={(v) => formatPrice(v)}
              emptyLabel="No sales yet."
            />
          </div>
          <div className={panelClass}>
            <h3 className={panelTitleClass}>Orders by status</h3>
            <HorizontalBars
              data={analytics.ordersByStatus.map((s) => ({
                label: s.status[0].toUpperCase() + s.status.slice(1),
                value: s.count,
              }))}
              emptyLabel="No orders yet."
            />
          </div>
        </div>
      </section>

      {/* Traffic */}
      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Traffic</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              Page views (30d)
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink">
              {analytics.viewsLast30}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              All-time views
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink">
              {analytics.viewsAllTime}
            </p>
          </div>
        </div>

        <div className={`mt-6 ${panelClass}`}>
          <h3 className={panelTitleClass}>Page views, last 30 days</h3>
          <BarChart
            data={analytics.pageViewsByDay.map((d) => ({
              label: formatDayLabel(d.day),
              value: d.views,
            }))}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className={panelClass}>
            <h3 className={panelTitleClass}>Top pages</h3>
            <HorizontalBars
              data={analytics.topPages.map((p) => ({ label: p.path, value: p.views }))}
              emptyLabel="No page views recorded yet."
            />
          </div>
          <div className={panelClass}>
            <h3 className={panelTitleClass}>Top referrers</h3>
            <HorizontalBars
              data={analytics.topReferrers.map((r) => ({ label: r.referrer, value: r.views }))}
              emptyLabel="No external referrers yet — direct traffic isn't shown here."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
