import Link from "next/link";

const featureCards = [
  { title: "Historical Reconstruction", description: "Track water bodies across decades using structured historical observations." },
  { title: "Change Detection", description: "Measure disappearance and compare water extent against urban expansion." },
  { title: "AI Investigation", description: "Turn geospatial evidence into a readable, traceable investigation summary." },
];

const searchExamples = ["Pallikaranai Marsh", "Velachery Lake", "Porur Lake", "Korattur Lake", "Chembarambakkam Lake"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#edf3f3] text-slate-900">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sm font-semibold text-sky-200">A</div>
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-sky-200">AquaForensics</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="/">Home</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/about">About</Link>
          </nav>
          <Link href="/explore" className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400">
            Start Investigation
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_23%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_26%),linear-gradient(135deg,#020617,#0f172a_50%,#111827)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] [background-size:26px_26px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
              Prototype / Demonstration Dataset
            </p>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white lg:text-6xl">
              Investigate How India&apos;s Water Bodies Are Disappearing
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Explore historical changes, identify lost water areas, and understand the consequences of urban expansion through structured satellite evidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/explore" className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400">Start Investigation</Link>
              <Link href="/explore" className="rounded-full border border-slate-600 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500">Explore Water Loss</Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {searchExamples.map((example) => (
                <span key={example} className="rounded-full border border-slate-700 bg-slate-900/65 px-3 py-1 text-xs font-medium text-slate-200">
                  {example}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[32px] border border-slate-700 bg-slate-900/80 shadow-[0_28px_80px_rgba(15,23,42,0.45)]">
              <div className="h-[500px] w-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.22),transparent_25%),radial-gradient(circle_at_75%_60%,rgba(14,165,233,0.16),transparent_25%),linear-gradient(135deg,#1e293b,#0f172a_48%,#111827)] p-5">
                <div className="flex h-full flex-col justify-between rounded-[24px] border border-slate-700 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
                    <span>Satellite atlas</span>
                    <span>2025</span>
                  </div>

                  <div className="relative flex-1 overflow-hidden rounded-[20px] border border-slate-700 bg-[#0f172a]">
                    <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.09)_1px,transparent_1px)] [background-size:22px_22px]" />
                    <div className="absolute left-[18%] top-[22%] h-28 w-28 rounded-[32%] border-4 border-sky-400/70 bg-sky-400/15 shadow-[0_0_35px_rgba(14,165,233,0.28)]" />
                    <div className="absolute left-[45%] top-[48%] h-24 w-24 rounded-[30%] border-4 border-emerald-400/70 bg-emerald-500/15 shadow-[0_0_25px_rgba(52,211,153,0.24)]" />
                    <div className="absolute right-[18%] top-[28%] h-20 w-20 rounded-[30%] border-4 border-orange-400/70 bg-orange-400/15 shadow-[0_0_25px_rgba(251,146,60,0.25)]" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 to-transparent" />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Historical</p>
                      <p className="mt-2 text-xl font-semibold text-white">124 ha</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Current</p>
                      <p className="mt-2 text-xl font-semibold text-white">47 ha</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Loss</p>
                      <p className="mt-2 text-xl font-semibold text-white">62%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div key={card.title} className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-lg text-sky-700">•</div>
              <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
