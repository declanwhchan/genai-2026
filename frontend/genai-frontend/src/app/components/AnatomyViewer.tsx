import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import Model from "./Model.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ORGAN_POSITIONS_3D } from "../../types.ts";
import type { DiseaseStage } from "../../types.ts";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AnatomyViewerProps {
  affectedOrgans: string[];
  allUsedOrgans: string[];
  currentStageIndex: number;
  totalStages: number;
  onOrganClick?: (organ: string) => void;
  diseaseName: string;
  currentStage: DiseaseStage;
}

type TooltipPlacement = "top" | "right" | "bottom" | "left";

function getTooltipPlacement(projectedX: number, projectedY: number): TooltipPlacement {
  if (Math.abs(projectedX) >= Math.abs(projectedY)) {
    return projectedX >= 0 ? "left" : "right";
  }

  return projectedY >= 0 ? "bottom" : "top";
}

function getTooltipShellClasses(placement: TooltipPlacement) {
  const base =
    "relative w-[24rem] max-w-[min(24rem,calc(100vw-3rem))] rounded-2xl border bg-white/98 p-4 text-sm shadow-[0_24px_60px_rgba(15,23,42,0.24)] backdrop-blur-md";

  switch (placement) {
    case "left":
      return `${base} -translate-x-[calc(100%+26px)] -translate-y-1/2`;
    case "right":
      return `${base} translate-x-[26px] -translate-y-1/2`;
    case "top":
      return `${base} -translate-x-1/2 -translate-y-[calc(100%+26px)]`;
    case "bottom":
      return `${base} -translate-x-1/2 translate-y-[26px]`;
  }
}

function getTooltipArrowClasses(placement: TooltipPlacement) {
  const base = "absolute h-4 w-4 rotate-45 border-b border-r bg-white/98";

  switch (placement) {
    case "left":
      return `${base} left-full top-1/2 -translate-x-1/2 -translate-y-1/2`;
    case "right":
      return `${base} right-full top-1/2 translate-x-1/2 -translate-y-1/2`;
    case "top":
      return `${base} left-1/2 top-full -translate-x-1/2 -translate-y-1/2`;
    case "bottom":
      return `${base} left-1/2 bottom-full -translate-x-1/2 translate-y-1/2`;
  }
}

function OrganNode({
  organ,
  position,
  isAffected,
  color,
  onOrganClick,
  diseaseName,
  currentStage,
}: {
  organ: string;
  position: THREE.Vector3;
  isAffected: boolean;
  color: string;
  onOrganClick?: (organ: string) => void;
  diseaseName: string;
  currentStage: DiseaseStage;
}) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const projectedRef = useRef(new THREE.Vector3());
  const tooltipPlacementRef = useRef<TooltipPlacement>("top");
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPlacement, setTooltipPlacement] = useState<TooltipPlacement>("top");
  const visualRadius = isAffected ? 5.5 : 3;
  const hoverRadius = visualRadius;

  useFrame(({ clock }) => {
    if (isAffected) {
      const t = clock.getElapsedTime();
      const pulse = Math.sin(t * 2.5 + organ.length) * 0.5 + 0.5;

      if (meshRef.current) {
        const scale = 1 + pulse * 0.18;
        meshRef.current.scale.set(scale, scale, scale);
      }

      if (materialRef.current) {
        materialRef.current.emissiveIntensity = 0.3 + pulse * 0.4;
      }
    }

    if (!isAffected || !isHovered) return;

    projectedRef.current.copy(position).project(camera);
    const nextPlacement = getTooltipPlacement(
      projectedRef.current.x,
      projectedRef.current.y
    );

    if (nextPlacement !== tooltipPlacementRef.current) {
      tooltipPlacementRef.current = nextPlacement;
      setTooltipPlacement(nextPlacement);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} raycast={() => null}>
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={isAffected ? 0.5 : 0.3}
          transparent
          opacity={isAffected ? 0.9 : 0.5}
        />
      </mesh>

      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          if (!isAffected) return;
          const projected = projectedRef.current.copy(position).project(camera);
          const nextPlacement = getTooltipPlacement(projected.x, projected.y);
          tooltipPlacementRef.current = nextPlacement;
          setTooltipPlacement(nextPlacement);
          setIsHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          if (!isAffected) return;
          setIsHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOrganClick?.(organ);
        }}
      >
        <sphereGeometry args={[hoverRadius, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isAffected && isHovered && (
        <Html position={[0, 0, 0]} transform={false} style={{ pointerEvents: "none" }}>
          <div
            className={getTooltipShellClasses(tooltipPlacement)}
            style={{ borderColor: `${color}40` }}
          >
            <div
              className={getTooltipArrowClasses(tooltipPlacement)}
              style={{ borderColor: `${color}40` }}
            />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Organ Focus
                </p>
                <h4 className="mt-1 text-lg font-semibold capitalize text-slate-900">
                  {organ}
                </h4>
              </div>
              <div className="mt-1 h-3 w-3 rounded-full" style={{ background: color }} />
            </div>

            <p className="mt-3 leading-6 text-slate-700">
              {diseaseName} is affecting the {organ} during {currentStage.timeline.toLowerCase()}.
            </p>

            <p className="mt-3 leading-6 text-slate-600">
              {currentStage.biologicalProcess}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {currentStage.symptoms.slice(0, 3).map((symptom) => (
                <span
                  key={symptom}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium"
                  style={{
                    borderColor: `${color}50`,
                    background: `${color}18`,
                    color,
                  }}
                >
                  {symptom}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>{currentStage.name}</span>
              <span>&middot;</span>
              <span>{currentStage.timeline}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function OrganNodes({
  affectedOrgans,
  allUsedOrgans,
  getOrganColor,
  onOrganClick,
  diseaseName,
  currentStage,
}: {
  affectedOrgans: string[];
  allUsedOrgans: string[];
  getOrganColor: (organ: string) => string;
  onOrganClick?: (organ: string) => void;
  diseaseName: string;
  currentStage: DiseaseStage;
}) {
  return (
    <group>
      {Object.entries(ORGAN_POSITIONS_3D)
        .filter(([organ]) => allUsedOrgans.includes(organ))
        .map(([organ, pos]) => {
          const isAffected = affectedOrgans.includes(organ);
          const color = getOrganColor(organ);
          const position = new THREE.Vector3(
            pos.x * 100,
            pos.y * 100,
            pos.z * 100
          );

          return (
            <OrganNode
              key={organ}
              organ={organ}
              position={position}
              isAffected={isAffected}
              color={color}
              onOrganClick={onOrganClick}
              diseaseName={diseaseName}
              currentStage={currentStage}
            />
          );
        })}
    </group>
  );
}

export default function AnatomyViewer({
  affectedOrgans,
  allUsedOrgans,
  currentStageIndex,
  totalStages,
  onOrganClick,
  diseaseName,
  currentStage,
}: AnatomyViewerProps) {
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationCenterRef = useRef(new THREE.Vector3(0, 0, 0));
  const defaultCameraOffset = useRef(new THREE.Vector3(0, 18, 300));
  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);

  const {
    minZoomDistance,
    maxZoomDistance,
    zoomStepFactor,
    syncZoomButtonState,
  } = useMemo(() => {
    const computedZoomStepFactor = 0.8;
    const zoomStepCount = 4;
    const defaultZoomDistance = defaultCameraOffset.current.length();
    const computedMinZoomDistance =
      defaultZoomDistance * Math.pow(computedZoomStepFactor, zoomStepCount);
    const computedMaxZoomDistance =
      defaultZoomDistance * Math.pow(1 / computedZoomStepFactor, zoomStepCount);

    const syncControlsZoomState = () => {
      if (!controlsRef.current) return;

      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const distance = camera.position.distanceTo(target);
      const minDistance = controlsRef.current.minDistance;
      const maxDistance = controlsRef.current.maxDistance;
      const epsilon = 0.5;

      setCanZoomIn(distance > minDistance + epsilon);
      setCanZoomOut(distance < maxDistance - epsilon);
    };

    return {
      minZoomDistance: computedMinZoomDistance,
      maxZoomDistance: computedMaxZoomDistance,
      zoomStepFactor: computedZoomStepFactor,
      syncZoomButtonState: syncControlsZoomState,
    };
  }, []);

  useEffect(() => {
    if (!controlsRef.current) return;

    controlsRef.current.target.copy(rotationCenterRef.current);
    controlsRef.current.object.position
      .copy(rotationCenterRef.current)
      .add(defaultCameraOffset.current);
    controlsRef.current.minDistance = minZoomDistance;
    controlsRef.current.maxDistance = maxZoomDistance;
    controlsRef.current.zoomSpeed = 4.35;
    controlsRef.current.update();
    syncZoomButtonState();

    const controls = controlsRef.current;
    controls.addEventListener("change", syncZoomButtonState);

    return () => {
      controls.removeEventListener("change", syncZoomButtonState);
    };
  }, [minZoomDistance, maxZoomDistance, syncZoomButtonState]);

  const getOrganColor = (organ: string) => {
    if (!affectedOrgans.includes(organ)) {
      return "#0891b2";
    }

    const intensity = ((currentStageIndex + 1) / totalStages) * 100;
    if (intensity < 33) return "#fbbf24";
    if (intensity < 66) return "#f97316";
    return "#ef4444";
  };

  const handleZoomIn = () => {
    if (!canZoomIn || !controlsRef.current) return;

    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const dir = camera.position.clone().sub(target);
    if (dir.length() > controlsRef.current.minDistance) {
      const nextDistance = Math.max(
        minZoomDistance,
        dir.length() * zoomStepFactor
      );
      dir.setLength(nextDistance);
      camera.position.copy(target).add(dir);
      controlsRef.current.update();
      syncZoomButtonState();
    }
  };

  const handleZoomOut = () => {
    if (!canZoomOut || !controlsRef.current) return;

    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const dir = camera.position.clone().sub(target);
    if (dir.length() < controlsRef.current.maxDistance) {
      const nextDistance = Math.min(
        maxZoomDistance,
        dir.length() * (1 / zoomStepFactor)
      );
      dir.setLength(nextDistance);
      camera.position.copy(target).add(dir);
      controlsRef.current.update();
      syncZoomButtonState();
    }
  };

  const handleRotate = (angleX: number, angleY: number) => {
    if (!controlsRef.current) return;

    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const offset = camera.position.clone().sub(target);

    if (angleX !== 0) {
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleX);
    }

    if (angleY !== 0) {
      const axes = new THREE.Matrix4().extractRotation(camera.matrixWorld);
      const right = new THREE.Vector3(1, 0, 0)
        .applyMatrix4(axes)
        .normalize();
      offset.applyAxisAngle(right, angleY);
    }

    camera.position.copy(target).add(offset);
    controlsRef.current.update();
  };

  const handleReset = () => {
    if (!controlsRef.current) return;

    const camera = controlsRef.current.object;
    const target = rotationCenterRef.current;
    controlsRef.current.target.copy(target);
    camera.position.copy(target).add(defaultCameraOffset.current);
    camera.up.set(0, 1, 0);
    controlsRef.current.update();
    syncZoomButtonState();
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.deltaY < 0) {
      handleZoomIn();
      return;
    }

    if (e.deltaY > 0) {
      handleZoomOut();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onWheel={handleWheelZoom}
    >
      <Canvas
        camera={{ position: [0, 18, 300], fov: 45 }}
        className="h-full w-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} />

        <group position={rotationCenterRef.current}>
          <Model />
          <OrganNodes
            affectedOrgans={affectedOrgans}
            allUsedOrgans={allUsedOrgans}
            getOrganColor={getOrganColor}
            onOrganClick={onOrganClick}
            diseaseName={diseaseName}
            currentStage={currentStage}
          />
        </group>

        <OrbitControls ref={controlsRef} enableZoom={false} />
      </Canvas>

      <div className="pointer-events-auto absolute right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3">
        <div className="mb-1 flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
            Early
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
            Progressive
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
            Severe
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <div />
          <button
            onClick={() => handleRotate(0, 0.2)}
            className="rounded-lg border border-slate-200/80 bg-white/90 p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Rotate Up"
          >
            <ChevronUp size={18} />
          </button>
          <div />
          <button
            onClick={() => handleRotate(0.2, 0)}
            className="rounded-lg border border-slate-200/80 bg-white/90 p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Rotate Left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => handleRotate(0, -0.2)}
            className="rounded-lg border border-slate-200/80 bg-white/90 p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Rotate Down"
          >
            <ChevronDown size={18} />
          </button>
          <button
            onClick={() => handleRotate(-0.2, 0)}
            className="rounded-lg border border-slate-200/80 bg-white/90 p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Rotate Right"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex w-full flex-col gap-1">
          <div className="grid w-full grid-cols-2 gap-1">
            <button
              onClick={handleZoomIn}
              disabled={!canZoomIn}
              className="flex w-full justify-center rounded-lg border border-slate-200/80 bg-white/90 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200/80 disabled:hover:bg-white/90 disabled:hover:text-slate-600"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={!canZoomOut}
              className="flex w-full justify-center rounded-lg border border-slate-200/80 bg-white/90 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200/80 disabled:hover:bg-white/90 disabled:hover:text-slate-600"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
          </div>
          <button
            onClick={handleReset}
            className="relative flex w-full justify-center rounded-lg border border-slate-200/80 bg-white/90 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
          <div className="group relative w-full">
            <button
              type="button"
              className="w-full rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Help?
            </button>
            <div className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 z-30 w-72 -translate-y-1/2 translate-x-2 rounded-2xl border border-slate-200/90 bg-white/95 p-4 text-left text-xs text-slate-600 opacity-0 shadow-[0_18px_48px_rgba(15,23,42,0.18)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
              <p className="text-sm font-semibold text-slate-900">
                How to use the viewer
              </p>
              <p className="mt-2">
                <span className="font-semibold text-slate-900">1.</span> Use
                the arrow buttons to rotate the body and the plus or minus
                buttons to zoom.
              </p>
              <p className="mt-2">
                <span className="font-semibold text-slate-900">2.</span> Click
                and drag on the body to move the view and inspect different
                areas.
              </p>
              <p className="mt-2">
                <span className="font-semibold text-slate-900">3.</span> Hover
                over the highlighted circles to open organ information for that
                stage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

