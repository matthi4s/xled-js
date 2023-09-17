import { Light } from "../dist/index.js";

const device = new Light("192.168.1.164");

async function run() {
  await device.login();
  await device.setMode("off");
  let config = await device.getMqttConfig();
  console.log(config);
}

run();
