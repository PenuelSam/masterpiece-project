'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ExplodingCubes from './ExplodingCubes';

gsap.registerPlugin(ScrollTrigger);

const PARTICLE_COUNT = 2000;
const CUBE_SIZE = 2;

export default function ParticleCanvas() {
  const pointsRef = useRef();
  const cubeRef = useRef();
  const [showExplosion, setShowExplosion] = useState(false); // To trigger the explosion
  const [explosionProgress, setExplosionProgress] = useState(0); // To track the explosion

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  const cubePositions = useMemo(() => {
    const grid = Math.cbrt(PARTICLE_COUNT);
    const arr = [];
    let index = 0;
    for (let x = 0; x < grid; x++) {
      for (let y = 0; y < grid; y++) {
        for (let z = 0; z < grid; z++) {
          if (index >= PARTICLE_COUNT) break;
          arr.push(
            (x / grid - 0.5) * CUBE_SIZE,
            (y / grid - 0.5) * CUBE_SIZE,
            (z / grid - 0.5) * CUBE_SIZE
          );
          index++;
        }
      }
    }
    return new Float32Array(arr);
  }, []);

  useEffect(() => {
    const posAttr = pointsRef.current.geometry.attributes.position;
    const from = posAttr.array.slice();
    const to = cubePositions;
    const progress = { t: 0 };
  
    const particleMat = pointsRef.current.material;
    const cubeMat = cubeRef.current.material;
    cubeRef.current.visible = true;
  
    let explosionTriggered = false;
  
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: () => window.innerHeight * 4,
      scrub: true,
      onUpdate: (self) => {
        progress.t = self.progress;
  
        for (let i = 0; i < from.length; i++) {
          posAttr.array[i] = THREE.MathUtils.lerp(from[i], to[i], progress.t);
        }
        posAttr.needsUpdate = true;
  
        particleMat.opacity = 1 - progress.t;
        cubeMat.opacity = progress.t;
  
        // Trigger once and only once
        if (progress.t >= 0.9 && !explosionTriggered) {
          explosionTriggered = true;
          setShowExplosion(true);
  
          // Decoupled animation after morph is done
          gsap.to({}, {
            duration: 0.1, // brief delay to ensure morph has applied
            onComplete: () => {
              gsap.to({}, {
                duration: 1.5,
                onUpdate: function () {
                  setExplosionProgress(prev => Math.min(prev + 0.03, 1));
                },
                onComplete: () => {
                  console.log("Explosion animation complete.");
                }
              });
            }
          });
        }

        const explosionT = Math.min(Math.max((progress.t - 0.9) / 0.1, 0), 1);
        setExplosionProgress(explosionT);
      },
    });
  
    return () => {
      trigger.kill();
    };
  }, [cubePositions]);
  



  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.005;
    }
    if (cubeRef.current) {
      cubeRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          color={0xffffff}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={1}
        />
      </points>

      <mesh ref={cubeRef} visible={explosionProgress < 0.01}>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {showExplosion && <ExplodingCubes explosionProgress={explosionProgress} />}
    </>
  );
}
