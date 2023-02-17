# xled-js

A NodeJS/typescript library similar to [scrool/XLED](https://github.com/scrool/xled) to control [Twinkly](https://twinkly.com/) LED lights.

## API Docs

- The api docs can be found at https://aeroniemi.github.com/xled-js

## Installation

### Via npm

`npm install xled`

### From source

- `git clone https://github.com/aeroniemi/xled-js.git`
- `cd ./xled-js/`
- `npm install`

## Usage

```ts
import { Light, rgbColour } from "xled";

async function run() {
	// instantiate the device
	device = new Light("192.168.0.22");
	// get the device name
	console.log(`This device is called ${await device.getName()}`);

	// set device to red, full brightness
	await device.setBrightness(100);

	let red: rgbColour = {
		red: 255,
		green: 0,
		blue: 0,
	};
	await device.setMode("color");
	await device.setRGBColour(red);
}
run();
```
