export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type WaterBody = {
  id: string;
  name: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  historicalArea: number;
  currentArea: number;
  riskLevel: RiskLevel;
  priorityScore: number;
  downstreamPopulation: number;
  summary: string;
};

export type Observation = {
  year: number;
  waterArea: number;
  builtUpArea: number;
  vegetationArea: number;
  classification: "SEASONAL VARIATION" | "PERSISTENT WATER LOSS" | "LAND CONVERSION" | "INSUFFICIENT DATA";
  description: string;
};

export type ReplacementItem = {
  category: string;
  hectares: number;
};

export type RiskFactor = {
  waterLoss: number;
  builtUpGrowth: number;
  floodExposure: number;
  drainageRisk: number;
  score: number;
  reason: string;
};

export type EvidenceItem = {
  id: string;
  type: string;
  year: string;
  description: string;
  source: string;
  confidence: "High" | "Medium" | "Low";
};

export const waterBodies: WaterBody[] = [
  {
    id: "pallikaranai-marsh",
    name: "Pallikaranai Marsh",
    city: "Chennai",
    district: "Chennai",
    latitude: 12.924,
    longitude: 80.214,
    historicalArea: 124,
    currentArea: 47,
    riskLevel: "HIGH",
    priorityScore: 88,
    downstreamPopulation: 185000,
    summary:
      "A once-connected marsh system now reduced to fragmented wetland pockets amid dense urban growth.",
  },
  {
    id: "chembarambakkam-lake",
    name: "Chembarambakkam Lake",
    city: "Chennai",
    district: "Chennai",
    latitude: 13.035,
    longitude: 80.073,
    historicalArea: 200,
    currentArea: 163,
    riskLevel: "MEDIUM",
    priorityScore: 68,
    downstreamPopulation: 148000,
    summary:
      "The lake retains much of its historical footprint, but downstream exposure and seasonal fluctuation continue to matter.",
  },
  {
    id: "velachery-lake",
    name: "Velachery Lake",
    city: "Chennai",
    district: "Chennai",
    latitude: 12.978,
    longitude: 80.221,
    historicalArea: 96,
    currentArea: 38,
    riskLevel: "HIGH",
    priorityScore: 83,
    downstreamPopulation: 137000,
    summary:
      "Urban infill and drainage alteration have reduced the lake’s storage and increased runoff stress nearby.",
  },
  {
    id: "korattur-lake",
    name: "Korattur Lake",
    city: "Chennai",
    district: "Chennai",
    latitude: 13.117,
    longitude: 80.204,
    historicalArea: 118,
    currentArea: 55,
    riskLevel: "HIGH",
    priorityScore: 79,
    downstreamPopulation: 124000,
    summary:
      "A substantial reduction in extent is associated with newly urbanized edges and increased flood-sensitive catchments.",
  },
  {
    id: "porur-lake",
    name: "Porur Lake",
    city: "Chennai",
    district: "Chennai",
    latitude: 13.043,
    longitude: 80.156,
    historicalArea: 83,
    currentArea: 49,
    riskLevel: "MEDIUM",
    priorityScore: 74,
    downstreamPopulation: 96000,
    summary:
      "A moderate but persistent reduction points to land conversion and drainage disruption surrounding the lake fringe.",
  },
];

export const observationsByWaterBody: Record<string, Observation[]> = {
  "pallikaranai-marsh": [
    { year: 1985, waterArea: 124, builtUpArea: 12, vegetationArea: 70, classification: "PERSISTENT WATER LOSS", description: "Historical marsh extent remained connected through wetland pockets and seasonal channels." },
    { year: 1995, waterArea: 104, builtUpArea: 27, vegetationArea: 58, classification: "PERSISTENT WATER LOSS", description: "Urban growth began reducing wetland continuity and storage along the marsh edge." },
    { year: 2005, waterArea: 87, builtUpArea: 41, vegetationArea: 42, classification: "PERSISTENT WATER LOSS", description: "Wetland conversion intensified along the core and northern edge of the marsh." },
    { year: 2015, waterArea: 63, builtUpArea: 57, vegetationArea: 29, classification: "PERSISTENT WATER LOSS", description: "The marsh retained only fragmented water pockets with a large built-up footprint nearby." },
    { year: 2025, waterArea: 47, builtUpArea: 68, vegetationArea: 20, classification: "PERSISTENT WATER LOSS", description: "Satellite observation indicates a persistently reduced water extent and a dense built-up replacement pattern." },
  ],
  "chembarambakkam-lake": [
    { year: 1985, waterArea: 200, builtUpArea: 18, vegetationArea: 76, classification: "SEASONAL VARIATION", description: "The lake retained a broadly stable shoreline with seasonal water variation." },
    { year: 1995, waterArea: 191, builtUpArea: 22, vegetationArea: 75, classification: "SEASONAL VARIATION", description: "Seasonal fluctuation remained visible, but the water body stayed largely intact." },
    { year: 2005, waterArea: 184, builtUpArea: 26, vegetationArea: 70, classification: "SEASONAL VARIATION", description: "The lake remained mostly stable with moderate change around the periphery." },
    { year: 2015, waterArea: 172, builtUpArea: 35, vegetationArea: 62, classification: "SEASONAL VARIATION", description: "Seasonal decline widened, though the lake retained much of its historical area." },
    { year: 2025, waterArea: 163, builtUpArea: 42, vegetationArea: 57, classification: "SEASONAL VARIATION", description: "Water area remains below historical levels, but the pattern suggests a mixture of seasonal and structural change." },
  ],
  "velachery-lake": [
    { year: 1985, waterArea: 96, builtUpArea: 16, vegetationArea: 61, classification: "PERSISTENT WATER LOSS", description: "A relatively intact lake with a narrow urban fringe." },
    { year: 1995, waterArea: 82, builtUpArea: 28, vegetationArea: 47, classification: "PERSISTENT WATER LOSS", description: "Built-up expansion accelerated along the lake margins." },
    { year: 2005, waterArea: 68, builtUpArea: 39, vegetationArea: 33, classification: "PERSISTENT WATER LOSS", description: "The lake edge was increasingly fragmented by settlement and roads." },
    { year: 2015, waterArea: 51, builtUpArea: 52, vegetationArea: 24, classification: "PERSISTENT WATER LOSS", description: "The lake dominated less of the surrounding landscape as urban coverage intensified." },
    { year: 2025, waterArea: 38, builtUpArea: 63, vegetationArea: 17, classification: "PERSISTENT WATER LOSS", description: "A strongly reduced water extent remains evident across the current observation period." },
  ],
  "korattur-lake": [
    { year: 1985, waterArea: 118, builtUpArea: 21, vegetationArea: 64, classification: "LAND CONVERSION", description: "The basin was largely water and vegetated edge habitat." },
    { year: 1995, waterArea: 102, builtUpArea: 32, vegetationArea: 54, classification: "LAND CONVERSION", description: "Peripheral development began replacing water-adjacent land." },
    { year: 2005, waterArea: 89, builtUpArea: 43, vegetationArea: 39, classification: "LAND CONVERSION", description: "Much of the former fringe was converted to built-up and transport infrastructure." },
    { year: 2015, waterArea: 67, builtUpArea: 54, vegetationArea: 29, classification: "LAND CONVERSION", description: "The remaining water body is constrained by urban encroachment and drainage alterations." },
    { year: 2025, waterArea: 55, builtUpArea: 60, vegetationArea: 21, classification: "LAND CONVERSION", description: "Current evidence points to substantial conversion of former water area into surrounding urban land." },
  ],
  "porur-lake": [
    { year: 1985, waterArea: 83, builtUpArea: 15, vegetationArea: 58, classification: "PERSISTENT WATER LOSS", description: "The lake retained a comparatively larger water footprint relative to surrounding edge development." },
    { year: 1995, waterArea: 77, builtUpArea: 22, vegetationArea: 51, classification: "PERSISTENT WATER LOSS", description: "Water extent declined gradually while surrounding urban land expanded." },
    { year: 2005, waterArea: 68, builtUpArea: 29, vegetationArea: 41, classification: "PERSISTENT WATER LOSS", description: "Persistent reduction is visible around the western and southern edges." },
    { year: 2015, waterArea: 57, builtUpArea: 38, vegetationArea: 29, classification: "PERSISTENT WATER LOSS", description: "The current vector indicates a shrinking water body with more built-up land in the surrounding catchment." },
    { year: 2025, waterArea: 49, builtUpArea: 46, vegetationArea: 21, classification: "PERSISTENT WATER LOSS", description: "The water extent remains substantially reduced compared with the historical footprint." },
  ],
};

export const replacementByWaterBody: Record<string, ReplacementItem[]> = {
  "pallikaranai-marsh": [
    { category: "Buildings", hectares: 31 },
    { category: "Roads", hectares: 8 },
    { category: "Agriculture", hectares: 14 },
    { category: "Vegetation", hectares: 11 },
    { category: "Bare land", hectares: 7 },
    { category: "Other", hectares: 6 },
  ],
  "chembarambakkam-lake": [
    { category: "Buildings", hectares: 11 },
    { category: "Roads", hectares: 5 },
    { category: "Agriculture", hectares: 8 },
    { category: "Vegetation", hectares: 7 },
    { category: "Bare land", hectares: 4 },
    { category: "Other", hectares: 2 },
  ],
  "velachery-lake": [
    { category: "Buildings", hectares: 25 },
    { category: "Roads", hectares: 9 },
    { category: "Agriculture", hectares: 8 },
    { category: "Vegetation", hectares: 10 },
    { category: "Bare land", hectares: 4 },
    { category: "Other", hectares: 2 },
  ],
  "korattur-lake": [
    { category: "Buildings", hectares: 22 },
    { category: "Roads", hectares: 11 },
    { category: "Agriculture", hectares: 9 },
    { category: "Vegetation", hectares: 12 },
    { category: "Bare land", hectares: 6 },
    { category: "Other", hectares: 3 },
  ],
  "porur-lake": [
    { category: "Buildings", hectares: 15 },
    { category: "Roads", hectares: 6 },
    { category: "Agriculture", hectares: 7 },
    { category: "Vegetation", hectares: 9 },
    { category: "Bare land", hectares: 5 },
    { category: "Other", hectares: 2 },
  ],
};

export const riskFactorsByWaterBody: Record<string, RiskFactor> = {
  "pallikaranai-marsh": {
    waterLoss: 0.62,
    builtUpGrowth: 0.91,
    floodExposure: 0.82,
    drainageRisk: 0.79,
    score: 88,
    reason: "Significant historical water loss, substantial recent built-up expansion, and a flood-sensitive downstream setting.",
  },
  "chembarambakkam-lake": {
    waterLoss: 0.18,
    builtUpGrowth: 0.34,
    floodExposure: 0.59,
    drainageRisk: 0.56,
    score: 68,
    reason: "The lake still holds a sizeable footprint, but seasonal variation and proximity to dense urban drains remain relevant.",
  },
  "velachery-lake": {
    waterLoss: 0.60,
    builtUpGrowth: 0.87,
    floodExposure: 0.78,
    drainageRisk: 0.81,
    score: 83,
    reason: "High water loss combined with dense construction near the historical boundary and flood-sensitive drainage paths.",
  },
  "korattur-lake": {
    waterLoss: 0.53,
    builtUpGrowth: 0.82,
    floodExposure: 0.74,
    drainageRisk: 0.76,
    score: 79,
    reason: "A strong conversion signal and substantial nearby urbanization raise the risk of downstream drainage disruption.",
  },
  "porur-lake": {
    waterLoss: 0.41,
    builtUpGrowth: 0.62,
    floodExposure: 0.67,
    drainageRisk: 0.69,
    score: 74,
    reason: "Moderate water loss and increasing built-up coverage suggest a climate-sensitive and drainage-exposed basin.",
  },
};

export const evidenceByWaterBody: Record<string, EvidenceItem[]> = {
  "pallikaranai-marsh": [
    { id: "sat-1985", type: "Satellite observation", year: "1985", description: "Historical marsh extent remains substantially larger and more connected than the current extent.", source: "Demonstration dataset", confidence: "High" },
    { id: "sat-2025", type: "Satellite observation", year: "2025", description: "Current extent shows fragmentation and a compacted wetland footprint within urbanized land use.", source: "Demonstration dataset", confidence: "High" },
    { id: "land-2005-2025", type: "Land-use change", year: "2005 → 2025", description: "Built-up area increased while water area decreased and vegetation cover shifted around the wetland fringe.", source: "Demonstration dataset", confidence: "High" },
    { id: "flood-2025", type: "Flood-risk layer", year: "2025", description: "Low-lying downstream areas are modelled as more flood-sensitive, but causation is not asserted without a calibrated hydrological model.", source: "Demonstration dataset", confidence: "Medium" },
    { id: "drainage-2025", type: "Drainage analysis", year: "2025", description: "Drainage corridors align with the reduced wetland footprint and urbanized edge conditions.", source: "Demonstration dataset", confidence: "Medium" },
  ],
  "chembarambakkam-lake": [
    { id: "chem-1985", type: "Satellite observation", year: "1985", description: "The lake's historical extent stayed broad across a seasonal cycle.", source: "Demonstration dataset", confidence: "High" },
    { id: "chem-2025", type: "Satellite observation", year: "2025", description: "The lake remains above the severe-loss threshold but shows a smaller current footprint and moderate seasonal variability.", source: "Demonstration dataset", confidence: "High" },
    { id: "chem-2005-2025", type: "Land-use change", year: "2005 → 2025", description: "The surrounding built-up area increased modestly relative to the historical water footprint.", source: "Demonstration dataset", confidence: "Medium" },
    { id: "chem-drainage", type: "Drainage analysis", year: "2025", description: "Drainage influence remains present, but the evidence suggests a mixed seasonal and structural pattern rather than explosive loss.", source: "Demonstration dataset", confidence: "Medium" },
  ],
  "velachery-lake": [
    { id: "vel-1985", type: "Satellite observation", year: "1985", description: "The lake was previously wider and better connected to surrounding vegetated margins.", source: "Demonstration dataset", confidence: "High" },
    { id: "vel-2025", type: "Satellite observation", year: "2025", description: "Water extent is reduced to a much smaller current footprint alongside dense urban infrastructure.", source: "Demonstration dataset", confidence: "High" },
    { id: "vel-2005-2025", type: "Land-use change", year: "2005 → 2025", description: "Built-up growth and roadway expansion are concentrated near the previous water boundary.", source: "Demonstration dataset", confidence: "High" },
    { id: "vel-flood", type: "Flood-risk layer", year: "2025", description: "Downstream flood sensitivity is elevated where drainage routes intersect with reduced storage areas.", source: "Demonstration dataset", confidence: "Medium" },
  ],
  "korattur-lake": [
    { id: "kor-1985", type: "Satellite observation", year: "1985", description: "The historical basin was substantially larger and retained more open-water extent.", source: "Demonstration dataset", confidence: "High" },
    { id: "kor-2025", type: "Satellite observation", year: "2025", description: "Current observations indicate a smaller water footprint embedded in a dense urban context.", source: "Demonstration dataset", confidence: "High" },
    { id: "kor-2005-2025", type: "Land-use change", year: "2005 → 2025", description: "Urban conversion and infrastructure pressure explain much of the observed reduction around the lake fringe.", source: "Demonstration dataset", confidence: "High" },
    { id: "kor-flood", type: "Flood-risk layer", year: "2025", description: "Potential flood exposure is elevated around low-lying neighborhoods downstream of reduced water storage.", source: "Demonstration dataset", confidence: "Medium" },
  ],
  "porur-lake": [
    { id: "por-1985", type: "Satellite observation", year: "1985", description: "The water body had a larger footprint with a comparatively less developed fringe.", source: "Demonstration dataset", confidence: "High" },
    { id: "por-2025", type: "Satellite observation", year: "2025", description: "The current water extent is reduced but still comparatively more intact than some other urban lakes.", source: "Demonstration dataset", confidence: "High" },
    { id: "por-2005-2025", type: "Land-use change", year: "2005 → 2025", description: "The area has moved from a more open landscape toward a denser built-up edge.", source: "Demonstration dataset", confidence: "Medium" },
    { id: "por-drainage", type: "Drainage analysis", year: "2025", description: "Drainage and flood sensitivity remain relevant but are less severe than the highest-priority basins in the dataset.", source: "Demonstration dataset", confidence: "Medium" },
  ],
};

export function getLossPercent(body: WaterBody): number {
  return Number((((body.historicalArea - body.currentArea) / body.historicalArea) * 100).toFixed(1));
}

export function getAreaLost(body: WaterBody): number {
  return body.historicalArea - body.currentArea;
}

export function getWaterBodyById(id: string): WaterBody | undefined {
  return waterBodies.find((waterBody) => waterBody.id === id);
}

export const allPriorityWaterBodies = [...waterBodies].sort((a, b) => b.priorityScore - a.priorityScore);
