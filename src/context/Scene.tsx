import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export type SceneContextValue = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.Renderer;
  control: OrbitControls;
};

const SceneContext = createContext<SceneContextValue | null>(null);

export const useSceneContext = () => {
  const sceneCtx = useContext(SceneContext);
  if (!sceneCtx) throw new Error("SceneContext is null");
  return sceneCtx;
};

export const Scene = ({
  children,
}: {
  children?: ReactNode;
}): JSX.Element | null => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { current: scene } = useRef<THREE.Scene>(new THREE.Scene());
  const { current: camera } = useRef<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );
  const [renderer, setRenderer] = useState<THREE.Renderer>();
  const [control, setControl] = useState<OrbitControls>();
  const [light] = useState(() => {
    const light = new THREE.AmbientLight(0xffaaff);
    light.position.set(10, 10, 10);
    return light;
  });

  const handleResize = useCallback(() => {
    if (!renderer || !camera) {
      return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, [camera, renderer]);

  // setup
  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      depth: true,
    });
    camera.position.set(0, 10, 10);
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
    renderer.setClearColor(0xeeeeee);
    const control = new OrbitControls(camera, renderer.domElement);
    control.update();
    scene.add(light);
    setRenderer(renderer);
    setControl(control);
  }, [camera, canvasRef, light, scene]);

  useEffect(handleResize, [handleResize]);

  const sceneContext = useMemo<SceneContextValue | null>(() => {
    if (!renderer || !control) return null;
    return {
      scene,
      renderer,
      control,
      camera,
    };
  }, [camera, control, renderer, scene]);

  return (
    <>
      <canvas ref={canvasRef} />
      {sceneContext ? (
        <SceneContext.Provider value={sceneContext}>
          {children}
        </SceneContext.Provider>
      ) : null}
    </>
  );
};
