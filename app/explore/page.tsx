import Link from "next/link";
import { waterBodies, getLossPercentage } from "@/lib/data";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#eff4f3] text-slate-900">
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
          <Link href="/explore" className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400">
            Start Investigation
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Water body atlas</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Historical water-body risk view</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">City: Chennai</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">Prototype / Demonstration Dataset</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {waterBodies.map((waterBody) => {
            const loss = getLossPercentage(waterBody);
            return (
              <article key={waterBody.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{waterBody.city}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{waterBody.name}</h2>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${waterBody.riskLevel === "HIGH" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {waterBody.riskLevel}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Historical</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{waterBody.historicalArea} ha</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Current</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{waterBody.currentArea} ha</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Water loss</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{loss}%</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">{waterBody.summary}</p>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Risk</p>
                    <p className="text-sm font-medium text-slate-800">{waterBody.riskLevel}</p>
                  </div>
                  <Link href={`/investigate/${waterBody.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                    Investigate
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
