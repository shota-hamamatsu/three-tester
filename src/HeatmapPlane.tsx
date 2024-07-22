import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneContext } from "./context/Scene";
import { Heatmap, HeatmapData } from "./Heatmap";

type HeatmapPlaneProps = {
  data: HeatmapData;
};

const MAX = 2000;

/** Reactコンポーネント版ヒートマップ */
export const HeatmapPlane = ({
  data,
}: HeatmapPlaneProps): JSX.Element | null => {
  const { scene } = useSceneContext();
  const { current: heatmap } = useRef<Heatmap>(new Heatmap());
  const { current: texture } = useRef<THREE.CanvasTexture>(
    new THREE.CanvasTexture(heatmap.getCanvas())
  );
  const { current: geometry } = useRef<THREE.PlaneGeometry>(
    new THREE.PlaneGeometry()
  );
  const { current: material } = useRef<THREE.MeshStandardMaterial>(
    new THREE.MeshStandardMaterial({
      map: texture,
      depthWrite: true,
    })
  );
  const { current: mesh } = useRef<
    THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>
  >(
    new THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>(
      geometry,
      material
    )
  );

  const bounds = useMemo(() => {
    const points = data.map(([x, y]) => new THREE.Vector2(x, y));
    const bbox = new THREE.Box2().setFromPoints(points);
    const size = bbox.getSize(new THREE.Vector2());
    return { width: size.x, height: size.y };
  }, [data]);

  const handleUpdateOptions = useCallback(() => {
    heatmap.setMax(MAX);
  }, [heatmap]);

  const handleResizeCanvas = useCallback(() => {
    heatmap.resize(bounds.width, bounds.height);
    mesh.material.needsUpdate = true;
  }, [bounds.height, bounds.width, heatmap, mesh.material]);

  const handleUpdate = useCallback(() => {
    heatmap.setData(data);
    heatmap.draw(0);
    mesh.scale.set(bounds.width, bounds.height, 1);
    mesh.material.needsUpdate = true;
  }, [bounds.height, bounds.width, data, heatmap, mesh.material, mesh.scale]);

  useEffect(() => {
    scene.add(mesh);
    return () => {
      scene.remove(mesh);
    };
  }, [mesh, scene]);

  useEffect(handleUpdateOptions, [handleUpdateOptions]);

  useEffect(handleResizeCanvas, [handleResizeCanvas]);

  useEffect(handleUpdate, [handleUpdate]);

  return null;
};
