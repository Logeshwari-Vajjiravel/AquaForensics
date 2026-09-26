import waterBodiesRaw from "@/data/waterBodies.json";
import historicalDataRaw from "@/data/historicalData.json";
import replacementDataRaw from "@/data/replacementData.json";
import riskFactorsRaw from "@/data/riskFactors.json";
import evidenceDataRaw from "@/data/evidenceData.json";

export type WaterBody = {
  id: string;
  name: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  historicalArea: number;
  currentArea: number;
  riskLevel: string;
  populationExposure: number;
  priorityScore?: number;
  downstreamPopulation?: number;
  summary: string;
  sourceNote: string;
};

export type HistoricalObservation = {
  waterBodyId: string;
  year: number;
  waterArea: number;
  builtUpArea: number;
  vegetationArea: number;
  classification: string;
  description: string;
};

export type ReplacementItem = {
  waterBodyId: string;
  category: string;
  hectares: number;
};

export type RiskFactor = {
  waterBodyId: string;
  waterLoss: number;
  urbanDevelopment: number;
  floodExposure: number;
  priority: string;
  score: number;
  reason: string;
};

export type EvidenceItem = {
  waterBodyId: string;
  type: string;
  year: number;
  finding: string;
  data: string;
  confidence: string;
};

export const waterBodies = waterBodiesRaw as WaterBody[];
export const historicalData = historicalDataRaw as HistoricalObservation[];
export const replacementData = replacementDataRaw as ReplacementItem[];
export const riskFactors = riskFactorsRaw as RiskFactor[];
export const evidenceData = evidenceDataRaw as EvidenceItem[];

export function getWaterBodyById(id: string): WaterBody | undefined {
  return waterBodies.find((waterBody) => waterBody.id === id);
}

export function getLossPercentage(waterBody: WaterBody): number {
  const total = waterBody.historicalArea || 1;
  return Number((((waterBody.historicalArea - waterBody.currentArea) / total) * 100).toFixed(1));
}

export function getAreaLost(waterBody: WaterBody): number {
  return waterBody.historicalArea - waterBody.currentArea;
}

export function getHistoricalSeries(waterBodyId: string) {
  return historicalData.filter((item) => item.waterBodyId === waterBodyId).sort((a, b) => a.year - b.year);
}

export function getReplacementSeries(waterBodyId: string) {
  return replacementData.filter((item) => item.waterBodyId === waterBodyId);
}

export function getRiskFactor(waterBodyId: string) {
  return riskFactors.find((item) => item.waterBodyId === waterBodyId);
}

export function getEvidenceFor(waterBodyId: string) {
  return evidenceData.filter((item) => item.waterBodyId === waterBodyId);
}
