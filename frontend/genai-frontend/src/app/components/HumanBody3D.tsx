import { useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { ORGAN_POSITIONS_3D } from "../../types";
import type { DiseaseStage } from "../../types";

interface HumanBody3DProps {
  affectedOrgans: string[];
  currentStageIndex: number;
  totalStages: number;
  onOrganClick?: (organ: string) => void;
  diseaseName: string;
  currentStage: DiseaseStage;
}

const SEVERITY_COLORS = [
  { main: "#fbbf24", glow: "#fbbf2480", label: "Early" },
  { main: "#f97316", glow: "#f9731680", label: "Progressive" },
  { main: "#ef4444", glow: "#ef444480", label: "Severe" },
];

export function HumanBody3D({
  affectedOrgans,
  currentStageIndex,
  totalStages,
  diseaseName,
  currentStage,
}: HumanBody3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0.15, y: 0.2 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<{ name: string; x: number; y: number } | null>(null);
  const hoveredOrganRef = useRef<{ name: string; x: number; y: number } | null>(null);
  const mousePosRef = useRef({ x: -1, y: -1 });
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const animationFrameRef = useRef<number>();
  const animationTimeRef = useRef(0);
  const rotationRef = useRef(rotation);
  const scaleRef = useRef(scale);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const getSeverityColor = () => {
    const intensity = (currentStageIndex + 1) / totalStages;
    if (intensity < 0.4) return SEVERITY_COLORS[0];
    if (intensity < 0.75) return SEVERITY_COLORS[1];
    return SEVERITY_COLORS[2];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    updateSize();

    const resizeObs = new ResizeObserver(updateSize);
    resizeObs.observe(container);

    const severityColor = getSeverityColor();

    const project3D = (x: number, y: number, z: number) => {
      const rot = rotationRef.current;
      const sc = scaleRef.current;
      const w = canvas.width;
      const h = canvas.height;

      const cosX = Math.cos(rot.x);
      const sinX = Math.sin(rot.x);
      const cosY = Math.cos(rot.y);
      const sinY = Math.sin(rot.y);

      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500;
      const scaleFactor = perspective / (perspective + z2 + 2);
      const bodyScale = Math.min(w * 0.4, h * 0.235) * sc;

      const x2D = w / 2 + x1 * bodyScale * scaleFactor;
      const y2D = h / 2 - y1 * bodyScale * scaleFactor;

      return { x: x2D, y: y2D, scale: scaleFactor, z: z2 };
    };

    const drawBodyPart = (
      x: number,
      y: number,
      z: number,
      radius: number,
      color: string,
      alpha = 1,
      highlight = false,
    ) => {
      const p = project3D(x, y, z);
      const r = radius * Math.min(canvas.width, canvas.height) * 0.235 * scaleRef.current * p.scale;

      if (highlight) {
        const grad = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, 0, p.x, p.y, r * 1.2);
        grad.addColorStop(0, color + "ff");
        grad.addColorStop(0.6, color + "cc");
        grad.addColorStop(1, color + "44");
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grad;
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(r, 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return { ...p, r };
    };

    const drawCapsule = (
      x: number,
      y: number,
      z: number,
      radius: number,
      height: number,
      color: string,
      alpha = 1,
    ) => {
      const top = project3D(x, y + height / 2, z);
      const bot = project3D(x, y - height / 2, z);
      const sc = Math.min(canvas.width * 0.4, canvas.height * 0.235) * scaleRef.current;
      const r = radius * sc * ((top.scale + bot.scale) / 2);

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(r * 2, 1);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(bot.x, bot.y);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(top.x, top.y, Math.max(r, 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bot.x, bot.y, Math.max(r, 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawTorsoShape = (color: string, alpha = 1) => {
      const topCenter = project3D(0, 1.05, 0);
      const botCenter = project3D(0, 0.0, 0);
      const sc = Math.min(canvas.width * 0.4, canvas.height * 0.235) * scaleRef.current;

      const topW = 0.28 * sc * topCenter.scale;
      const botW = 0.22 * sc * botCenter.scale;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(topCenter.x - topW, topCenter.y);
      ctx.quadraticCurveTo(topCenter.x - topW * 1.1, (topCenter.y + botCenter.y) / 2, botCenter.x - botW, botCenter.y);
      ctx.lineTo(botCenter.x + botW, botCenter.y);
      ctx.quadraticCurveTo(topCenter.x + topW * 1.1, (topCenter.y + botCenter.y) / 2, topCenter.x + topW, topCenter.y);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawGrid = () => {
      const w = canvas.width;
      const h = canvas.height;
      const gridSize = 40;

      ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
      ctx.lineWidth = 1;

      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      animationTimeRef.current += 0.025;
      const t = animationTimeRef.current;

      const w = canvas.width;
      const h = canvas.height;

      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      bgGrad.addColorStop(0, "#111827");
      bgGrad.addColorStop(1, "#080c14");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      drawGrid();

      const bodyGlow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.25);
      bodyGlow.addColorStop(0, "rgba(6, 182, 212, 0.04)");
      bodyGlow.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = bodyGlow;
      ctx.fillRect(0, 0, w, h);

      const skinDark = "#c8956a";
      const skinMid = "#d4a374";
      const skinBase = "#e0b898";

      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      const shadowX = project3D(0, -1.4, 0);
      ctx.ellipse(shadowX.x + 10, shadowX.y + 8, 50 * scaleRef.current, 20 * scaleRef.current, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      drawCapsule(-0.11, -0.85, 0, 0.075, 1.1, skinDark);
      drawCapsule(0.11, -0.85, 0, 0.075, 1.1, skinDark);
      drawBodyPart(-0.11, -1.44, 0.06, 0.065, skinDark);
      drawBodyPart(0.11, -1.44, 0.06, 0.065, skinDark);
      drawBodyPart(0, -0.05, 0, 0.17, skinDark);
      drawTorsoShape(skinMid);
      drawBodyPart(-0.28, 0.98, 0, 0.09, skinMid);
      drawBodyPart(0.28, 0.98, 0, 0.09, skinMid);
      drawCapsule(-0.38, 0.55, 0, 0.055, 0.75, skinBase);
      drawCapsule(0.38, 0.55, 0, 0.055, 0.75, skinBase);
      drawBodyPart(-0.38, 0.1, 0, 0.06, skinDark);
      drawBodyPart(0.38, 0.1, 0, 0.06, skinDark);
      drawCapsule(0, 1.18, 0, 0.055, 0.15, skinBase);
      drawBodyPart(0, 1.38, 0, 0.145, skinBase, 1, true);

      const faceP = project3D(0, 1.38, 0.14);
      const faceScale = faceP.scale * Math.min(w * 0.4, h * 0.235) * scaleRef.current;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#8b5e3c";
      ctx.beginPath();
      ctx.ellipse(faceP.x - faceScale * 0.045, faceP.y - faceScale * 0.01, faceScale * 0.018, faceScale * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(faceP.x + faceScale * 0.045, faceP.y - faceScale * 0.01, faceScale * 0.018, faceScale * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      const organEntries = Object.entries(ORGAN_POSITIONS_3D).sort((a, b) => {
        const pA = project3D(a[1].x, a[1].y, a[1].z);
        const pB = project3D(b[1].x, b[1].y, b[1].z);
        return pA.z - pB.z;
      });

      let foundHover: { name: string; x: number; y: number } | null = null;

      organEntries.forEach(([organ, pos]) => {
        const isAffected = affectedOrgans.includes(organ);
        const isHovered = hoveredOrganRef.current?.name === organ;
        const pulse = Math.sin(t * 2.5 + organ.length) * 0.5 + 0.5;
        const p = project3D(pos.x, pos.y, pos.z);

        const radius = isAffected ? 0.065 + pulse * 0.015 : 0.035;
        const r = radius * Math.min(w * 0.4, h * 0.235) * scaleRef.current * p.scale;
        const dx = mousePosRef.current.x - p.x;
        const dy = mousePosRef.current.y - p.y;

        if (dx * dx + dy * dy < r * r) {
          foundHover = { name: organ, x: p.x, y: p.y };
        }

        if (isAffected) {
          const glowSize = isHovered ? 0.14 + pulse * 0.04 : 0.11 + pulse * 0.035;
          const glowP = project3D(pos.x, pos.y, pos.z);
          const sc = Math.min(w * 0.4, h * 0.235) * scaleRef.current;
          const gr = glowSize * sc * glowP.scale;

          const glowGrad = ctx.createRadialGradient(glowP.x, glowP.y, 0, glowP.x, glowP.y, gr * 2);
          glowGrad.addColorStop(0, severityColor.glow.replace("80", isHovered ? "75" : "60"));
          glowGrad.addColorStop(0.5, severityColor.glow.replace("80", isHovered ? "40" : "30"));
          glowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(glowP.x, glowP.y, gr * 2, 0, Math.PI * 2);
          ctx.fill();

          const markerSize = isHovered ? 0.082 + pulse * 0.018 : 0.065 + pulse * 0.015;
          drawBodyPart(pos.x, pos.y, pos.z, markerSize, severityColor.main, 0.9 + pulse * 0.1);
          drawBodyPart(pos.x, pos.y, pos.z, markerSize * 0.45, "#ffffff", 0.85);

          const ringRadius = (markerSize + 0.02 + pulse * 0.02) * sc * glowP.scale;
          ctx.strokeStyle = `${severityColor.main}${isHovered ? "cc" : "66"}`;
          ctx.lineWidth = isHovered ? 2 : 1.25;
          ctx.globalAlpha = isHovered ? 0.85 : 0.45;
          ctx.beginPath();
          ctx.arc(glowP.x, glowP.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;

          const lp = project3D(pos.x, pos.y, pos.z);
          ctx.globalAlpha = isHovered ? 1 : 0.88;
          ctx.fillStyle = severityColor.main;
          ctx.font = `${Math.max(10, isHovered ? 13 : 11)}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(organ.charAt(0).toUpperCase() + organ.slice(1), lp.x, lp.y - (isHovered ? 24 : 18));
          ctx.globalAlpha = 1;

          const mr = 0.065 * sc * lp.scale;
          ctx.globalAlpha = isHovered ? 0.7 : 0.4;
          ctx.strokeStyle = severityColor.main;
          ctx.lineWidth = isHovered ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(lp.x, lp.y - mr);
          ctx.lineTo(lp.x, lp.y - (isHovered ? 20 : 14));
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else {
          drawBodyPart(pos.x, pos.y, pos.z, isHovered ? 0.045 : 0.035, isHovered ? "#64748b" : "#334155", isHovered ? 0.95 : 0.7);
        }
      });

      const previousHover = hoveredOrganRef.current;
      const hoverChanged =
        previousHover?.name !== foundHover?.name ||
        previousHover?.x !== foundHover?.x ||
        previousHover?.y !== foundHover?.y;

      if (hoverChanged) {
        hoveredOrganRef.current = foundHover;
        setHoveredOrgan(foundHover);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObs.disconnect();
    };
  }, [affectedOrgans, currentStageIndex, totalStages, diseaseName]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setRotation((prev) => ({
        x: Math.max(-1.2, Math.min(1.2, prev.x + dy * 0.006)),
        y: prev.y - dx * 0.006,
      }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => Math.max(0.5, Math.min(2.5, prev - e.deltaY * 0.001)));
  };

  const resetView = () => {
    setRotation({ x: 0.15, y: 0.2 });
    setScale(1);
  };

  const severityColor = getSeverityColor();
  const hoveredOrganAffected = hoveredOrgan ? affectedOrgans.includes(hoveredOrgan.name) : false;
  const hoverSymptoms = hoveredOrganAffected
    ? currentStage.symptoms.slice(0, 3)
    : ["No direct involvement in the current stage."];

  return (
    <div className="relative grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#080c14]">
      <div className="z-10 flex items-center justify-between gap-4 px-6 pt-5 pb-3">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-white/80">3D Disease Progression</h2>
          <p className="mt-0.5 text-xs text-slate-600">Interactive anatomical visualization</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: severityColor.main }} />
            <span className="text-xs" style={{ color: severityColor.main }}>
              Stage {currentStageIndex + 1}/{totalStages} · {severityColor.label}
            </span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 w-full"
        style={{ cursor: isDragging ? "grabbing" : hoveredOrgan ? "pointer" : "grab" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseLeave={() => {
          mousePosRef.current = { x: -1, y: -1 };
          hoveredOrganRef.current = null;
          setHoveredOrgan(null);
        }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {hoveredOrgan && containerRef.current && (
          <div
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-[calc(100%+15px)] rounded-lg border border-white/10 bg-slate-900/85 px-3 py-2 text-xs text-slate-200 shadow-2xl backdrop-blur-sm"
            style={{
              left: hoveredOrgan.x,
              top: hoveredOrgan.y,
            }}
          >
            <p className="font-bold text-white capitalize">{hoveredOrgan.name}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: hoveredOrganAffected ? severityColor.main : "#94a3b8" }}>
              {hoveredOrganAffected ? `${diseaseName} • ${currentStage.name}` : "Monitoring"}
            </p>
          </div>
        )}
      </div>

      <div
        className={`pointer-events-none absolute bottom-5 left-5 z-40 w-[min(320px,calc(100%-2.5rem))] origin-bottom-left rounded-2xl border bg-slate-950/70 p-4 text-sm shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-md transition-all duration-300 ${
          hoveredOrgan ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        style={{
          borderColor: hoveredOrganAffected ? `${severityColor.main}35` : "rgba(255,255,255,0.08)",
          boxShadow: hoveredOrganAffected
            ? `0 24px 60px rgba(2,6,23,0.45), 0 0 0 1px ${severityColor.main}14`
            : "0 24px 60px rgba(2,6,23,0.45)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Hover Insight</p>
            <h3 className="mt-1 text-base font-semibold text-white capitalize">
              {hoveredOrgan?.name ?? "Explore an organ"}
            </h3>
          </div>
          <div
            className={`mt-1 h-2.5 w-2.5 rounded-full transition-all duration-300 ${hoveredOrgan ? "scale-100 animate-pulse" : "scale-75"}`}
            style={{ background: hoveredOrganAffected ? severityColor.main : "#64748b" }}
          />
        </div>

        <p className="mt-3 text-slate-300">
          {hoveredOrgan
            ? hoveredOrganAffected
              ? `${diseaseName} is interacting with the ${hoveredOrgan.name} during ${currentStage.timeline.toLowerCase()}.`
              : `This organ stays outside the primary disease pattern during ${currentStage.name.toLowerCase()}.`
            : "Hover over a marker to see stage-specific organ context, symptoms, and disease activity."}
        </p>

        <p className="mt-3 text-slate-400">
          {hoveredOrgan
            ? hoveredOrganAffected
              ? currentStage.biologicalProcess
              : `${hoveredOrgan.name.charAt(0).toUpperCase() + hoveredOrgan.name.slice(1)} is not a highlighted target in this stage.`
            : currentStage.biologicalProcess}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {hoverSymptoms.map((symptom) => (
            <span
              key={symptom}
              className="rounded-full border px-2 py-0.5 text-[10px]"
              style={{
                borderColor: hoveredOrganAffected ? `${severityColor.main}50` : "rgba(148,163,184,0.25)",
                background: hoveredOrganAffected ? `${severityColor.main}18` : "rgba(148,163,184,0.08)",
                color: hoveredOrganAffected ? severityColor.main : "#cbd5e1",
              }}
            >
              {symptom}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded-full border border-white/10 px-2 py-1">{currentStage.name}</span>
          <span className="rounded-full border border-white/10 px-2 py-1">{currentStage.timeline}</span>
        </div>
      </div>

      <div className="px-6 pb-5 pt-3 pointer-events-none">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            {SEVERITY_COLORS.map((sv) => (
              <div key={sv.label} className="pointer-events-auto relative group">
                <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: sv.main, boxShadow: `0 0 6px ${sv.main}80` }} />
                  <span className="text-xs text-slate-400">{sv.label}</span>
                </div>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/92 p-3 text-left opacity-0 shadow-[0_24px_60px_rgba(2,6,23,0.5)] backdrop-blur-md transition-all duration-200 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-xs font-semibold" style={{ color: sv.main }}>{sv.label} · {sv.range}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{sv.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700">
            <div className="pointer-events-auto relative ml-2 group">
              <button className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-400/15">
                Help ?
              </button>
              <div className="pointer-events-none absolute bottom-full right-0 mb-3 w-72 rounded-2xl border border-white/10 bg-slate-950/92 p-4 text-left opacity-0 shadow-[0_24px_60px_rgba(2,6,23,0.5)] backdrop-blur-md transition-all duration-200 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Quick Help</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p><span className="text-cyan-300">1.</span> Hover on a circle to pop up disease info for that organ.</p>
                  <p><span className="text-cyan-300">2.</span> Drag across the body to rotate it and inspect different angles.</p>
                  <p><span className="text-cyan-300">3.</span> Scroll or use the side controls to zoom in, zoom out, and reset.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {affectedOrgans.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {affectedOrgans.map((organ) => (
              <span
                key={organ}
                className="rounded-full border px-2.5 py-1 text-xs capitalize"
                style={{
                  background: `${severityColor.main}15`,
                  color: severityColor.main,
                  borderColor: `${severityColor.main}30`,
                }}
              >
                {organ}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-auto absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        <button
          onClick={() => setScale((p) => Math.min(2.5, p + 0.15))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-400 transition-all hover:bg-white/[0.1] hover:text-white"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setScale((p) => Math.max(0.5, p - 0.15))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-400 transition-all hover:bg-white/[0.1] hover:text-white"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={resetView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-400 transition-all hover:bg-white/[0.1] hover:text-white"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}




