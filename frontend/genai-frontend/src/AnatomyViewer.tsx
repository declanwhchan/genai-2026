import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Model from "./Model.tsx";

export default function AnatomyViewer() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} />
      
      <Model />

      <OrbitControls />
    </Canvas>
  );
}