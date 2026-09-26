"use client";

import dynamic from "next/dynamic";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import { useMemo } from "react";

const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false, loading: () => <div className="h-[440px] w-full rounded-3xl bg-slate-900" /> },
);
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Polygon = dynamic(async () => (await import("react-leaflet")).Polygon, { ssr: false });
const Polyline = dynamic(async () => (await import("react-leaflet")).Polyline, { ssr: false });
const Circle = dynamic(async () => (await import("react-leaflet")).Circle, { ssr: false });
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false });

export type AquaMapLayerState = {
  historical: boolean;
  current: boolean;
  lost: boolean;
  builtUp: boolean;
  roads: boolean;
  buildings: boolean;
  drainage: boolean;
  floodRisk: boolean;
};

type AquaMapProps = {
  latitude: number;
  longitude: number;
  layers: AquaMapLayerState;
  waterArea: number;
  currentArea: number;
  historicalArea: number;
};

function buildPolygon(lat: number, lng: number, dx: number, dy: number): LatLngExpression[] {
  return [
    [lat + dx, lng - dy],
    [lat + dx, lng + dy],
    [lat - dx, lng + dy],
    [lat - dx, lng - dy],
  ];
}

export default function AquaMap({ latitude, longitude, layers, waterArea, currentArea, historicalArea }: AquaMapProps) {
  const center: LatLngTuple = useMemo(() => [latitude, longitude], [latitude, longitude]);

  const historicalPolygon = useMemo(
    () => buildPolygon(latitude, longitude, 0.028, 0.036),
    [latitude, longitude],
  );

  const currentPolygon = useMemo(
    () => buildPolygon(latitude + 0.002, longitude + 0.004, 0.02, 0.024),
    [latitude, longitude],
  );

  const floodPolygon = useMemo(
    () => buildPolygon(latitude - 0.005, longitude + 0.01, 0.042, 0.057),
    [latitude, longitude],
  );

  const roads = useMemo(
    () => [
      [latitude - 0.025, longitude - 0.05],
      [latitude - 0.017, longitude - 0.032],
      [latitude - 0.004, longitude - 0.008],
      [latitude + 0.012, longitude + 0.015],
      [latitude + 0.024, longitude + 0.038],
    ],
    [latitude, longitude],
  );

  const drainage = useMemo(
    () => [
      [latitude + 0.026, longitude - 0.06],
      [latitude + 0.016, longitude - 0.041],
      [latitude + 0.009, longitude - 0.019],
      [latitude + 0.002, longitude + 0.003],
      [latitude - 0.011, longitude + 0.025],
    ],
    [latitude, longitude],
  );

  const buildingPositions: LatLngTuple[] = useMemo(
    () => [
      [latitude + 0.019, longitude - 0.018],
      [latitude + 0.011, longitude - 0.013],
      [latitude + 0.009, longitude + 0.014],
      [latitude + 0.022, longitude + 0.018],
      [latitude - 0.005, longitude + 0.022],
      [latitude - 0.01, longitude - 0.023],
    ],
    [latitude, longitude],
  );

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-x-0 top-0 z-[500] flex items-center justify-between border-b border-white/10 bg-slate-950/55 px-4 py-3 backdrop-blur-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-sky-200/80">Demonstration dataset</p>
          <p className="text-sm font-medium text-slate-50">Geospatial evidence layer</p>
        </div>
        <div className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
          {waterArea.toFixed(0)} ha current water
        </div>
      </div>

      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-[520px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {layers.historical && (
          <Polygon positions={historicalPolygon} pathOptions={{ color: "#60a5fa", fillColor: "#60a5fa", fillOpacity: 0.22, weight: 2.5 }}>
            <Popup>Historical water area</Popup>
          </Polygon>
        )}

        {layers.current && (
          <Polygon positions={currentPolygon} pathOptions={{ color: "#34d399", fillColor: "#34d399", fillOpacity: 0.36, weight: 2.5 }}>
            <Popup>Current water boundary</Popup>
          </Polygon>
        )}

        {layers.lost && (
          <Polygon positions={historicalPolygon} pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.18, weight: 2 }}>
            <Popup>Lost water area (change detected between 1985 and 2025)</Popup>
          </Polygon>
        )}

        {layers.builtUp && (
          <Circle center={[latitude + 0.013, longitude + 0.006]} radius={2100} pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.24, weight: 1.5 }}>
            <Popup>Current built-up area</Popup>
          </Circle>
        )}

        {layers.roads && (
          <Polyline positions={roads as LatLngExpression[]} pathOptions={{ color: "#e2e8f0", opacity: 0.85, weight: 3 }}>
            <Popup>Roads</Popup>
          </Polyline>
        )}

        {layers.buildings && (
          <>
            {buildingPositions.map((position, index) => (
              <Circle key={index} center={position} radius={450} pathOptions={{ color: "#fbbf24", fillColor: "#fbbf24", fillOpacity: 0.3, weight: 1 }}>
                <Popup>Building footprint</Popup>
              </Circle>
            ))}
          </>
        )}

        {layers.drainage && (
          <Polyline positions={drainage as LatLngExpression[]} pathOptions={{ color: "#22d3ee", opacity: 0.8, weight: 3 }}>
            <Popup>Drainage corridor</Popup>
          </Polyline>
        )}

        {layers.floodRisk && (
          <Polygon positions={floodPolygon} pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.2, weight: 2.5 }}>
            <Popup>Flood-risk areas</Popup>
          </Polygon>
        )}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[500] rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-200 shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-slate-50">Water body statistics</p>
        <div className="mt-2 flex gap-4">
          <div>
            <p className="text-slate-400">Historical</p>
            <p>{historicalArea} ha</p>
          </div>
          <div>
            <p className="text-slate-400">Current</p>
            <p>{currentArea} ha</p>
          </div>
        </div>
      </div>
    </div>
  );
}
