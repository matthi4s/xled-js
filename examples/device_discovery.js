import { discoverTwinklyDevices } from "../dist/discovery.js";

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
