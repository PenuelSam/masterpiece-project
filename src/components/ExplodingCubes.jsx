'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NUM_CUBES = 2000;
const EXPLOSION_FORCE = 6;
const GRAVITY = -9.8;
const FLOOR_Y = -2;
const BOUNCE_DAMPING = 0.6;

export default function ExplodingCubes({ explosionProgress, onExplosionEnd }) {
  const cubeRefs = useRef([]);
  const velocities = useRef([]);
  const rotations = useRef([]);
  const positions = useRef([]);
  const time = useRef(0);
  const [explosionStarted, setExplosionStarted] = useState(false);

  useMemo(() => {
    for (let i = 0; i < NUM_CUBES; i++) {
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();

      velocities.current[i] = dir.multiplyScalar(EXPLOSION_FORCE * (0.5 + Math.random()));
      rotations.current[i] = new THREE.Vector3(
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1
      );
      positions.current[i] = new THREE.Vector3(0, 0, 0);
    }
  }, []);

  useFrame((_, delta) => {
    if (explosionProgress < 1) return;

    if (!explosionStarted) {
      setExplosionStarted(true);
      time.current = 0;
    }

    time.current += delta;
    let allStopped = true;

    for (let i = 0; i < NUM_CUBES; i++) {
      const velocity = velocities.current[i];
      const pos = positions.current[i];

      // Apply gravity
      velocity.y += GRAVITY * delta;

      // Move position
      pos.addScaledVector(velocity, delta);

      // Bounce on ground
      if (pos.y <= FLOOR_Y) {
        pos.y = FLOOR_Y;
        if (Math.abs(velocity.y) > 0.1) {
          velocity.y *= -BOUNCE_DAMPING;
          velocity.x *= 0.9;
          velocity.z *= 0.9;
        } else {
          velocity.y = 0;
        }
      }

      if (velocity.lengthSq() > 0.001) allStopped = false;

      // Update mesh
      const mesh = cubeRefs.current[i];
      if (mesh) {
        mesh.position.copy(pos);
        mesh.rotation.x += rotations.current[i].x;
        mesh.rotation.y += rotations.current[i].y;
        mesh.rotation.z += rotations.current[i].z;
      }
    }

    // Trigger city build
    if (allStopped && explosionStarted && onExplosionEnd) {
      onExplosionEnd();
    }
  });

  return (
    <>
      {/* Dust Particles */}
      {explosionStarted && (
        <pointLight
          position={[0, 0, 0]}
          intensity={1.2}
          distance={5}
          color={'#ffffff'}
          decay={2}
        />
      )}

      {positions.current.map((pos, index) => (
        <mesh
          key={index}
          ref={(el) => (cubeRefs.current[index] = el)}
          position={pos}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={0xffffff} metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </>
  );
}
