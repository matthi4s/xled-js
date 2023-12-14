import { Light, Led, Frame, Movie } from "../dist/index.js";
import { parseGIF, decompressFrames } from "gifuct-js";
// import axios, { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";

const gifURL = "https://i.imgur.com/pfEN7sb.gif";

const frames = await fetchAndParseGif(gifURL);
const downFrames = frames.map((frame) => processPoints(frame, 16));
// console.log(downFrames);
// const downFrames = downsample(frames, 16);
// console.log(frames[0].filter((led) => !led.transparent));

run();

async function run() {
  // instantiate the device
  console.log("Creating device...");
  const twinkly = new Light("192.168.1.164");

  // Define the size of the grid
  const gridSize = 16; // Change this value to adjust the size of the grid

  // make a 2D grid array
  const grid = [makeGrid(gridSize)];
  // const grid = downFrames;

  // must login before sending commands
  console.log("Logging in...");
  await twinkly.login();
  // get the device name
  console.log(`This device is called ${await twinkly.getName()}`);
  // adjust brightness
  console.log("Set device to full brightness");
  await twinkly.setBrightness(100);
  // turn off lights
  console.log("Set device to off mode");
  await twinkly.setMode("off");
  // get list of movies
  // let listOfMovies = await device.getListOfMovies();
  // console.log("List of movies:");
  // console.log(listOfMovies);

  // Get Layout
  console.log("Getting layout...");
  let layout = await twinkly.getLayout();
  // console.log("Plane normal:");
  // console.log(findPlaneNormal(layout.coordinates));
  //console.log(layout);

  // make movie
  console.log("Making movie...");
  let movie = makeMovie(layout.coordinates, grid);
  console.log(movie);

  // add movie to device (better way to do this)
  console.log("Uploading movie...");
  await twinkly.addMovie(movie);
  // set device to movie mode
  console.log("Set device to movie mode");
  await twinkly.setMode("movie");
}

function makeMovie(layout, grid) {
  const fps = 30;
  const frames = [];

  grid.forEach((g) => {
    let frame = new Frame(map2D(layout, g));
    frames.push(frame);
  });

  return new Movie({ frames, fps, name: "2D Test" });
}

function makeGrid(gridSize) {
  const grid = [];

  // Generate the effect (single frame for now)
  for (let x = 0; x <= gridSize; x++) {
    for (let y = 0; y <= gridSize; y++) {
      let color = null;
      // if x is even
      if (x % 2 === 0) {
        // do something
        color = new Led(255, 0, 0); // red
      } else {
        // do something else
        color = new Led(255, 255, 255); // white
      }
      grid.push({
        x: x / gridSize,
        y: y / gridSize,
        z: 0,
        color,
      });
    }
  }

  return grid;
}

// Nearest Neighbor interpolation
function nearestNeighbor(x, y, layout) {
  let minDistance = Infinity;
  let nearestLed = null;
  let index = 0;
  let minIndex = null;
  let color = null;
  // for led in layout, get index of led
  for (let led of layout) {
    // need the index of the led
    let distance = Math.sqrt((led.x - x) ** 2 + (led.y - y) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLed = led;
      minIndex = index;
      color = led.color;
    }
    index++;
  }
  return color;
}

// I have a 2D array of LEDs, loop through each coorddinate in the coordinate array
// and find the closest LED in the 2D array
function map2D(layout, grid) {
  let mapped = [];
  for (let coord of layout) {
    mapped.push(nearestNeighbor(coord.x, coord.y, grid));
  }
  return mapped; // array of LEDs
}

// Define an async function to fetch and parse the GIF
async function fetchAndParseGif(url) {
  try {
    // Fetch the GIF from the provided URL
    const response = await axios.get(url, { responseType: "arraybuffer" });

    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }

    // Create a Uint8Array from the fetched data
    const uint8Array = new Uint8Array(response.data);

    // Parse the GIF data using gifuct-js
    const gif = parseGIF(uint8Array);
    const width = gif.lsd.width;
    const height = gif.lsd.height;
    const frames = decompressFrames(gif, false).map((f) =>
      f.pixels.map((p, index) => {
        let x = (index % width) / width;
        let y = Math.floor(index / width) / height;
        if (p === f.transparentIndex) {
          return {
            x,
            y,
            color: new Led(0, 0, 0),
            transparent: true,
          }; // Transparent = black in LED world
        }

        let r = Math.round(f.colorTable[p][0] * 1);
        let g = Math.round(f.colorTable[p][1] * 1);
        let b = Math.round(f.colorTable[p][2] * 1);
        return {
          x,
          y,
          color: new Led(r, g, b),
          transparent: false,
        };
      })
    );

    return frames;
  } catch (error) {
    console.error("Error fetching and parsing the GIF:", error);
  }
}

//
function processPoints(points, n) {
  // Scale and bin points, then normalize
  let binnedPoints = points.map((point) => ({
    x: Math.floor(point.x * n) / n,
    y: Math.floor(point.y * n) / n,
    color: point.color,
  }));

  // Group points by their binned position
  let groupedPoints = {};
  binnedPoints.forEach((point) => {
    let key = `${point.x},${point.y}`;
    let isTransparent = point.transparent;
    if (!groupedPoints[key]) {
      groupedPoints[key] = { total: { r: 0, g: 0, b: 0 }, count: 0 };
    }
    groupedPoints[key].count++;
    if (isTransparent) {
      return; // default to black
    }
    groupedPoints[key].total.r += point.color.r;
    groupedPoints[key].total.g += point.color.g;
    groupedPoints[key].total.b += point.color.b;
  });

  // Average the colors for each binned position
  let averagedPoints = Object.keys(groupedPoints).map((key) => {
    let avg = groupedPoints[key];
    return {
      x: parseFloat(key.split(",")[0]),
      y: parseFloat(key.split(",")[1]),
      z: 0,
      color: new Led(
        avg.total.r / avg.count,
        avg.total.g / avg.count,
        avg.total.b / avg.count
      ),
    };
  });

  return averagedPoints;
}
