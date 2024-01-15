# xled-js

A NodeJS/typescript library similar to [scrool/XLED](https://github.com/scrool/xled) to control [Twinkly](https://twinkly.com/) LED lights.

A fork of the excellent work done by Alexander Beavil https://github.com/aeroniemi

This version includes partial refactoring for easier maintenance, a few new functions, API calls, and a new discovery service.  This is technically a breaking change as all methods, interfaces, enums and variables that previously included the UK spelling of "colour" have been replaced with the US spelling "color".  This is a preference and obviously not necessary, but I'm from the US and I like it that way.

## API Docs

The api documentation can be found at https://foomoon.github.io/xled-js/

The docs can also be generated by running:

`npm run docs`

## Installation

### Via npm

`npm i xled-js`

### From source

- `git clone https://github.com/foomoon/xled-js.git`
- `cd ./xled-js/`
- `npm install`
- `npm run build`

## Usage

### Basic
Make sure to set the IP address to your twinkly device.  You may use the discovery service to find a device on your network.
```ts
import { Light, rgbColor } from "xled-js";

async function run() {
	// instantiate the device
	let device = new Light("192.168.1.164");
	// get the device name
	console.log(`This device is called ${await device.getName()}`);

	// set device to red, full brightness
	await device.setBrightness(100);

	let red: rgbColor = {
		red: 255,
		green: 0,
		blue: 0,
	};
	await device.setMode("color");
	await device.setRGBColor(red);
}
run();
```

If you are using an RGBW device, you should enable RGBW mode if you want to send frames or movies.
```ts
let device = new Light("192.168.1.164").enableRGBW();
```

### Discovery Service
Note: this service does not work in browsers and must be run on a node.js server
```ts
import { discoverTwinklyDevices } from "xled-js";

const customTimeout = 3000;

console.log(`Starting discovery (${customTimeout / 1000} second timeout)...`);

async function customDiscovery() {
  try {
    const discoveredDevices = await discoverTwinklyDevices(customTimeout);
    console.log(`Found ${discoveredDevices.size} device(s)`);
    discoveredDevices.forEach((device) => {
      console.log(
        `   ${device.deviceId} @ ${device.ip} - Status: ${device.code}`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

customDiscovery();
```

### Upload Movie and Play
Create a simple animation, upload to device and begin playing.  Note that large animations may take 10-30 seconds to upload and thus the optional timeout argument may need to be specified to prevent premature timeout.  The default is 20000 ms. 
```ts
import { Light, Frame, Movie, Led } from "xled-js";

async function run() {

  const deviceIp = "192.168.1.164";
  const timeout = 30000; // ms

  // instantiate the device
  const device = new Light(deviceIp, timeout);

  let movie = makeMovie();

  // must login before sending commands
  console.log("Logging in...");
  await device.login();
  // turn off lights
  console.log("Set device to off mode");
  await device.setMode("off");
  // get list of movies
  let listOfMovies = await device.getListOfMovies();
  console.log(listOfMovies);
  // add movie to device (better way to do this)
  await device.addMovie(movie);
  // set device to movie mode
  console.log("Set device to movie mode");
  await device.setMode("movie");
}

run();
```

### Helper function to test Movie
```ts
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

```
