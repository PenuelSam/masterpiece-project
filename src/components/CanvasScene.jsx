'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Particle from './Particle';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function SceneEffects() {
  const lightRef = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    // Animate light intensity
    if (lightRef.current) {
      tl.to(lightRef.current, { intensity: 3 }, 1.3);
    }

    // Animate camera position
    tl.to(camera.position, { x: 5, z: 5, duration: 3 }, 1.2);

    return () => {
      ScrollTrigger.kill();
    };
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight ref={lightRef} position={[5, 5, 5]} intensity={1} />
    </>
  );
}

export default function CanvasScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <SceneEffects />
      <Particle />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
