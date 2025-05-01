// components/CityBuilder.jsx
'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

export default function CityBuilder() {
  const { scene } = useGLTF('/models/low_poly_night_city_building_skyline.glb'); // replace with your model path

  const buildings = useMemo(() => {
    const instances = [];
    for (let i = 0; i < 30; i++) {
      instances.push({
        position: [
          (Math.random() - 0.5) * 10,
          0,
          (Math.random() - 0.5) * 10,
        ],
        scale: Math.random() * 0.4 + 0.2,
      });
    }
    return instances;
  }, []);

  return (
    <>
      {buildings.map((b, i) => (
        <primitive
          key={i}
          object={scene.clone()}
          position={b.position}
          scale={[b.scale, b.scale, b.scale]}
        />
      ))}
    </>
  );
}
