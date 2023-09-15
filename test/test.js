import {
  Light,
  Frame,
  Movie,
  Led,
  // OneColorFrame,
  // deviceMode,
  // rgbColor,
} from "../dist/index.js";

async function run() {
  // instantiate the device
  const device = new Light("192.168.1.164");

  await device.login();

  // get the device name
  console.log(`This device is called ${await device.getName()}`);

  // set device to red, full brightness
  await device.setBrightness(100);

  let movie = makeMovie();

  // Todo: make setMovie config accept movie object vice params

  await device.setMode("off");

  console.log("Send movie to device");
  await device.sendMovieToDevice(movie);
  console.log("Send movie config");
  await device.sendMovieConfig(movie);
  console.log("Set device to movie mode");
  await device.setMode("movie");

  // let frame = makeFrame();
  // await device.setMode("rt");
  // await device.sendRealTimeFrame(frame);
}

run();

function makeFrame() {
  const nLeds = 100;
  let leds = [];
  for (let i = 0; i < nLeds; i++) {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    leds[i] = new Led(r, g, b);
  }
  let frame = new Frame(leds);
  return frame;
}

function makeMovie() {
  const nLeds = 600;
  const nFrames = 600;
  let tailLength = 15;

  let frames = [];

  for (let i = 0; i < nFrames; i++) {
    let leds = [];
    for (let j = 0; j < nLeds; j++) {
      leds[j] = new Led(0, 0, 0); // Set all leds to black first
    }
    for (let j = 0; j < tailLength; j++) {
      let fade = (tailLength - j) / tailLength;
      let desaturation = (0.1 * j) / (tailLength - 1);
      let sparkle = Math.min(0, Math.random() - 0.3);
      if (j === 0) {
        desaturation = 0;
        sparkle = 1;
      }
      if (i - j !== undefined) {
        let r = 0; //Math.floor(255 * fade * saturation * sparkle);
        let g = 0; //Math.floor(255 * fade * saturation * sparkle);
        let b = 255; //Math.floor(255 * fade * sparkle);
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
  // for (let i = 0; i < 100; i++) {
  //   let leds = [];
  //   for (let j = 0; j < nLeds; j++) {
  //     leds[j] = new Led(0, 0, 0); // Set all leds to black first
  //   }
  //   let frame = new Frame(leds);
  //   frames.push(frame);
  // }
  let movie = new Movie({ frames: frames, fps: 30 });

  return movie;
}
