var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dgram from "dgram";
const TIMEOUT_DURATION = 5000; // 5 seconds
/**
 * Discovers Twinkly devices on the network and returns a Promise with the discovered devices.
 *
 * This function sends a UDP broadcast message to discover Twinkly devices.
 * After the discovery process is complete, it resolves the Promise with a set of the discovered devices.
 *
 * @param {number} timeout - The duration for the discovery process (in milliseconds).
 * @returns {Promise<Map<string, TwinklyDevice>>} - A Promise that resolves with a map of discovered devices.
 */
export function discoverTwinklyDevices(timeout = TIMEOUT_DURATION) {
    return new Promise((resolve, reject) => {
        const server = dgram.createSocket("udp4");
        const discoveredDevices = new Map();
        const PORT = 5555;
        const DISCOVERY_MESSAGE = Buffer.from([0x01, ...Buffer.from("discover")]);
        server.bind(() => {
            server.setBroadcast(true); // Allow broadcast
            server.send(DISCOVERY_MESSAGE, 0, DISCOVERY_MESSAGE.length, PORT, "255.255.255.255");
            // Set a timeout to stop the discovery after a certain duration
            setTimeout(() => {
                server.close();
                resolve(discoveredDevices);
            }, timeout);
        });
        server.on("message", (message) => {
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
export function handleDiscoveredDevices() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discoveredDevices = yield discoverTwinklyDevices();
            console.log(`Found ${discoveredDevices.size} device(s)`);
            discoveredDevices.forEach((device) => {
                console.log(`   ${device.deviceId} @ ${device.ip} - Status: ${device.code}`);
            });
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
}
