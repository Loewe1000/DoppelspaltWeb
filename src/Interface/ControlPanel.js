import React, { useEffect, useState } from "react";
import {
  Box,
  Slider,
  Typography,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import * as math from "mathjs";

const particleTypes = {
    Photonen: {
      lambda: { unit: "nm", min: 1, max: 1200 },
      w: { unit: "um", min: 100, max: 1000 },
      d: { unit: "um", min: 100, max: 2000 },
    },
    Elektronen: {
      lambda: { unit: "pm", min: 1, max: 40 },
      w: { unit: "nm", min: 100, max: 1000 },
      d: { unit: "nm", min: 100, max: 2000 },
    },
    Myonen: {
      lambda: { unit: "pm", min: 100, max: 2500 },
      w: { unit: "um", min: 1, max: 100 },
      d: { unit: "um", min: 1, max: 200 },
    },
    Protonen: {
      lambda: { unit: "nm", min: 1, max: 30 },
      w: { unit: "um", min: 1, max: 100 },
      d: { unit: "um", min: 1, max: 200 },
    },
    Neutronen: {
      lambda: { unit: "nm", min: 1, max: 30 },
      w: { unit: "um", min: 1, max: 100 },
      d: { unit: "um", min: 1, max: 200 },
    },
    "He-Atome": {
      lambda: { unit: "pm", min: 20, max: 450 },
      w: { unit: "um", min: 1, max: 50 },
      d: { unit: "um", min: 1, max: 100 },
    },
    "Na-Moleküle": {
      lambda: { unit: "pm", min: 5, max: 130 },
      w: { unit: "um", min: 1, max: 100 },
      d: { unit: "um", min: 1, max: 200 },
    },
    "Cs-Atome": {
      lambda: { unit: "pm", min: 4, max: 80 },
      w: { unit: "um", min: 1, max: 100 },
      d: { unit: "um", min: 1, max: 200 },
    },
  };

const ControlPanel = ({
  w,
  setW,
  d,
  setD,
  lambda,
  setLambda,
  scale,
  setScale,
  handleFire,
  handleFastFire,
  isFiring,
  handleClearParticles,
  showBarChart,
  setShowBarChart,
  showCurve,
  setShowCurve,
  setCameraPosition1,
  setCameraPosition2,
}) => {
  const [particleType, setParticleType] = useState("Photonen");

  useEffect(() => {
    setLambda(math.unit(particleTypes[particleType].lambda.min, math.unit(particleTypes[particleType].lambda.unit)));
    setD(math.unit(particleTypes[particleType].d.min, math.unit(particleTypes[particleType].d.unit)));
    setW(math.unit(particleTypes[particleType].w.min, math.unit(particleTypes[particleType].w.unit)));
  },[particleType]);

  const scaleMarks = [
    { value: 0, label: "1" },
    { value: 1, label: "10" },
    { value: 2, label: "100" },
    { value: 3, label: "1000" },
    { value: 4, label: "10000" },
    { value: 5, label: "100000" },
  ];

  const scaleValues = [1, 10, 100, 1000, 10000, 100000];


  return (
    <Box
      sx={{
        width: 300,
        minWidth: 300,
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      className={"control-menu"}
    >
      <Typography variant="h6">Controls</Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1">Teilchentyp</Typography>
        <Select
          fullWidth
          value={particleType}
          onChange={(e) => setParticleType(e.target.value)}
        >
          {Object.keys(particleTypes).map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1">
          Wellenlänge ({particleTypes[particleType].lambda.min}{particleTypes[particleType].lambda.unit} - {particleTypes[particleType].lambda.max}{particleTypes[particleType].lambda.unit})
        </Typography>
        <Slider
          value={lambda.toNumber(particleTypes[particleType].lambda.unit)}
          onChange={(e, newValue) => setLambda(math.unit(newValue, particleTypes[particleType].lambda.unit))}
          min={particleTypes[particleType].lambda.min}
          max={particleTypes[particleType].lambda.max}
          valueLabelDisplay={"auto"}
        />
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1">
          Spaltbreite ({particleTypes[particleType].w.min}{particleTypes[particleType].w.unit} - {particleTypes[particleType].w.max}{particleTypes[particleType].w.unit})
        </Typography>
        <Slider
          value={w.toNumber(particleTypes[particleType].w.unit)}
          onChange={(e, newValue) => setW(math.unit(newValue, particleTypes[particleType].w.unit))}
          min={particleTypes[particleType].w.min}
          max={particleTypes[particleType].w.max}
          valueLabelDisplay={"auto"}
        />
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1">
          Spaltabstand ({particleTypes[particleType].d.min}{particleTypes[particleType].d.unit} - {particleTypes[particleType].d.max}{particleTypes[particleType].d.unit})
        </Typography>
        <Slider
          value={d.toNumber(particleTypes[particleType].d.unit)}
          onChange={(e, newValue) => setD(math.unit(newValue, particleTypes[particleType].d.unit))}
          min={particleTypes[particleType].d.min}
          max={particleTypes[particleType].d.max}
          valueLabelDisplay={"auto"}
        />
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1">Skalierung</Typography>
        <Slider
          value={scaleValues.indexOf(scale)}
          onChange={(e, newValue) => setScale(scaleValues[newValue])}
          step={1}
          marks={scaleMarks}
          min={0}
          max={5}
        />
      </Box>
      {/* <Typography gutterBottom>Distance to Screen</Typography>
      <Slider
        value={distance}
        onChange={(e, value) => setDistance(value)}
        step={0.1}
        min={1}
        max={5}
        valueLabelDisplay="auto"
      /> */}
      <Button variant="contained" onClick={handleFire}>
        Fire Particle
      </Button>
      <Button
        variant="contained"
        color={isFiring ? "secondary" : "primary"}
        onClick={handleFastFire}
      >
        {isFiring ? "Stop Firing" : "Fast Fire"}
      </Button>
      <Button variant="contained" color="error" onClick={handleClearParticles}>
        Clear Particles
      </Button>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => setShowBarChart(!showBarChart)}
        >
          {showBarChart ? "Hide" : "Show"} Intensity Bar Chart
        </Button>
        <Button variant="outlined" onClick={() => setShowCurve(!showCurve)}>
          {showCurve ? "Hide" : "Show"} Intensity Curve
        </Button>
      </Box>
      <Typography variant="h6">Camera Positions</Typography>
      <Button variant="outlined" onClick={setCameraPosition1}>
        Position 1
      </Button>
      <Button variant="outlined" onClick={setCameraPosition2}>
        Position 2
      </Button>
    </Box>
  );
};

export default ControlPanel;
