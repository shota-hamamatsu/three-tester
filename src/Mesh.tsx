import { useEffect } from "react";
import * as THREE from "three";
import { useSceneContext } from "./context/Scene";

export const Mesh = (): JSX.Element | null => {
  const { renderer, camera, scene } = useSceneContext();
  useEffect(() => {
    if (!renderer || !camera) {
      return;
    }
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(boxGeometry, material);
    mesh.castShadow = true;
    const size = 10;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);
    scene.add(mesh);
  }, [renderer, camera, scene]);

  return null;
};
