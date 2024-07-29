import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import * as math from "mathjs";

function IntensityBarChart({ intensityMap = {}, distance, binSize, scale }) {
  const bars = [];

  const maxCount = Math.max(
    ...Object.values(intensityMap).map((item) => item.count),
    1
  ); // Max count, at least 1 to avoid division by zero

  Object.keys(intensityMap).forEach((key) => {
    const bin = parseFloat(key);
    const count = intensityMap[key].count || 0;
    const normalizedHeight = (count / maxCount) * 4; // Normiere auf maximale Höhe von 4
    bars.push(
      new THREE.Vector3(bin, normalizedHeight / 2 - 2, -distance + 0.1)
    ); // Platziere am unteren Rand des Schirms
  });

  return (
    <group>
      {bars.map((bar, index) => (
        <mesh key={index} position={bar}>
          <boxGeometry args={[binSize * 2, bar.y * 2 + 4, binSize * 2]} />{" "}
          {/* Verdopple die Höhe für die Box, da sie vom Mittelpunkt aus wächst */}
          <meshStandardMaterial color="green" />
        </mesh>
      ))}
    </group>
  );
}

function IntensityCurve({ lambda, d, w, distance, scale }) {
  const computeIntensity = (x) => {
    // Der Schirm ist bei einer Skalierung von 1 immer 20mm (0.02m) breit

    // Skalierung nur in x-Richtung
    const beta = math.divide(math.divide(math.multiply(math.pi, w, x), scale), math.multiply(lambda, distance));
    const gamma = math.divide(math.divide(math.multiply(math.pi, d, x), scale), math.multiply(lambda, distance))

    if (math.isNaN(beta) || math.isNaN(gamma) || beta === 0) return 1; // Vermeidung von NaN-Werten
    const intensity = math.multiply(math.pow(math.divide(math.sin(beta), beta), 2), math.pow(math.cos(gamma), 2));
    return intensity;
  };
  const points = [];
  const resolution = 1000;
  for (let i = 0; i <= resolution; i++) {
    const x = (i / resolution - 0.5) * 4;
    const xUnit = math.unit((i / resolution - 0.5), "mm");
    const intensity = computeIntensity(xUnit);
    points.push(new THREE.Vector3(x, intensity * 4 - 2, -distance.toNumber("m") + 0.11)); // Skalierung für Visualisierung
  }

  //console.log(points);

  return <Line points={points} color="blue" lineWidth={5} />;
}

function InterferencePattern({ particles }) {
  const meshRef = useRef();

  const particleCount = particles.length;
  const positions = new Float32Array(particleCount * 3);

  particles.forEach((particle, index) => {
    positions.set([particle.x, particle.y, particle.z + 0.1], index * 3);
  });

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleCount}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" color="red" size={0.016} />
    </points>
  );
}

export { IntensityBarChart, IntensityCurve, InterferencePattern };
