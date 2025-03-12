// src/app/api/v1/tempImg/route.js
import { NextResponse } from "next/server";
import sharp from "sharp";

// Constants
const IMG_SIZE = 500;
var MAX_LINES = 4000;
var N_PINS = 288;
const MIN_LOOP = 20;
const MIN_DISTANCE = 20;
var LINE_WEIGHT = 20;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const lineWeight = formData.get("lineWeight");
    const numberOfNails = formData.get("numberOfNails");
    const numberOfThreads = formData.get("numberOfThreads");

    MAX_LINES = numberOfThreads;
    N_PINS = numberOfNails;
    LINE_WEIGHT = lineWeight;

    if (!imageFile) {
      return NextResponse.json(
        { status: "fail", error: "No image file provided" },
        { status: 400 }
      );
    }

    // Process image
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create grayscale matrix
    const { data } = await sharp(buffer)
      .resize(IMG_SIZE, IMG_SIZE)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert to 2D array
    const imgMatrix = [];
    for (let y = 0; y < IMG_SIZE; y++) {
      const row = [];
      for (let x = 0; x < IMG_SIZE; x++) {
        row.push(data[y * IMG_SIZE + x]);
      }
      imgMatrix.push(row);
    }

    // Generate line sequence
    const lineSequence = await generateLineSequence(imgMatrix);
    // console.log(JSON.stringify(lineSequence));

    return NextResponse.json({
      status: "success",
      lineSequence: JSON.stringify(lineSequence),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: "fail", error: e.message },
      { status: 500 }
    );
  }
}

async function generateLineSequence(imgMatrix) {
  // Calculate pin coordinates
  const pinCoords = [];
  const center = IMG_SIZE / 2;
  const radius = IMG_SIZE / 2 - 1 / 2;

  for (let i = 0; i < N_PINS; i++) {
    const angle = (2 * Math.PI * i) / N_PINS;
    pinCoords.push([
      Math.floor(center + radius * Math.cos(angle)),
      Math.floor(center + radius * Math.sin(angle)),
    ]);
  }

  // Precalculate lines
  const lineCache = Array(N_PINS * N_PINS)
    .fill()
    .map(() => ({
      xs: [],
      ys: [],
      length: 0,
      weight: 1,
    }));

  for (let a = 0; a < N_PINS; a++) {
    for (let b = a + MIN_DISTANCE; b < N_PINS; b++) {
      const x0 = pinCoords[a][0];
      const y0 = pinCoords[a][1];
      const x1 = pinCoords[b][0];
      const y1 = pinCoords[b][1];

      const d = Math.floor(Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2));
      lineCache[b * N_PINS + a] = {
        xs: linspace(x0, x1, d),
        ys: linspace(y0, y1, d),
        length: d,
      };
      lineCache[a * N_PINS + b] = lineCache[b * N_PINS + a];
    }
  }

  // Initialize variables
  let error = createMatrix(IMG_SIZE, IMG_SIZE, 255);
  let lineSequence = [0];
  let pin = 0;
  let lastPins = [];

  for (let y = 0; y < IMG_SIZE; y++) {
    for (let x = 0; x < IMG_SIZE; x++) {
      error[y][x] -= imgMatrix[y][x];
    }
  }

  // Main loop
  for (let l = 0; l < MAX_LINES; l++) {
    let maxErr = -1;
    let bestPin = -1;

    for (let offset = MIN_DISTANCE; offset < N_PINS - MIN_DISTANCE; offset++) {
      const testPin = (pin + offset) % N_PINS;
      if (lastPins.includes(testPin)) continue;

      const line = lineCache[testPin * N_PINS + pin];
      let lineErr = 0;

      for (let i = 0; i < line.xs.length; i++) {
        const x = line.xs[i];
        const y = line.ys[i];
        if (x >= 0 && x < IMG_SIZE && y >= 0 && y < IMG_SIZE) {
          lineErr += error[y][x];
        }
      }

      if (lineErr > maxErr) {
        maxErr = lineErr;
        bestPin = testPin;
      }
    }

    if (bestPin === -1) {
      lastPins = [];
      continue;
    }

    lineSequence.push(bestPin);
    const line = lineCache[bestPin * N_PINS + pin];

    // Update error matrix
    for (let i = 0; i < line.xs.length; i++) {
      const x = line.xs[i];
      const y = line.ys[i];
      if (x >= 0 && x < IMG_SIZE && y >= 0 && y < IMG_SIZE) {
        error[y][x] = Math.max(0, error[y][x] - LINE_WEIGHT);
      }
    }

    lastPins.push(bestPin);
    if (lastPins.length > MIN_LOOP) lastPins.shift();
    pin = bestPin;
  }

  return lineSequence;
}

// Helper functions
function createMatrix(width, height, initialValue) {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => initialValue)
  );
}

function linspace(a, b, n) {
  if (n < 2) return n === 1 ? [a] : [];
  const arr = Array(n);
  const step = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) {
    arr[i] = Math.round(a + step * i);
  }
  return arr;
}
