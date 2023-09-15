import { Light, Frame, Movie, Led } from "../dist/index.js";

async function run() {
  // instantiate the device
  console.log("Creating device...");
  const device = new Light("192.168.1.164");

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
  // upload movie to device
  console.log("Send movie to device");
  await device.sendMovieToDevice(movie);
  // set movie config
  console.log("Send movie config");
  await device.sendMovieConfig(movie);
  // set device to movie mode
  console.log("Set device to movie mode");
  await device.setMode("movie");
}

run();

function makeMovie() {
  const nLeds = 600;
  const nFrames = 600;
  let tailLength = 15;
  let black = new Led(0, 0, 0);

  let frames = [];

  for (let i = 0; i < nFrames; i++) {
    // Faster way to make a frame of LEDs of single color
    let leds = Array(nLeds).fill(black);

    for (let j = 0; j < tailLength; j++) {
      let fade = (tailLength - j) / tailLength;
      let desaturation = (0.1 * j) / (tailLength - 1);
      let sparkle = Math.min(0, Math.random() - 0.3);
      if (j === 0) {
        sparkle = 1;
      }
      if (i - j !== undefined) {
        let r = 0;
        let g = 0;
        let b = 255;
        leds[i - j] = new Led(r, g, b)
          .desaturate(desaturation)
          .brighten(sparkle)
          .brighten(fade)
          .brighten(i ** 1 / nFrames ** 1);
      }
    }
    let frame = new Frame(leds);
    frames.push(frame);
  }

  let movie = new Movie({ frames: frames, fps: 30 });

  return movie;
}
