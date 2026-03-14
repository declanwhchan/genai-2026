import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

type GLTFResult = {
  scene: THREE.Group;
};

export default function Model() {
  const { scene } = useGLTF("/human_organs/3d-sbu-f-large-intestine.glb") as GLTFResult;

  useEffect(() => {
    // Find organ by name
    const colon = scene.getObjectByName("VH_F_colon");

    // Debug
    scene.traverse((child) => {
        console.log(child.name);
    });

    if (colon && colon instanceof THREE.Mesh) {
      const material = colon.material as THREE.MeshStandardMaterial;

      material.emissive = new THREE.Color(0xff0000);
      material.emissiveIntensity = 2;
    }

    const infectedOrgans = ["VH_F_colon"];

    infectedOrgans.forEach((name) => {
        const organ = scene.getObjectByName(name);
        console.log("here");

        if (organ instanceof THREE.Mesh) {
            console.log("here");
            const mat = organ.material as THREE.MeshStandardMaterial;
            mat.emissive = new THREE.Color(0xff0000);
            mat.emissiveIntensity = 1.5;
        }
    });
  }, [scene]);

  return <primitive object={scene} />;
}