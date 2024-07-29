import React, {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { Canvas, extend } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { Box } from "@mui/material";
import CustomCamera from "./Components/CustomCamera.js";
import ControlPanel from "./Interface/ControlPanel.js";
import {
  ParticleSource,
  Rail,
  Slits,
  Screen,
  Scale,
} from "./Components/OpticElements.js";
import {
  IntensityBarChart,
  IntensityCurve,
  InterferencePattern,
} from "./Components/Messurements.js";
import * as math from "mathjs";
import "./App.css"; // CSS-Datei für das Styling

function App() {
  const [w, setW] = useState(math.unit(1, "nm"));
  const [d, setD] = useState(math.unit(1, "nm"));
  const [scale, setScale] = useState(1);
  const [lambda, setLambda] = useState(math.unit(1, "nm"));
  const [distance, setDistance] = useState(math.unit(3, "m"));
  const [particles, setParticles] = useState([]);
  const [intensityMap, setIntensityMap] = useState({});
  const [showBarChart, setShowBarChart] = useState(false);
  const [showCurve, setShowCurve] = useState(false);
  const [isFiring, setIsFiring] = useState(false); // Zustand für den Timer
  const [cameraPosition, setCameraPosition] = useState([5, 2.5, 5]);
  const [cameraLookAt, setCameraLookAt] = useState([0, 0, -0.5]);
  const [cameraFov, setCameraFov] = useState(45);
  const [cameraMoving, setCameraMoving] = useState(true);
  const [showSlits, setShowSlits] = useState(true);
  const [binSize] = useState(0.005);

  const particlesRef = useRef(particles); // Ref für Partikel

  const cameraRef = useRef();
  const containerRef = useRef();
  const rendererRef = useRef();

  particlesRef.current = particles; // Aktuelle Partikel referenzieren

  const setCamera = (position, lookAt, fovCamera, showSlits, cameraMoving) => {
    setCameraPosition(position);
    setCameraLookAt(lookAt);
    setCameraFov(fovCamera);
    setShowSlits(showSlits);
    setCameraMoving(cameraMoving);
  };

  const slitsSpring = useSpring({
    opacity: showSlits ? 1 : 0,
    config: { mass: 1, tension: 100, friction: 20 },
  });

  const AnimatedSlits = a(Slits);

  const initializeIntensityMap = () => {
    let newIntensityMap = {};
    for (let x = -2; x <= 2; x += binSize) {
      const bin = x.toFixed(2);
      newIntensityMap[bin] = {
        count: 0,
        intensity: computeIntensity(math.unit(x, "mm")),
      };
    }
    return newIntensityMap;
  };

  useEffect(() => {
    handleClearParticles();
  }, [d, w, lambda, distance]);

  useEffect(() => {
    let timer;
    if (isFiring) {
      timer = setInterval(() => {
        fireParticles(1000);
      }, 10); // 1 Millisekunde Abstand
    } else if (timer) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isFiring]);

  const computeIntensity = (x) => {
    // Skalierung nur in x-Richtung
    const beta = math.divide(
      math.divide(math.multiply(math.pi, w, x), scale * 4),
      math.multiply(lambda, distance)
    );
    const gamma = math.divide(
      math.divide(math.multiply(math.pi, d, x), scale * 4),
      math.multiply(lambda, distance)
    );

    if (math.isNaN(beta) || math.isNaN(gamma) || beta === 0) return 1; // Vermeidung von NaN-Werten
    const intensity = math.multiply(math.pow(math.divide(math.sin(beta), beta), 2), math.pow(math.cos(gamma), 2));
    if (intensity < 0.01) return 0;
    return intensity;
  };

  const handleFire = () => {
    fireParticles(1);
  };

  const handleFastFire = () => {
    if (particlesRef.current.length >= MAX_PARTICLES) {
      setIsFiring(false);
    }
    setIsFiring(!isFiring);
  };

  const MAX_PARTICLES = 100000;

  const weightedRandomBin = (bins, newIntensityMap) => {
    let selectedBin;
    while (true) {
      const randomBin = bins[Math.floor(Math.random() * bins.length)];
      const randomProbability = Math.random();
      const intensity = newIntensityMap[randomBin].intensity;
      if (randomProbability < intensity && randomProbability > 0.01) {
        selectedBin = randomBin;
        break;
      }
    }
    return selectedBin;
  };

  const adjustParticles = (newParticles, newIntensityMap) => {
    let adjustedParticles = [];

    for (let i = 0; i < newParticles.length; i++) {
      // Berechne Abweichungen und wähle die besten Segmente aus
      let bins = Object.keys(newIntensityMap);
      bins = bins.filter((bin) => newIntensityMap[bin] !== undefined); // Entferne undefined keys

      const bin = weightedRandomBin(
        bins,
        newIntensityMap,
      );
      if (!newIntensityMap[bin]) {
        newIntensityMap[bin] = {
          count: 0,
          intensity: computeIntensity(math.unit(parseFloat(bin), "mm")),
        };
      }
      const x = parseFloat(bin)  + (Math.random() - 0.5) * binSize;
      const y = (Math.random() - 0.5) * 4;
      const z = -distance.toNumber("m");
      adjustedParticles.push({ x, y, z });
      newIntensityMap[bin].count = (newIntensityMap[bin].count || 0) + 1;
    }

    setParticles((prevParticles) => [...prevParticles, ...adjustedParticles]);
    setIntensityMap(newIntensityMap);
  };

  const fireParticles = (count) => {
    let currentParticlesCount = particlesRef.current.length;

    if (currentParticlesCount + count > MAX_PARTICLES) {
      count = MAX_PARTICLES - currentParticlesCount;
      setIsFiring(false);
    }

    let newParticles = [];
    let newIntensityMap = { ...intensityMap };

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 4;
      const z = -distance.toNumber("m");
      const bin = (Math.floor((x + 2) / binSize) * binSize - 2).toFixed(2);

      if (!newIntensityMap[bin]) {
        newIntensityMap[bin] = {
          count: 0,
          intensity: computeIntensity(math.unit(parseFloat(bin), "mm")),
        };
      }

      newIntensityMap[bin].count += 1;
      newParticles.push({ x, y, z });
      currentParticlesCount += 1;

      if (currentParticlesCount >= MAX_PARTICLES) {
        break;
      }
    }
    
    adjustParticles(newParticles, newIntensityMap);
  };

  const handleClearParticles = () => {
    setParticles([]);
    setIntensityMap(initializeIntensityMap());
  };

  const setCameraPosition1 = () =>
    setCamera([5, 2.5, 5], [0, 0, -0.5], 45, true, true);
  const setCameraPosition2 = () =>
    setCamera([0, 0, 0.1], [0, 0, -3], 75, false, false);

  const handleResize = useCallback(() => {
    if (containerRef.current && cameraRef.current) {
      const aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.aspect = aspect;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  useEffect(() => {
    const handleResizeWrapper = () => {
      handleResize();
    };

    window.addEventListener("resize", handleResizeWrapper);
    handleResizeWrapper(); // Initial call to set the size correctly

    return () => {
      window.removeEventListener("resize", handleResizeWrapper);
    };
  }, [handleResize]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
        ref={containerRef}
      >
        <Box className="canvas-container">
          <Canvas className="canvas-element" ref={rendererRef}>
            <CustomCamera
              ref={cameraRef}
              position={cameraPosition}
              lookAt={cameraLookAt}
              fov={cameraFov}
              enableControls={cameraMoving} // Controls aktivieren oder deaktivieren
            />
            <ambientLight intensity={1} />
            <pointLight position={[0, 5, 5]} intensity={50} />
            <ParticleSource />
            <AnimatedSlits d={d} w={w} style={slitsSpring} />
            <Rail />
            <Scale scale={scale} distance={distance.toNumber("m")} />
            <InterferencePattern
              particles={particles}
            />
            {showCurve && (
              <IntensityCurve
                lambda={lambda}
                d={d}
                w={w}
                distance={distance}
                scale={scale}
              />
            )}
            {showBarChart && (
              <IntensityBarChart
                intensityMap={intensityMap}
                distance={distance.toNumber("m")}
                binSize={binSize}
              />
            )}
            <Screen distance={distance.toNumber("m")} />
          </Canvas>
        </Box>
        <ControlPanel
          w={w}
          setW={setW}
          d={d}
          setD={setD}
          lambda={lambda}
          setLambda={setLambda}
          scale={scale}
          setScale={setScale}
          handleFire={handleFire}
          handleFastFire={handleFastFire}
          isFiring={isFiring}
          handleClearParticles={handleClearParticles}
          showBarChart={showBarChart}
          setShowBarChart={setShowBarChart}
          showCurve={showCurve}
          setShowCurve={setShowCurve}
          setCameraPosition1={setCameraPosition1}
          setCameraPosition2={setCameraPosition2}
        />
      </Box>
    </Box>
  );
}

export default App;
