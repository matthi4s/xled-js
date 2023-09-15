import * as dgram from "dgram";

const TIMEOUT_DURATION = 5000; // 5 seconds

/**
 * Represents the details of a discovered Twinkly device.
 */
export interface TwinklyDevice {
  ip: string;
  deviceId: string;
  code: string;
}

/**
 * Discovers Twinkly devices on the network and returns a Promise with the discovered devices.
 *
 * This function sends a UDP broadcast message to discover Twinkly devices.
 * After the discovery process is complete, it resolves the Promise with a set of the discovered devices.
 *
 * @param {number} timeout - The duration for the discovery process (in milliseconds).
 * @returns {Promise<Map<string, TwinklyDevice>>} - A Promise that resolves with a map of discovered devices.
 */
export function discoverTwinklyDevices(
  timeout = TIMEOUT_DURATION
): Promise<Map<string, TwinklyDevice>> {
  return new Promise((resolve, reject) => {
    const server = dgram.createSocket("udp4");
    const discoveredDevices = new Map<string, TwinklyDevice>();
    const PORT = 5555;
    const DISCOVERY_MESSAGE = Buffer.from([0x01, ...Buffer.from("discover")]);

    server.bind(() => {
      server.setBroadcast(true); // Allow broadcast
      server.send(
        DISCOVERY_MESSAGE,
        0,
        DISCOVERY_MESSAGE.length,
        PORT,
        "255.255.255.255"
      );
      // Set a timeout to stop the discovery after a certain duration
      setTimeout(() => {
        server.close();
        resolve(discoveredDevices);
      }, timeout);
    });

    server.on("message", (message: Buffer) => {
      const ip = [message[3], message[2], message[1], message[0]].join(".");
      const responseString = message.toString().slice(4, 6);
      const deviceId = message.toString().slice(6, message.length - 1);
      const responseData = {
        ip,
        deviceId,
        code: responseString,
      };
      if (discoveredDevices.has(deviceId)) {
        return;
      }
      discoveredDevices.set(deviceId, responseData);
    });
  });
}

/**
 * Example to handle a set of discovered Twinkly devices
 *
 * @param device The discovered Twinkly device.
 */
export async function handleDiscoveredDevices() {
  try {
    const discoveredDevices = await discoverTwinklyDevices();
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
