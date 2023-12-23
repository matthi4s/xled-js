import { Light, Frame, Movie, Led } from "../dist/index.js";

async function run() {
  // instantiate the device
  console.log("Creating device...");
  const addresses = ["192.168.4.1", "192.168.1.164"];
  const device = new Light(addresses[1]);

  let movie = makeMovie();

  // must login before sending commands
  console.log("Logging in...");
  await device.login();
  // get the device name
  console.log(`This device is called ${await device.getName()}`);
  // adjust brightness
  console.log("Set device to full brightness");
  await device.setBrightness(100);
  // turn off lights
  console.log("Set device to off mode");
  await device.setMode("off");
  // get list of movies
  let listOfMovies = await device.getListOfMovies();
  console.log(`List of movies: ${listOfMovies.length}`);
  console.log(listOfMovies.map((m) => m.name));
  // console.log(listOfMovies[0]);
  // console.log("Get playlist");
  // console.log(await device.getPlaylist());
  // return;
  console.log("Uploading movie...");

  // return;
  // add movie to device (better way to do this)
  console.log("File size", `${movie.size() / 1000} kb`);

  await device.addMovie(movie);
  // set device to movie mode
  console.log("Set device to movie mode");
  await device.setMode("movie");
  console.log("DONE!!");
}

run();

function makeMovie() {
  const nLeds = 600;
  const nFrames = 600;
  const tailLength = 15;
  const black = new Led(0, 0, 0);
  const fps = 15;
  const frames = [];
  const saturationFactor = 0.5;
  const nBufferFrames = 3 * fps;
  const step = 3;

  for (let i = 0; i < nFrames; i += step) {
    // Faster way to make a frame of LEDs of single color
    let leds = Array(nLeds).fill(black);

    for (let j = 0; j < tailLength; j++) {
      let fade = (tailLength - j) / tailLength; // fade as j increases towards tail end
      let desaturation = (saturationFactor * j) / (tailLength - 1); // desaturate as j increases
      let sparkle = Math.min(0, Math.random() - 0.3); // add some random sparkle
      if (j === 0) {
        sparkle = 1;
      }
      if (i - j !== undefined) {
        let r = 0;
        let g = 0;
        let b = 255;
        leds[i - j] = new Led(r, g, b)
          // .desaturate(1)
          .desaturate(desaturation)
          // .brighten(sparkle)
          .brighten(fade);
        // .brighten(i ** 1 / nFrames ** 1);
      }
    }
    let frame = new Frame(leds);
    frames.push(frame);
  }

  for (let i = 0; i < nBufferFrames; i++) {
    frames.push(new Frame(Array(nLeds).fill(black)));
  }

  let movie = new Movie({ frames, fps, name: "fairy_15fps" });

  return movie;
}

function reorderArray(array) {
  // Ensure the array has an even length
  if (array.length % 2 !== 0) {
    throw new Error("Array length must be even");
  }

  // Calculate the middle index
  let middleIndex = array.length / 2;

  // Split and reverse the first half of the array
  let firstHalf = array.slice(0, middleIndex).reverse();

  // Extract the second half of the array
  let secondHalf = array.slice(middleIndex);

  // Concatenate the two halves
  return firstHalf.concat(secondHalf);
}
