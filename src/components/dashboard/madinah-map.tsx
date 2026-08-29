"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Establishment } from "@/types/entities";

interface MadinahMapProps {
  establishments: Establishment[];
}

// Coordinates for key Madinah municipal sectors
function getMadinahCoordinates(id: string, index: number): [number, number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const rand1 = Math.abs(Math.sin(hash + 1));
  const rand2 = Math.abs(Math.cos(hash + 2));

  const baseCenters: [number, number][] = [
    [24.4672, 39.6111], // المنطقة المركزية - الحرم النبوي
    [24.4530, 39.5980], // طريق الأمير عبدالمجيد - الخالدية
    [24.4482, 39.6354], // العوالي
    [24.4320, 39.6200], // باقدو - طريق الملك عبدالله
    [24.4385, 39.6172], // قباء
    [24.4250, 39.5900], // الهجرة
    [24.4780, 39.5850], // طريق سلطانة
    [24.5020, 39.5700], // المنطقة الصناعية
  ];

  const center = baseCenters[index % baseCenters.length];
  const lat = center[0] + (rand1 - 0.5) * 0.012;
  const lng = center[1] + (rand2 - 0.5) * 0.012;

  return [lat, lng];
}

export function MadinahMap({ establishments }: MadinahMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const patrolMarkerRef = useRef<any>(null);
  const animationIntervalRef = useRef<any>(null);

  const [isTracking, setIsTracking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  const sorted = [...establishments].sort(
    (a, b) => (b.currentRiskScore ?? 0) - (a.currentRiskScore ?? 0)
  );

  const topTargets = sorted.slice(0, 4);

  useEffect(() => {
    let isCancelled = false;

    const initMapWhenReady = () => {
      const L = (window as any).L;
      if (!L) {
        setTimeout(initMapWhenReady, 100);
        return;
      }

      if (isCancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }

      // Initialize map centered on Madinah
      const map = L.map(mapContainerRef.current, {
        center: [24.4672, 39.6111],
        zoom: 12.5,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Deep Dark Map Tile Layer (OpenStreetMap with high-contrast black night styling)
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 18,
          subdomains: ["a", "b", "c"],
          className: "deep-dark-tiles",
        }
      ).addTo(map);

      const markers: any[] = [];
      const routePoints: [number, number][] = [];

      sorted.forEach((est, idx) => {
        const coords = getMadinahCoordinates(est.id, idx);
        const score = est.currentRiskScore ?? 0;

        let pinColor = "#10B981"; // Low (emerald)
        if (score >= 80) pinColor = "#EF4444"; // Critical (red)
        else if (score >= 70) pinColor = "#F97316"; // High (orange)
        else if (score >= 50) pinColor = "#EAB308"; // Medium (yellow)

        const isCritical = score >= 80;
        const size = idx === 0 ? 28 : 22;

        const pulseEffect = isCritical
          ? `<span style="position: absolute; inset: -5px; border-radius: 50%; background-color: ${pinColor}; opacity: 0.6; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
          : "";

        const customHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${pulseEffect}
            <div style="
              background: ${pinColor};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(0,0,0,0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-family: monospace;
              font-size: 10px;
              font-weight: 800;
              position: relative;
              z-index: 2;
            ">
              ${idx + 1}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: "dark-map-marker",
          iconSize: [size + 10, size + 10],
          iconAnchor: [(size + 10) / 2, (size + 10) / 2],
        });

        const marker = L.marker(coords, { icon }).addTo(map);

        marker.bindPopup(
          `
          <div style="direction: rtl; text-align: right; font-family: 'IBM Plex Sans Arabic', sans-serif; min-width: 180px; padding: 3px;">
            <div style="font-size: 10px; color: #B89B72; font-weight: bold; font-family: monospace;">الترتيب #${idx + 1} · ${est.district}</div>
            <strong style="font-size: 12.5px; color: #FFFFFF; display: block; margin: 2px 0 1px;">${est.name}</strong>
            <div style="font-size: 11px; color: #CCCCCC;">${est.address}</div>
            <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid rgba(255, 255, 255, 0.15); font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: ${pinColor}; font-weight: bold;">مؤشر الخطر: ${score}%</span>
              <span style="background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; font-size: 10px; color: #EEE;">${score >= 80 ? "حرجة" : score >= 70 ? "عالية" : "متوسطة"}</span>
            </div>
          </div>
          `,
          { className: "black-map-popup" }
        );

        markers.push(marker);

        if (idx < 4) {
          routePoints.push(coords);
        }
      });

      // Neon green patrol route line
      if (routePoints.length > 1) {
        L.polyline(routePoints, {
          color: "#10B981",
          weight: 3,
          opacity: 0.9,
          dashArray: "6, 8",
          lineCap: "round",
        }).addTo(map);
      }

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.12));
      }

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 200);
    };

    initMapWhenReady();

    return () => {
      isCancelled = true;
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [establishments]);

  // Toggle Live Tracking Patrol
  const togglePatrolTracking = () => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map || topTargets.length === 0) return;

    if (isTracking) {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      if (patrolMarkerRef.current) {
        map.removeLayer(patrolMarkerRef.current);
        patrolMarkerRef.current = null;
      }
      setIsTracking(false);
      setCurrentStepIndex(null);
      return;
    }

    setIsTracking(true);
    let step = 0;
    setCurrentStepIndex(0);

    const patrolIcon = L.divIcon({
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #10B981; opacity: 0.8; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="width: 30px; height: 30px; border-radius: 50%; background: #081310; border: 2.5px solid #10B981; box-shadow: 0 4px 16px rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; color: #10B981;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
        </div>
      `,
      className: "patrol-vehicle-icon",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const startCoords = getMadinahCoordinates(topTargets[0].id, 0);
    if (patrolMarkerRef.current) map.removeLayer(patrolMarkerRef.current);

    patrolMarkerRef.current = L.marker(startCoords, { icon: patrolIcon, zIndexOffset: 1000 }).addTo(map);
    map.panTo(startCoords, { animate: true, duration: 1 });

    animationIntervalRef.current = setInterval(() => {
      step = (step + 1) % topTargets.length;
      setCurrentStepIndex(step);

      const targetEst = topTargets[step];
      const targetCoords = getMadinahCoordinates(targetEst.id, step);

      if (patrolMarkerRef.current) {
        patrolMarkerRef.current.setLatLng(targetCoords);
        map.panTo(targetCoords, { animate: true, duration: 1 });
      }
    }, 2800);
  };

  return (
    <section
      id="madinah-map"
      className="mb-7 bg-gov-charcoal text-white rounded-md border border-gov-slate p-3.5 md:p-4 shadow-lg relative overflow-hidden"
      aria-label="خريطة المدينة المنورة الرقابية"
    >
      {/* Sleek Compact Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gov-slate/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5">
            <span>الخريطة الرقابية التفاعلية — منطقة المدينة المنورة</span>
            <span className="text-[9px] font-mono text-emerald-400 font-normal">
              GIS TACTICAL
            </span>
          </h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isTracking && currentStepIndex !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 border border-emerald-500/50 rounded text-[11px] text-emerald-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>موقع: {topTargets[currentStepIndex]?.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={togglePatrolTracking}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition shadow-sm ${
              isTracking
                ? "bg-risk-critical hover:bg-rose-800 text-white"
                : "bg-gov-emerald hover:bg-gov-accent text-white"
            }`}
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              {isTracking ? (
                <>
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </>
              ) : (
                <polygon points="5 3 19 12 5 21 5 3"/>
              )}
            </svg>
            <span>{isTracking ? "إيقاف" : "محاكاة المسار"}</span>
          </button>
        </div>
      </div>

      {/* Compact Map Container (310px height) */}
      <div className="relative w-full rounded border border-gov-slate/80 overflow-hidden bg-[#06100E] shadow-inner" style={{ minHeight: "310px" }}>
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "310px",
            minHeight: "310px",
            position: "relative",
            zIndex: 1,
            backgroundColor: "#06100E",
          }}
        />

        {/* Small Bottom Legend Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-[1000] pointer-events-none bg-gov-charcoal/90 border border-gov-slate px-2.5 py-1 rounded text-[10px] font-mono text-gray-300 flex items-center gap-2 shadow-md">
          <span>المنشآت: <strong className="text-emerald-400">{establishments.length}</strong></span>
          <span className="text-gov-slate">·</span>
          <span>المسار: <strong className="text-white">6.8 كم</strong></span>
        </div>
      </div>

      {/* Deep Dark Vector Map CSS Styling */}
      <style jsx global>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        /* Pure Dark Black Map Tiles */
        .deep-dark-tiles {
          filter: brightness(0.55) invert(1) contrast(2.6) hue-rotate(195deg) saturate(0.25) brightness(0.72) !important;
        }
        .leaflet-container {
          background-color: #06100E !important;
        }
        .black-map-popup .leaflet-popup-content-wrapper {
          background: #0f2621 !important;
          color: #ffffff !important;
          border: 1px solid #237d6c !important;
          border-radius: 6px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8) !important;
        }
        .black-map-popup .leaflet-popup-tip {
          background: #0f2621 !important;
        }
        .black-map-popup .leaflet-popup-close-button {
          color: #88948f !important;
        }
      `}</style>
    </section>
  );
}
