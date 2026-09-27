"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AquaMap, { type AquaMapLayerState } from "@/components/AquaMap";
import {
  getAreaLost,
  getEvidenceFor,
  getHistoricalSeries,
  getLossPercentage,
  getReplacementSeries,
  getRiskFactor,
  type WaterBody,
  waterBodies,
} from "@/lib/data";

const layerDefaults: AquaMapLayerState = {
  historical: true,
  current: true,
  lost: true,
  builtUp: true,
  roads: true,
  buildings: true,
  drainage: true,
  floodRisk: true,
};

const pieColors = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f59e0b", "#f87171", "#a3a3a3"];
const LAKE_PATH =
  "M150,60 C205,55 258,80 275,120 C292,160 278,195 285,225 C292,258 255,285 210,288 " +
  "C178,290 155,278 122,282 C82,286 45,258 42,218 C39,180 62,158 58,120 " +
  "C54,85 92,58 130,60 C137,61 143,61 150,60 Z";

// Rough visual centroid of LAKE_PATH, used as the scale origin so the
// "current" blob shrinks inward from the same center as the historical one.
const LAKE_CENTER = { x: 163, y: 172 };

// Anchor points near the outer boundary of LAKE_PATH — used to scatter
// "encroachment" buildings/roads in the ring between the two boundaries.
const BOUNDARY_ANCHORS = [
  { x: 150, y: 62 }, { x: 272, y: 118 }, { x: 283, y: 222 },
  { x: 208, y: 286 }, { x: 124, y: 280 }, { x: 44, y: 216 }, { x: 60, y: 122 },
];

function SatelliteScene({
  variant,
  scale = 1,
  lossPercent,
  lat,
  lng,
}: {
  variant: "historical" | "current";
  scale?: number;
  lossPercent?: number;
  lat?: number;
  lng?: number;
}) {
  const isCurrent = variant === "current";
  const clampedScale = Math.min(1, Math.max(0.35, scale));

  return (
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <filter id={`noise-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed={isCurrent ? 7 : 3} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.2  0 0 0 0 0.35  0 0 0 0.25 0" />
        </filter>
        <radialGradient id={`terrain-${variant}`} cx="30%" cy="25%" r="85%">
          {isCurrent ? (
            <>
              <stop offset="0%" stopColor="#2a2620" />
              <stop offset="55%" stopColor="#1c1a17" />
              <stop offset="100%" stopColor="#0e0d0b" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#1c3b2e" />
              <stop offset="55%" stopColor="#14251d" />
              <stop offset="100%" stopColor="#0b1512" />
            </>
          )}
        </radialGradient>
        <linearGradient id={`water-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isCurrent ? "#22d3ee" : "#38bdf8"} stopOpacity="0.92" />
          <stop offset="100%" stopColor={isCurrent ? "#0e7490" : "#075985"} stopOpacity="0.96" />
        </linearGradient>
        <pattern id="encroach-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#7c2d12" opacity="0.4" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#f59e0b" strokeWidth="2" opacity="0.55" />
        </pattern>
      </defs>

      <rect width="400" height="320" fill={`url(#terrain-${variant})`} />

      <g stroke="rgba(148,163,184,0.08)" strokeWidth="1">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="320" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 20} x2="400" y2={i * 20} />
        ))}
      </g>

      <rect width="400" height="320" opacity="0.3" filter={`url(#noise-${variant})`} />

      {isCurrent ? (
        <>
          {/* lost-water ring: full historical footprint filled with the encroachment hatch */}
          <path d={LAKE_PATH} fill="url(#encroach-hatch)" />
          <path d={LAKE_PATH} fill="none" stroke="rgba(125,211,252,0.55)" strokeWidth="2" strokeDasharray="6 5" />

          {/* current, shrunk footprint covers the center, leaving only the ring visible */}
          <g style={{ transformOrigin: `${LAKE_CENTER.x}px ${LAKE_CENTER.y}px`, transform: `scale(${clampedScale})` }}>
            <path d={LAKE_PATH} fill={`url(#water-${variant})`} stroke="#5eead4" strokeWidth="2.5" />
            <path d={LAKE_PATH} opacity="0.25" filter={`url(#noise-${variant})`} />
          </g>

          {/* encroachment: buildings + roads scattered in the reclaimed ring */}
          <g fill="#d6d3d1" opacity="0.9">
            {BOUNDARY_ANCHORS.map((p, i) => (
              <rect key={i} x={p.x - 5} y={p.y - 4} width={7 + (i % 3)} height={6 + (i % 2) * 3} transform={`rotate(${(i * 37) % 90} ${p.x} ${p.y})`} />
            ))}
          </g>
          <g stroke="#a8a29e" strokeWidth="1.4" opacity="0.65">
            {BOUNDARY_ANCHORS.slice(0, 5).map((p, i) => (
              <line key={i} x1={p.x} y1={p.y} x2={p.x + (i % 2 === 0 ? 22 : -22)} y2={p.y + (i % 2 === 0 ? -14 : 14)} />
            ))}
          </g>
        </>
      ) : (
        <>
          <path d={LAKE_PATH} fill={`url(#water-${variant})`} stroke="#7dd3fc" strokeWidth="2.5" />
          <path d={LAKE_PATH} opacity="0.25" filter={`url(#noise-${variant})`} />
        </>
      )}

      <rect width="400" height="320" className="sat-scan" fill="url(#scan-gradient)" />
      <defs>
        <linearGradient id="scan-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="48%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.07" />
          <stop offset="52%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {typeof lat === "number" && typeof lng === "number" && (
        <text x="12" y="22" fill="#bae6fd" fontFamily="monospace" fontSize="10" opacity="0.85">
          {lat.toFixed(4)}°N, {lng.toFixed(4)}°E · SAT-7 optical
        </text>
      )}
      {isCurrent && typeof lossPercent === "number" && (
        <text x="388" y="22" fill="#fca5a5" fontFamily="monospace" fontSize="10" textAnchor="end" opacity="0.9">
          −{lossPercent}% vs baseline
        </text>
      )}

      <style>{`
        .sat-scan { animation: satscan 6s linear infinite; }
        @keyframes satscan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </svg>
  );
}

const QUESTIONS = [
  "What happened to this water body?",
  "How much water area has been lost?",
  "What replaced the lost area?",
  "Is this seasonal drying or permanent loss?",
  "Why is this water body high priority?",
  "What evidence supports this finding?",
  "Summarize this investigation.",
];

function buildAIAnswer(question: string, waterBody: WaterBody) {
  const evidence = getEvidenceFor(waterBody.id);
  const risk = getRiskFactor(waterBody.id);
  const loss = getLossPercentage(waterBody);

  const story: Record<string, { answer: string; evidence: string[]; confidence: number }> = {
    "What happened to this water body?": {
      answer: `${waterBody.name} shows a clear decline in water extent across the demonstration record. The historical footprint was ${waterBody.historicalArea} hectares compared with ${waterBody.currentArea} hectares today, a ${loss}% reduction in observed water extent.`,
      evidence: ["Historical observation", "Current observation", "Land-use change"],
      confidence: 92,
    },
    "How much water area has been lost?": {
      answer: `Approximately ${getAreaLost(waterBody)} hectares of historical water area are no longer classified as water in this dataset. That is equivalent to a ${loss}% reduction from the historical baseline.`,
      evidence: ["Water area change", "Historical record"],
      confidence: 95,
    },
    "What replaced the lost area?": {
      answer: `The dominant replacement pattern is urban conversion, with roads and built-up land driving most of the land-cover change. The dataset does not assert legal conclusions; it only documents the observed cover change.`,
      evidence: ["Land-use change", "Built-up growth"],
      confidence: 84,
    },
    "Is this seasonal drying or permanent loss?": {
      answer: `The trend is more consistent with persistent loss than isolated seasonal drying. The water extent remains materially below the historical baseline across multiple observation years.`,
      evidence: ["Trend analysis", "Historical record"],
      confidence: 78,
    },
    "Why is this water body high priority?": {
      answer: `This water body combines significant historical loss, notable urban development nearby, and flood sensitivity. The model score is ${risk?.score ?? 0}/100, and it is a decision-support indicator rather than a legal finding.`,
      evidence: ["Risk score", "Flood layer", "Drainage review"],
      confidence: 88,
    },
    "What evidence supports this finding?": {
      answer: `The findings are grounded in the historical series, land-use replacement records, and the evidence list on this dashboard. Each claim is shown as a prototype finding rather than a verified field measurement.`,
      evidence: evidence.map((item) => `${item.type} ${item.year}`),
      confidence: 90,
    },
    "Summarize this investigation.": {
      answer: `The investigation indicates persistent water decline, built-up replacement around the former boundary, and increased risk in the surrounding drainage context. These patterns are supported by the local demonstration dataset and should be treated as analytical evidence, not legal proof.`,
      evidence: ["Executive summary", "Risk analysis", "Evidence cards"],
      confidence: 87,
    },
  };

  return (
    story[question] ?? {
      answer: "Insufficient data available.",
      evidence: ["No direct evidence in the current dataset"],
      confidence: 40,
    }
  );
}

// Deterministic pseudo-random generator seeded by a string, so the fake
// "model metadata" (latency, token counts) stays stable per question
// instead of reshuffling on every render / causing hydration mismatches.
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return () => {
    h = (h * 9301 + 49297) % 233280;
    return h / 233280;
  };
}

function useTypewriter(text: string, active: boolean, speedMs = 10) {
  const [output, setOutput] = useState("");
  useEffect(() => {
    if (!active) {
      setOutput("");
      return;
    }
    setOutput("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOutput(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, active, speedMs]);
  return output;
}

export default function InvestigationViewer({ waterBody }: { waterBody: WaterBody }) {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedQuestion, setSelectedQuestion] = useState<string>(QUESTIONS[0]);
  const [isThinking, setIsThinking] = useState(false);
  const [comparisonPercent, setComparisonPercent] = useState<number>(58);
  const [layers, setLayers] = useState<AquaMapLayerState>(layerDefaults);
  const [reportVisible, setReportVisible] = useState<boolean>(false);
  const [reportRevealCount, setReportRevealCount] = useState<number>(0);

  const thinkingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const observations = getHistoricalSeries(waterBody.id);
  const replacement = getReplacementSeries(waterBody.id);
  const evidence = getEvidenceFor(waterBody.id);
  const risk = getRiskFactor(waterBody.id);
  const yearData = observations.map((obs) => ({ year: obs.year, waterArea: obs.waterArea }));
  const yearObservation = observations.find((obs) => obs.year === selectedYear) ?? observations[observations.length - 1];
  const ai = useMemo(() => buildAIAnswer(selectedQuestion, waterBody), [selectedQuestion, waterBody]);
  const priorityBodies = [...waterBodies].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  const changePercent = useMemo(() => getLossPercentage(waterBody), [waterBody]);

  const typedAnswer = useTypewriter(ai.answer, !isThinking, 10);

  const rand = useMemo(() => seededRandom(`${waterBody.id}-${selectedQuestion}`), [waterBody.id, selectedQuestion]);
  const latencySeconds = useMemo(() => (0.8 + rand() * 1.6).toFixed(1), [rand]);
  const tokenCount = useMemo(() => Math.round(120 + rand() * 180), [rand]);

  const toggleLayer = (key: keyof AquaMapLayerState) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleQuestion = (question: string) => {
    setSelectedQuestion(question);
    setIsThinking(true);
    if (thinkingTimeout.current) clearTimeout(thinkingTimeout.current);
    thinkingTimeout.current = setTimeout(() => setIsThinking(false), 900 + Math.random() * 500);
  };

  const reportTitles = [
    "Water body overview", "Executive summary", "Historical reconstruction", "Water loss",
    "Seasonal vs permanent loss", "Land-use replacement", "Flood & drainage context",
    "Encroachment indicators", "Consequence priority", "Evidence", "Limitations", "Confidence",
  ];

  const reportPoints = useMemo(
    () => [
      `Water Body Overview: ${waterBody.name} is a ${waterBody.city} water body in ${waterBody.district}. The demonstration dataset indicates a ${getLossPercentage(waterBody)}% reduction in historical water extent since the earliest observation.`,
      `Executive Summary: The available evidence shows a persistent decline in water extent from ${observations[0]?.year ?? 1990} to ${observations[observations.length - 1]?.year ?? 2025}. The body has lost ${getAreaLost(waterBody)} hectares compared with the historical footprint.`,
      `Historical Reconstruction: The historical series shows the body was larger and more connected in the earlier record, while the current state is more fragmented and more heavily surrounded by urban land cover.`,
      `Water Loss: ${getAreaLost(waterBody)} hectares have been lost, equivalent to a ${getLossPercentage(waterBody)}% decline from the historical footprint.`,
      `Seasonal vs Permanent Loss: The current classification is ${observations[observations.length - 1]?.classification ?? "Persistent Loss"}. The pattern is more consistent with persistent loss than isolated seasonal drying.`,
      `Land-use Replacement: The dominant replacement signal is urban conversion, with roads and buildings accounting for the largest share of the change in the local dataset.`,
      `Flood & Drainage Context: Potential downstream flood exposure is considered as a risk factor, but the dataset does not establish a legal or hydrologic causation claim without a calibrated model.`,
      `Encroachment Indicators: The evidence combines water-area decline, surrounding urban expansion, and edge conversion patterns to show a coherent encroachment story supported by the demo dataset.`,
      `Consequence Priority: Priority is weighted by historical loss, urban exposure, and flood sensitivity. The score is designed to guide investigation sequencing rather than determine legal status.`,
      `Evidence: The evidence record includes historical observations, land-use conversion notes, and flood-risk indicators drawn from the current study dataset.`,
      `Limitations: This is a prototype / demonstration dataset and should not be treated as a verified scientific, legal, or cadastral product.`,
      `Confidence: Confidence is high for the broad reduction pattern and moderate for causal attribution. Additional field verification would be needed for legal or hydrological conclusions.`,
    ],
    [waterBody, observations]
  );

  // Stagger the "generation" of each report card when the report opens,
  // so it reads like the model is writing section-by-section rather than
  // dumping all twelve cards on screen instantly.
  useEffect(() => {
    if (revealTimeout.current) clearTimeout(revealTimeout.current);
    if (!reportVisible) {
      setReportRevealCount(0);
      return;
    }
    setReportRevealCount(0);
    let i = 0;
    const revealNext = () => {
      i += 1;
      setReportRevealCount(i);
      if (i < reportPoints.length) {
        revealTimeout.current = setTimeout(revealNext, 350 + Math.random() * 300);
      }
    };
    revealTimeout.current = setTimeout(revealNext, 400);
    return () => {
      if (revealTimeout.current) clearTimeout(revealTimeout.current);
    };
  }, [reportVisible, reportPoints.length]);

  return (
    <div className="min-h-screen bg-[#f3f7f6] text-slate-900">
      <div className="mx-auto max-w-[1480px] px-4 py-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">AQUAFORENSICS</Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{waterBody.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">Explore network</Link>
            <button onClick={() => setReportVisible((current) => !current)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">{reportVisible ? "Hide report" : "Generate Investigation Report"}</button>
            <button onClick={() => window.print()} className="rounded-full border border-sky-600/20 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">Download PDF</button>
          </div>
        </header>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Investigation map</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Historical change detection</h2>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{waterBody.city}, {waterBody.district}</span>
            </div>

            <AquaMap
              latitude={waterBody.latitude}
              longitude={waterBody.longitude}
              layers={layers}
              waterArea={yearObservation?.waterArea ?? waterBody.currentArea}
              currentArea={waterBody.currentArea}
              historicalArea={waterBody.historicalArea}
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {Object.entries({ historical: "Historical water boundary", current: "Current water boundary", lost: "Lost water area", builtUp: "Built-up expansion", roads: "Roads", buildings: "Buildings", drainage: "Drainage", floodRisk: "Flood-risk areas" }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={layers[key as keyof AquaMapLayerState]} onChange={() => toggleLayer(key as keyof AquaMapLayerState)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Investigation summary</p>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">{waterBody.riskLevel} risk</span>
              </div>

              <div className="mt-4 space-y-3">
                <div><p className="text-slate-500">Historical extent</p><p className="text-3xl font-semibold text-slate-900">{waterBody.historicalArea} ha</p></div>
                <div><p className="text-slate-500">Current extent</p><p className="text-3xl font-semibold text-slate-900">{waterBody.currentArea} ha</p></div>
                <div><p className="text-slate-500">Water lost</p><p className="text-3xl font-semibold text-slate-900">{getAreaLost(waterBody)} ha</p></div>
                <div><p className="text-slate-500">Loss</p><p className="text-3xl font-semibold text-slate-900">{changePercent}%</p></div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-sky-300">AI Water Investigator</p>
              <div className="mt-4 space-y-2">
                {QUESTIONS.map((question) => (
                  <button key={question} onClick={() => handleQuestion(question)} className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${selectedQuestion === question ? "border-sky-400 bg-sky-500/10 text-sky-100" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"}`}>
                    {question}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{selectedQuestion}</p>
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">AquaVision AI · v2.4</span>
                </div>

                {isThinking ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-sky-300">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>Analyzing satellite evidence...</span>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {typedAnswer}
                      {typedAnswer.length < ai.answer.length && <span className="ml-0.5 animate-pulse text-sky-400">▍</span>}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Confidence {ai.confidence}%</span>
                      <span>•</span>
                      <span>{latencySeconds}s</span>
                      <span>•</span>
                      <span>{tokenCount} tokens</span>
                    </div>
                  </>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {ai.evidence.map((label) => (
                    <span key={label} className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-100">{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Historical timeline</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Water body extent over time</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">Demonstration dataset</span>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {observations.map((obs) => (
              <button key={obs.year} onClick={() => setSelectedYear(obs.year)} className={`rounded-2xl border p-4 text-left transition ${selectedYear === obs.year ? "border-sky-500 bg-sky-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{obs.year}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{obs.waterArea} ha</p>
                <p className="mt-1 text-sm text-slate-600">{obs.classification}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-72 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearData}>
                  <CartesianGrid stroke="#dfe7ee" strokeDasharray="3 3" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="waterArea" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected year</p>
              <h3 className="mt-2 text-3xl font-semibold text-slate-900">{selectedYear}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between"><span>Historical area</span><strong>{waterBody.historicalArea} ha</strong></div>
                <div className="flex justify-between"><span>Current area</span><strong>{yearObservation?.waterArea ?? waterBody.currentArea} ha</strong></div>
                <div className="flex justify-between"><span>Water lost</span><strong>{yearObservation ? Math.max(0, waterBody.historicalArea - yearObservation.waterArea) : getAreaLost(waterBody)} ha</strong></div>
                <div className="flex justify-between"><span>Loss</span><strong>{yearObservation ? (((waterBody.historicalArea - yearObservation.waterArea) / waterBody.historicalArea) * 100).toFixed(1) : changePercent}%</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Before / after</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Water-body extent comparison</h2>
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Before / after</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Water-body extent comparison</h2>

          {/* ↓↓↓ NEW: replaces everything that used to be here ↓↓↓ */}
          <div className="relative mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-900">
            <div className="relative h-[320px] w-full">
              {/* base layer: current, urbanized imagery */}
              <div className="absolute inset-0">
                <SatelliteScene
                  variant="current"
                  scale={Math.sqrt(waterBody.currentArea / Math.max(1, waterBody.historicalArea))}
                  lossPercent={changePercent}
                  lat={waterBody.latitude}
                  lng={waterBody.longitude}
                />
              </div>

              {/* overlay layer: historical imagery, revealed by the slider */}
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - comparisonPercent}% 0 0)` }}>
                <SatelliteScene variant="historical" lat={waterBody.latitude} lng={waterBody.longitude} />
              </div>

              <div className="absolute inset-y-0 z-30 w-[2px] bg-white/80" style={{ left: `${comparisonPercent}%` }} />
              <div
                className="absolute top-1/2 z-40 flex -translate-y-1/2 items-center justify-center rounded-full border border-white bg-slate-900/80 p-2 text-sm font-semibold text-white"
                style={{ left: `calc(${comparisonPercent}% - 16px)` }}
              >
                ↔
              </div>

              <div className="absolute bottom-10 left-4 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-sky-100 backdrop-blur">
                Historical imagery
              </div>
              <div className="absolute bottom-10 right-4 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-100 backdrop-blur">
                Current imagery
              </div>

              <input
                aria-label="Comparison slider"
                type="range"
                min={0}
                max={100}
                value={comparisonPercent}
                onChange={(event) => setComparisonPercent(Number(event.target.value))}
                className="absolute inset-x-0 bottom-3 z-50 mx-auto w-[90%] accent-sky-500"
              />
            </div>
          </div>
          {/* ↑↑↑ NEW block ends here ↑↑↑ */}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Extent decreased by</p><p className="mt-2 text-2xl font-semibold text-slate-900">{changePercent}%</p></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Built-up increased by</p><p className="mt-2 text-2xl font-semibold text-slate-900">{risk ? Math.round((risk.urbanDevelopment ?? 0) * 100) : 0}%</p></div>
          </div>
        </div>

            <div className="relative mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-900">
              <div className="grid h-[320px] grid-cols-2 overflow-hidden">
                <div className="relative bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.33),transparent_30%),linear-gradient(135deg,#1e293b,#0f172a_55%,#111827)]">
                  <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
                  <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[30%] border-4 border-sky-400/60 bg-sky-400/20" />
                  <div className="absolute inset-0 flex items-end justify-center pb-5 text-xs font-medium uppercase tracking-[0.2em] text-sky-100">Historical imagery</div>
                </div>
                <div className="relative bg-[radial-gradient(circle_at_70%_30%,rgba(101,163,13,0.18),transparent_20%),linear-gradient(160deg,#0f172a,#0b1120_50%,#111827)]">
                  <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
                  <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[30%] border-4 border-emerald-400/60 bg-emerald-400/20" />
                  <div className="absolute inset-0 flex items-end justify-center pb-5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-100">Current imagery</div>
                </div>
                <div className="absolute inset-y-0 left-0 z-20 w-full" style={{ clipPath: `inset(0 ${100 - comparisonPercent}% 0 0)` }}>
                  <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.33),transparent_30%),linear-gradient(135deg,#1e293b,#0f172a_55%,#111827)]" />
                </div>
              </div>
              <div className="absolute inset-y-0 z-30 w-[2px] bg-white/80" style={{ left: `${comparisonPercent}%` }} />
              <div className="absolute top-1/2 z-40 flex -translate-y-1/2 items-center justify-center rounded-full border border-white bg-slate-900/80 p-2 text-sm font-semibold text-white" style={{ left: `calc(${comparisonPercent}% - 16px)` }}>↔</div>
              <input aria-label="Comparison slider" type="range" min={0} max={100} value={comparisonPercent} onChange={(event) => setComparisonPercent(Number(event.target.value))} className="absolute inset-x-0 bottom-3 z-50 mx-auto w-[90%] accent-sky-500" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Extent decreased by</p><p className="mt-2 text-2xl font-semibold text-slate-900">{changePercent}%</p></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Built-up increased by</p><p className="mt-2 text-2xl font-semibold text-slate-900">{risk ? Math.round((risk.urbanDevelopment ?? 0) * 100) : 0}%</p></div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Seasonal drying or permanent loss?</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Classification logic</h2>

            <div className="mt-5 h-64 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearData}>
                  <defs>
                    <linearGradient id="waterTrend" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#dfe7ee" strokeDasharray="3 3" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="waterArea" stroke="#0ea5e9" fillOpacity={1} fill="url(#waterTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">{observations[observations.length - 1]?.classification ?? "Persistent Loss"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Water extent fluctuates seasonally but remains substantially below the historical baseline across multiple observation periods. The pattern is more consistent with persistent loss than isolated seasonal drying.</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What replaced the lost water?</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Land-use replacement analysis</h2>

            <div className="mt-5 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <div className="h-72 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={replacement} dataKey="hectares" nameKey="category" innerRadius={54} outerRadius={82} paddingAngle={2}>
                      {replacement.map((entry, index) => <Cell key={`${entry.category}-${index}`} fill={pieColors[index % pieColors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ha`, "Area"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total lost area</p><p className="mt-2 text-3xl font-semibold text-slate-900">{getAreaLost(waterBody)} ha</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead><tr className="text-slate-500"><th>Category</th><th className="text-right">Area</th></tr></thead>
                    <tbody>
                      {replacement.map((item) => (
                        <tr key={item.category} className="border-t border-slate-200"><td className="py-2">{item.category}</td><td className="py-2 text-right">{item.hectares} ha</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Encroachment watch</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Explainable risk indicator</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Current risk</p><p className="mt-2 text-4xl font-semibold text-red-700">{waterBody.riskLevel}</p></div>
              <div className="space-y-3">
                {[["Historical water loss", risk?.waterLoss ?? 0], ["Recent construction", risk?.urbanDevelopment ?? 0], ["Land-use conversion", risk?.waterLoss ?? 0], ["Drainage disruption", risk?.floodExposure ?? 0], ["Flood exposure", risk?.floodExposure ?? 0]].map(([label, value]) => (
                  <div key={String(label)}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-700"><span>{String(label)}</span><span>{Math.round(Number(value) * 100)}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-amber-400 to-red-500" style={{ width: `${Math.round(Number(value) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <p className="font-semibold text-slate-800">Why?</p>
                <ul className="mt-2 space-y-2">
                  <li>✓ Significant historical water loss</li>
                  <li>✓ Recent built-up expansion</li>
                  <li>✓ Construction close to the historical boundary</li>
                  <li>✓ Flood-sensitive downstream area</li>
                </ul>
                <p className="mt-3 text-xs leading-5 text-slate-500">Risk score = water-loss factor + recent-change factor + flood exposure factor + drainage factor. This is an analytical indicator, not a legal determination.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Why does this loss matter?</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Flood and drainage context</h2>
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Water-body loss</span>
                <span className="text-slate-400">↓</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Reduced storage</span>
                <span className="text-slate-400">↓</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Drainage pressure</span>
                <span className="text-slate-400">↓</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Potential downstream flood exposure</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm leading-6 text-slate-700">Downstream flood exposure is evaluated as a potential risk condition, not as proof of causation. The analysis considers reduced water storage, drainage route disruption, and low-elevation land use near the water body.</p></div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Priority for investigation</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Consequence ranking</h2>
            <div className="mt-5 space-y-3">
              {priorityBodies.map((body, index) => (
                <div key={body.id} className={`rounded-2xl border p-3 ${body.id === waterBody.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-sm font-semibold text-slate-800">{index + 1}. {body.name}</p><p className="text-xs text-slate-500">{body.city}</p></div>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">{body.priorityScore ?? 0} priority</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Evidence</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Inspection record</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {evidence.map((item) => (
              <div key={`${item.type}-${item.year}-${item.data}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.type}</p><span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">{item.confidence}</span></div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.finding}</p>
                <div className="mt-4 space-y-1 text-xs text-slate-500"><p><strong>Year:</strong> {item.year}</p><p><strong>Data:</strong> {item.data}</p></div>
              </div>
            ))}
          </div>
        </section>

        {reportVisible && (
          <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Investigation report</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Executive summary</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {reportRevealCount < reportPoints.length
                    ? `Generating section ${reportRevealCount + 1} of ${reportPoints.length}...`
                    : `Report generated · AquaVision AI v2.4 · ${reportPoints.length} sections`}
                </p>
              </div>
              <button
                disabled={reportRevealCount < reportPoints.length}
                onClick={async () => {
                  const { jsPDF } = await import("jspdf");
                  const pdf = new jsPDF();
                  pdf.text("AquaForensics Investigation Report", 14, 16);
                  pdf.text("Prototype / Demonstration Dataset", 14, 24);
                  pdf.text(`${waterBody.name} • ${waterBody.riskLevel} priority`, 14, 32);
                  pdf.text(`Historical area: ${waterBody.historicalArea} ha`, 14, 40);
                  pdf.text(`Current area: ${waterBody.currentArea} ha`, 14, 48);
                  pdf.text(`Loss: ${getLossPercentage(waterBody)}%`, 14, 56);
                  pdf.save("aquaforensics-report.pdf");
                }}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Export PDF
              </button>
            </div>

            <div className="space-y-6 text-sm leading-7 text-slate-700">
              {reportPoints.map((content, index) => {
                const isGenerated = index < reportRevealCount;
                return (
                  <div key={reportTitles[index]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {index + 1}. {reportTitles[index]}
                    </p>
                    {!isGenerated ? (
                      <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span>Drafting this section...</span>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-700">{content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
