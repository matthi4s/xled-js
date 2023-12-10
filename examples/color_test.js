import { Light, Frame, Movie, Led } from "../dist/index.js";

async function run() {
  const red = new Led(255, 0, 0);
  const green = new Led(0, 255, 0);
  const blue = new Led(0, 0, 255);
  const yellow = new Led(255, 255, 0);
  const cyan = new Led(0, 255, 255);
  const magenta = new Led(255, 0, 255);
  const white = new Led(255, 255, 255);
  const purple = new Led(255, 0, 255);
  const key = [red, green, blue, yellow, cyan, magenta, white, purple];

  const nLeds = 600;
  let leds = makeColorSequence(key, nLeds);

  let frames = leds.map((led) => {
    return new Frame(led);
  });

  let movie = new Movie({
    frames: frames,
    fps: 1,
    loop_type: 1,
    name: "color_test",
  });
  console.log(movie);

  console.log("Creating device...");
  const device = new Light("192.168.1.164");

  // must login before sending commands
  console.log("Logging in...");
  await device.login();
  // turn off lights
  console.log("Set device to off mode");
  await device.setMode("off");
  // add movie to device (better way to do this)
  console.log("Upload Movie");
  await device.addMovie(movie);
  // set device to movie mode
  console.log("Set device to movie mode");
  await device.setMode("movie");
}

run();

/**
 * Generate color sequence set
 * @param {Array} key of colors (ie ['red','green','blue'])
 * @param {Number} nPts Total number of sequences in set
 * @returns {Array} Returns array of unique permutations of color sequences
 */
function makeColorSequence(key, nPts) {
  const nSegments = key.length;
  const segmentLength = Math.floor(nPts / nSegments);
  const remainder = nPts % nSegments;

  let base = [];
  // for each value in key
  key.forEach((color, i) => {
    // create an array of size segmentLength
    let segment = new Array(segmentLength).fill(color);
    // concat with base array
    base = base.concat(segment);
  });

  // repeat
  const output = [];
  for (let i = 0; i < 20; i++) {
    output.push(base);
  }

  return output; // return one frame for now
}
