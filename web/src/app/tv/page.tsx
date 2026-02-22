import { getTvData } from "@/lib/tv-data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TvPage() {
  const data = await getTvData();
  const visibleStars = Math.min(48, Math.max(10, data.starScore));
  const completion = data.totalTasks === 0 ? 0 : Math.round((data.doneTasks / data.totalTasks) * 100);

  return (
    <div className="tv-stars min-h-screen px-4 py-5 text-[#edf5ff] sm:px-6 sm:py-6">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="rounded-3xl border border-[#32496a] bg-[#111c32cc] px-5 py-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8db3e6]">Public Family Dashboard</p>
              <h1 className="text-3xl font-bold">Household Job Jar TV</h1>
              <p className="text-sm text-[#bed1ef]">Live status board for the whole house. Stars grow as jobs get done.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:w-64">
              <Link href="/" className="rounded-xl border border-[#3c5d89] bg-[#132744] px-3 py-2 text-center text-sm font-semibold">
                Daily
              </Link>
              <Link href="/admin" className="rounded-xl border border-[#3c5d89] bg-[#132744] px-3 py-2 text-center text-sm font-semibold">
                Admin
              </Link>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <MetricCard label="Family Stars" value={`${data.starScore} ⭐`} accent="from-[#ffd46d] to-[#f9b847]" />
          <MetricCard label="Completion" value={`${completion}%`} accent="from-[#67c4ff] to-[#4f93ff]" />
          <MetricCard label="Total Jobs" value={String(data.totalTasks)} accent="from-[#8db0ff] to-[#6e90e1]" />
          <MetricCard label="Done" value={String(data.doneTasks)} accent="from-[#64d287] to-[#4db470]" />
          <MetricCard label="Overdue" value={String(data.rag.red)} accent="from-[#ff8a8a] to-[#dc5b5b]" />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
          <article className="rounded-3xl border border-[#32496a] bg-[#111c32cc] p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tonight&apos;s Energy</h2>
              <p className="text-xs text-[#a9c0e4]">RAG + Completion mix</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#345277] bg-[#0f2039] p-3">
                <p className="mb-2 text-sm font-semibold">RAG Split</p>
                <PieChart
                  values={[
                    { label: "Green", value: data.rag.green, color: "#2f8f51" },
                    { label: "Amber", value: data.rag.amber, color: "#c67a06" },
                    { label: "Red", value: data.rag.red, color: "#c03221" },
                  ]}
                />
              </div>
              <div className="rounded-2xl border border-[#345277] bg-[#0f2039] p-3">
                <p className="mb-2 text-sm font-semibold">Done vs Open</p>
                <PieChart
                  values={[
                    { label: "Done", value: data.doneTasks, color: "#2f8f51" },
                    { label: "Open", value: data.pendingTasks, color: "#6b7ea1" },
                  ]}
                />
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[#32496a] bg-[#111c32cc] p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Star Wall</h2>
              <p className="text-xs text-[#a9c0e4]">Each completed job adds stars</p>
            </div>
            <div className="rounded-2xl border border-[#345277] bg-[#0f2039] p-3">
              <div className="grid grid-cols-8 gap-1 text-center text-lg leading-none sm:grid-cols-10">
                {Array.from({ length: visibleStars }).map((_, index) => (
                  <span key={index} aria-hidden>
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-[#c6d7ef]">
              {data.rag.red > 0 ? `Focus on ${data.rag.red} overdue jobs to keep stars climbing.` : "No overdue jobs. Keep the streak alive."}
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-[#32496a] bg-[#111c32cc] p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Room Progress</h2>
            <p className="text-xs text-[#a9c0e4]">Completion and overdue by room</p>
          </div>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {data.roomLoad.map((room) => (
              <article key={room.room} className="rounded-2xl border border-[#345277] bg-[#0f2039] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold">{room.room}</p>
                  <p className="text-xs text-[#b5cae9]">
                    {room.done}/{room.total} done • {room.overdue} overdue
                  </p>
                </div>
                <div className="h-3 rounded-full bg-[#1f3555]">
                  <div className="h-3 rounded-full bg-gradient-to-r from-[#59d37f] to-[#37a867]" style={{ width: `${room.completion}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="rounded-2xl border border-[#32496a] bg-[#111c32cc] p-3 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-wide text-[#9fbae1]">{label}</p>
      <p className={`mt-1 bg-gradient-to-r ${accent} bg-clip-text text-3xl font-bold text-transparent`}>{value}</p>
    </article>
  );
}

function PieChart({
  values,
}: {
  values: Array<{ label: string; value: number; color: string }>;
}) {
  const total = Math.max(1, values.reduce((sum, item) => sum + item.value, 0));
  const slices = buildPieSlices(values, total);

  return (
    <div className="flex items-center gap-4">
      <svg width="170" height="170" viewBox="0 0 220 220" aria-label="Pie chart" className="shrink-0">
        <g transform="translate(110,110)">
          {slices.map((slice) => (
            <path key={slice.label} d={slice.path} fill={slice.color} stroke="#0b172a" strokeWidth="2" />
          ))}
          <circle r="42" fill="#0f2039" />
        </g>
      </svg>
      <ul className="space-y-1 text-sm">
        {values.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: item.color }} />
            <span className="text-[#d5e2f7]">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildPieSlices(values: Array<{ label: string; value: number; color: string }>, total: number) {
  const slices: Array<{ label: string; color: string; path: string }> = [];
  let angleCursor = -90;
  for (const item of values) {
    const sweep = (item.value / total) * 360;
    const start = angleCursor;
    const end = angleCursor + sweep;
    slices.push({
      label: item.label,
      color: item.color,
      path: pieSlicePath(0, 0, 90, start, end),
    });
    angleCursor = end;
  }
  return slices;
}

function pieSlicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(radians),
    y: cy + r * Math.sin(radians),
  };
}
