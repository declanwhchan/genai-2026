import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

type GLTFResult = {
  scene: THREE.Group;
};

export default function Model({ onCenter }: { onCenter?: (v: THREE.Vector3) => void }) {
  const { scene } = useGLTF("/human_modeluntextured.glb") as GLTFResult;

  useEffect(() => {

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());

    // Move model so center sits at origin
    scene.position.sub(center);

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const applyTransparency = (mat: THREE.Material) => {
          mat.transparent = true;
          mat.opacity = 0.5;
          mat.depthWrite = false;
        };

        if (Array.isArray(child.material)) {
          child.material.forEach(applyTransparency);
        } else {
          applyTransparency(child.material);
        }
      }
    });

    onCenter?.(new THREE.Vector3(0, 0, 0));
  }, [scene, onCenter]);

  return <primitive object={scene} />;
}