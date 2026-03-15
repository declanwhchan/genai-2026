import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

type GLTFResult = {
  scene: THREE.Group;
};

export default function Model() {
  const { scene } = useGLTF("/human_modeluntextured.glb") as GLTFResult;

  useEffect(() => {

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());

    // Use an absolute offset so StrictMode's dev-only double effect
    // doesn't keep shifting the model farther away.
    scene.position.set(-center.x, -center.y, -center.z);

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

  }, [scene]);

  return <primitive object={scene} />;
}
