//import { randomBytes } from "node:crypto"; // Use dynamic import below to support browser

let generateRandomHex: (bytes: any) => any;

if (typeof window === "undefined") {
  // Node.js environment
  generateRandomHex = async (bytes: any) => {
    const cryptoModule = await import("node:crypto");
    const randomBytes = cryptoModule.randomBytes;
    return randomBytes(bytes).toString("hex");
  };
} else if (window.crypto && window.crypto.getRandomValues) {
  // Modern browser with window.crypto support
  generateRandomHex = async (bytes: any) => {
    const randomBytes = new Uint8Array(bytes);
    window.crypto.getRandomValues(randomBytes);
    const hexArray = Array.from(randomBytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    );
    return hexArray.join("");
  };
} else {
  // Fallback for older browsers
  generateRandomHex = (bytes: any) => {
    const randomBytes = new Array(bytes);
    for (let i = 0; i < bytes; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
    const hexArray = randomBytes.map((byte) =>
      byte.toString(16).padStart(2, "0")
    );
    return hexArray.join("");
  };
}

export { generateRandomHex };
