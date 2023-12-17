//import { randomBytes } from "node:crypto"; // Use dynamic import below to support browser
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let generateRandomHex;
if (typeof window === "undefined") {
    // Node.js environment
    generateRandomHex = (bytes) => __awaiter(void 0, void 0, void 0, function* () {
        const cryptoModule = yield import("node:crypto");
        const randomBytes = cryptoModule.randomBytes;
        return randomBytes(bytes).toString("hex");
    });
}
else if (window.crypto && window.crypto.getRandomValues) {
    // Modern browser with window.crypto support
    generateRandomHex = (bytes) => __awaiter(void 0, void 0, void 0, function* () {
        const randomBytes = new Uint8Array(bytes);
        window.crypto.getRandomValues(randomBytes);
        const hexArray = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0"));
        return hexArray.join("");
    });
}
else {
    // Fallback for older browsers
    generateRandomHex = (bytes) => {
        const randomBytes = new Array(bytes);
        for (let i = 0; i < bytes; i++) {
            randomBytes[i] = Math.floor(Math.random() * 256);
        }
        const hexArray = randomBytes.map((byte) => byte.toString(16).padStart(2, "0"));
        return hexArray.join("");
    };
}
export { generateRandomHex };
