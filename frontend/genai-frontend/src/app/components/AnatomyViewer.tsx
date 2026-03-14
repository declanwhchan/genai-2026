import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import Model from "./Model.tsx";
import { useRef, useState } from "react";
import * as THREE from "three";
import { ORGAN_POSITIONS_3D } from "../../types.ts";
import { ZoomIn, ZoomOut, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface AnatomyViewerProps {
  affectedOrgans: string[];
  currentStageIndex: number;
  totalStages: number;
  onOrganClick?: (organ: string) => void;
  diseaseName: string;
}

// Separate component for rendering nodes inside the Canvas
function OrganNode({
  organ,
  position,
  isAffected,
  color,
  diseaseName,
  onOrganClick
}: {
  organ: string;
  position: THREE.Vector3;
  isAffected: boolean;
  color: string;
  diseaseName: string;
  onOrganClick?: (organ: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!isAffected) return;
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * 2.5 + organ.length) * 0.5 + 0.5;
    
    if (meshRef.current) {
      const scale = 1 + pulse * 0.3;
      meshRef.current.scale.set(scale, scale, scale);
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.3 + pulse * 0.4;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onOrganClick?.(organ);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <sphereGeometry args={[isAffected ? 8 : 4, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={isAffected ? 0.5 : 0.3}
        transparent
        opacity={isAffected ? 0.9 : 0.5}
      />
      
      {hovered && (
        <Html distanceFactor={150} zIndexRange={[100, 0]}>
          <div className="pointer-events-none px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-slate-200 whitespace-nowrap shadow-2xl transform -translate-x-1/2 -translate-y-[calc(100%+15px)]">
            {`${organ.charAt(0).toUpperCase() + organ.slice(1)}: ${isAffected ? `Affected by ${diseaseName}` : "Not affected"}`}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// Separate component for rendering nodes inside the Canvas
function OrganNodes({
  affectedOrgans,
  getOrganColor,
  diseaseName,
  onOrganClick
}: {
  affectedOrgans: string[];
  getOrganColor: (organ: string) => string;
  diseaseName: string;
  onOrganClick?: (organ: string) => void;
}) {
  return (
    <group>
      {Object.entries(ORGAN_POSITIONS_3D).map(([organ, pos]) => {
        const isAffected = affectedOrgans.includes(organ);
        const color = getOrganColor(organ);
        const position = new THREE.Vector3(pos.x * 100, pos.y * 100, pos.z * 100);

        return (
          <OrganNode
            key={organ}
            organ={organ}
            position={position}
            isAffected={isAffected}
            color={color}
            diseaseName={diseaseName}
            onOrganClick={onOrganClick}
          />
        );
      })}
    </group>
  );
}

export default function AnatomyViewer({
    affectedOrgans,
    currentStageIndex,
    totalStages,
    onOrganClick,
    diseaseName,
}: AnatomyViewerProps) {
    const controlsRef = useRef<any>(null);

    const getOrganColor = (organ: string) => {
        if (!affectedOrgans.includes(organ)) {
            return "#0ea5e9";
        }

        const intensity = ((currentStageIndex + 1) / totalStages) * 100;
        if (intensity < 33) return "#fbbf24";
        if (intensity < 66) return "#f97316";
        return "#ef4444";
    };

    const handleZoomIn = () => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const target = controlsRef.current.target;
            const dir = camera.position.clone().sub(target);
            if (dir.length() > controlsRef.current.minDistance) {
                dir.multiplyScalar(0.8);
                camera.position.copy(target).add(dir);
                controlsRef.current.update();
            }
        }
    };

    const handleZoomOut = () => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const target = controlsRef.current.target;
            const dir = camera.position.clone().sub(target);
            if (dir.length() < controlsRef.current.maxDistance) {
                dir.multiplyScalar(1.2);
                camera.position.copy(target).add(dir);
                controlsRef.current.update();
            }
        }
    };

    const handleRotate = (angleX: number, angleY: number) => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const target = controlsRef.current.target;
            const offset = camera.position.clone().sub(target);
            
            if (angleX !== 0) {
                offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleX);
            }
            if (angleY !== 0) {
                const axes = new THREE.Matrix4().extractRotation(camera.matrixWorld);
                const right = new THREE.Vector3(1, 0, 0).applyMatrix4(axes).normalize();
                offset.applyAxisAngle(right, angleY);
            }
            camera.position.copy(target).add(offset);
            controlsRef.current.update();
        }
    };

    const handleReset = () => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const target = controlsRef.current.target;
            camera.position.set(target.x, target.y, target.z + 600);
            camera.up.set(0, 1, 0);
            controlsRef.current.update();
        }
    };

    return (
        <div className="h-full w-full relative flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#0f172a_0%,#080c14_45%,#060a12_100%)] overflow-hidden">
            <div className="mb-5 text-center absolute top-6 left-0 right-0 z-10 pointer-events-none">
              <h2 className="text-xl text-slate-100">Human Body Disease Progression</h2>
              <p className="text-sm text-slate-400 mt-1">
                Stage {currentStageIndex + 1} of {totalStages}
              </p>
            </div>

            <Canvas camera={{ position: [0, 0, 600], fov: 45 }} className="w-full h-full">
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} />
            
                <Model onCenter={(center) => {
                    if (controlsRef.current) {
                        controlsRef.current.target.copy(center);
                        controlsRef.current.update();
                        controlsRef.current.minDistance = 150;
                        controlsRef.current.maxDistance = 500;
                    }
                }}
                />

                <OrganNodes 
                    affectedOrgans={affectedOrgans}
                    getOrganColor={getOrganColor}
                    diseaseName={diseaseName}
                    onOrganClick={onOrganClick}
                />

                <OrbitControls ref={controlsRef} />
            </Canvas>

            <div className="mt-5 flex items-center justify-center gap-5 text-xs text-slate-300 absolute bottom-6 left-0 right-0 z-10 pointer-events-none">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />Early</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />Progressive</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />Severe</span>
            </div>

            {/* Interactive Controls Overlay */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 p-2 bg-slate-900/40 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
                <div className="grid grid-cols-3 gap-1">
                    <div />
                    <button onClick={() => handleRotate(0, -0.2)} className="p-1.5 bg-white/5 hover:bg-white/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors shadow-sm" title="Rotate Up"><ChevronUp size={18} /></button>
                    <div />
                    <button onClick={() => handleRotate(-0.2, 0)} className="p-1.5 bg-white/5 hover:bg-white/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors shadow-sm" title="Rotate Left"><ChevronLeft size={18} /></button>
                    <button onClick={() => handleRotate(0, 0.2)} className="p-1.5 bg-white/5 hover:bg-white/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors shadow-sm" title="Rotate Down"><ChevronDown size={18} /></button>
                    <button onClick={() => handleRotate(0.2, 0)} className="p-1.5 bg-white/5 hover:bg-white/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors shadow-sm" title="Rotate Right"><ChevronRight size={18} /></button>
                </div>
                
                <div className="h-px bg-white/10 w-full" />
                
                <div className="flex flex-col gap-1 w-full">
                    <button onClick={handleZoomIn} className="p-2 bg-white/5 hover:bg-white/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors flex justify-center w-full shadow-sm" title="Zoom In"><ZoomIn size={18} /></button>
                    <button onClick={handleZoomOut} className="p-2 bg-white/5 hover:bg-white/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors flex justify-center w-full shadow-sm" title="Zoom Out"><ZoomOut size={18} /></button>
                    <button onClick={handleReset} className="p-2 bg-white/5 hover:bg-white/20 hover:text-cyan-300 text-slate-300 rounded-lg transition-colors flex justify-center w-full shadow-sm relative group" title="Reset View">
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}