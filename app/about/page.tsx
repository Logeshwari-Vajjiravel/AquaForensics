export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#eff4f3] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900">AquaForensics</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          AquaForensics is a prototype environmental intelligence platform designed to help investigators reason through historical water-body loss, land-use change, and urban encroachment in a clear and structured manner.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The application uses local demonstration data to show how changes in water extent, built-up area, flood-risk overlays, and historical observations can be assembled into an evidence-backed investigation workflow.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Prototype / Demonstration Dataset — this app is not a scientific measurement system and should be treated as a working prototype for GIS investigation workflows.
        </div>
      </div>
    </main>
  );
}
