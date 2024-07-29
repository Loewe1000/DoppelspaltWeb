import React, { useRef, useEffect, useState, forwardRef } from "react";
import { extend, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { a, useSpring } from "@react-spring/three";

extend({ OrbitControls: ThreeOrbitControls });

const CustomCamera = forwardRef(
  ({ position, lookAt, fov = 65, enableControls = true }, ref) => {
    const cameraRef = useRef();
    const controlsRef = useRef();
    const { gl, set, size } = useThree();

    const [currentPosition, setCurrentPosition] = useState(position);
    const [currentLookAt, setCurrentLookAt] = useState(lookAt);
    const [currentFov, setCurrentFov] = useState(fov);
    const [userControl, setUserControl] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(1);

    const { positionSpring, lookAtSpring, fovSpring } = useSpring({
      positionSpring: currentPosition,
      lookAtSpring: currentLookAt,
      fovSpring: currentFov,
      config: { mass: 1, tension: userControl ? 0 : 120, friction: 26 },
      onRest: () => setUserControl(false), // Setzt userControl nach der Animation auf false
    });

    useEffect(() => {
      if (!userControl) {
        setCurrentPosition(position);
        setCurrentLookAt(lookAt);
        setCurrentFov(fov);
      }
      const aspect = size.width / size.height;
      setAspectRatio(aspect);
    }, [position, lookAt, fov]);

    useEffect(() => {
      if (cameraRef.current && cameraRef.current.aspect != aspectRatio) {
        cameraRef.current.aspect = aspectRatio;
        cameraRef.current.updateProjectionMatrix();
      }
    }, [aspectRatio]);

    useFrame(() => {
      if (cameraRef.current && controlsRef.current) {
        if (!userControl) {
          cameraRef.current.position.set(...positionSpring.get());
          controlsRef.current.target.set(...lookAtSpring.get());
          cameraRef.current.fov = fovSpring.get();
          cameraRef.current.updateProjectionMatrix();
          controlsRef.current.update();
        }
      }
    });

    useEffect(() => {
      if (cameraRef.current) {
        cameraRef.current.position.set(...currentPosition);
        cameraRef.current.lookAt(...currentLookAt);
        cameraRef.current.fov = currentFov;
        cameraRef.current.updateProjectionMatrix();
        set({ camera: cameraRef.current });
      }
    }, [currentPosition, currentLookAt, currentFov, set]);

    useEffect(() => {
      const handleStart = () => setUserControl(true);
      const handleEnd = () => {
        setCurrentPosition([
          cameraRef.current.position.x,
          cameraRef.current.position.y,
          cameraRef.current.position.z,
        ]);
        setCurrentLookAt([
          controlsRef.current.target.x,
          controlsRef.current.target.y,
          controlsRef.current.target.z,
        ]);
        setCurrentFov(cameraRef.current.fov);
      };

      controlsRef.current?.addEventListener("start", handleStart);
      controlsRef.current?.addEventListener("end", handleEnd);

      return () => {
        controlsRef.current?.removeEventListener("start", handleStart);
        controlsRef.current?.removeEventListener("change", handleEnd);
      };
    });

    return (
      <>
        <a.perspectiveCamera ref={cameraRef} />
        {cameraRef.current && (
          <orbitControls
            ref={controlsRef}
            args={[cameraRef.current, gl.domElement]}
            enableZoom={enableControls}
            enablePan={enableControls}
            enableRotate={enableControls}
          />
        )}
      </>
    );
  }
);

export default CustomCamera;
