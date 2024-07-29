import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { Line, Text } from "@react-three/drei";
import { useMemo } from "react";

function ParticleSource() {
  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  const cylinderMaterial = new THREE.MeshStandardMaterial({ color: "red" });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(0, 0, 0);
  cylinder.rotation.x = Math.PI / 2;

  // Create the stand (metal rod)
  const standGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 32);
  const standMaterial = new THREE.MeshStandardMaterial({ color: "black" });
  const stand = new THREE.Mesh(standGeometry, standMaterial);
  stand.position.set(0, -1.5, 0);

  return (
    <group position={[0, 0, 2]}>
      <primitive object={cylinder} />
      <primitive object={stand} />
    </group>
  );
}

function Rail() {
  // Define the rail geometry
  const railShape = new THREE.Shape();
  railShape.moveTo(-0.5, 0);
  railShape.lineTo(0.5, 0);
  railShape.lineTo(0, 0.5);
  railShape.lineTo(-0.5, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 20,
    bevelEnabled: false,
  };

  const railGeometry = new THREE.ExtrudeGeometry(railShape, extrudeSettings);
  const railMaterial = new THREE.MeshStandardMaterial({
    color: "gray",
    roughness: 0.6, // Adjust to make the surface rougher
    metalness: 0.6, // Adjust to add some reflectivity
  });
  const rail = new THREE.Mesh(railGeometry, railMaterial);

  // Position the rail
  rail.position.y = -3.25; // Adjust based on the height of the stands
  rail.position.z = -14; // Adjust based on the height of the stands

  return <primitive object={rail} />;
}

function Slits({ d, w, style }) {
  // Define the plate geometry
  const plateGeometry = new THREE.BoxGeometry(1, 1, 0.01);
  const plateMaterial = new THREE.MeshStandardMaterial({
    color: "gray",
    transparent: true,
    opacity: style.opacity,
  });
  const plate = new THREE.Mesh(plateGeometry, plateMaterial);

  // Define the slit geometry
  const slitGeometry = new THREE.BoxGeometry(w, 0.8, 0.1); // 80% der Höhe der Platte

  // Create and position the slit meshes
  const slit1 = new THREE.Mesh(slitGeometry);
  slit1.position.set(-d / 2 - w / 2, 0, 0);
  slit1.updateMatrix(); // Ensure the matrix is current

  const slit2 = new THREE.Mesh(slitGeometry);
  slit2.position.set(d / 2 + w / 2, 0, 0);
  slit2.updateMatrix(); // Ensure the matrix is current

  // Perform boolean operations to create the slits in the plate
  const plateCSG = CSG.fromMesh(plate);
  const slit1CSG = CSG.fromMesh(slit1);
  const slit2CSG = CSG.fromMesh(slit2);

  const resultCSG = plateCSG.subtract(slit1CSG).subtract(slit2CSG);
  const result = CSG.toMesh(resultCSG, plate.matrix, plate.material);
  result.geometry.computeVertexNormals(); // Ensure proper shading

  // Create the stand (metal rod)
  const standGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 32);
  const standMaterial = new THREE.MeshStandardMaterial({
    color: "black",
    transparent: true,
    opacity: style.opacity,
  });
  const stand = new THREE.Mesh(standGeometry, standMaterial);

  const group = new THREE.Group();
  group.add(result);
  group.add(stand);
  stand.position.set(0, -1.75, 0);

  return <primitive object={group} />;
}

function Screen({ distance }) {
  // Create the screen
  const screenGeometry = new THREE.BoxGeometry(4.1, 4.1, 0.1);
  const screenMaterial = new THREE.MeshStandardMaterial({ color: "white" });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);

  // Create the stand (metal rod)
  const standGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
  const standMaterial = new THREE.MeshStandardMaterial({ color: "black" });
  const stand = new THREE.Mesh(standGeometry, standMaterial);
  stand.position.set(0, -2.5, 0);

  return (
    <group position={[0, 0, -distance]}>
      <primitive object={screen} />
      <primitive object={stand} />
    </group>
  );
}

const Scale = ({ scale, distance }) => {
  const length = 4; // Immer 4 Einheiten im View

  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i <= length * 10; i++) {
      const x = (i / 10) - length / 2;
      pos.push([x, -0.05 - 1.8, -distance + 0.1]);
      pos.push([x, 0.05 - 1.8, -distance + 0.1]);
    }
    return pos.flat();
  }, [length, distance]);

  const labels = useMemo(() => {
    const lbls = [];
    for (let i = 0; i <= length; i++) {
      const x = (i - length / 2);
      lbls.push(
        <Text position={[x, -0.15 - 1.75, -distance + 0.1]} fontSize={0.05} color="black" key={i}>
          {(x * scale * 5).toFixed(1)} mm
        </Text>
      );
    }
    return lbls;
  }, [length, distance, scale]);

  return (
    <group>
      <Line points={positions} color="black" lineWidth={1} />
      {labels}
    </group>
  );
};

export { ParticleSource, Rail, Slits, Screen, Scale };
