"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceMode = exports.AuthenticationToken = exports.Light = void 0;
// imports
const node_crypto_1 = require("node:crypto");
const axios_1 = __importDefault(require("axios"));
const delay_1 = __importDefault(require("delay"));
// create error
let errNoToken = Error("No valid token");
/**
 * Represents a Twinkly device
 * @public
 *
 */
class Light {
    /**
     * Creates an instance of Light.
     *
     * @constructor
     * @param {string} ipaddr IP Address of the Twinkly device
     */
    constructor(ipaddr) {
        this.ipaddr = ipaddr;
        this.challenge = (0, node_crypto_1.randomBytes)(256).toString("hex");
        this.net = axios_1.default.create({
            baseURL: `http://${this.ipaddr}/xled/v1/`,
            timeout: 1000,
        });
        this.activeLoginCall = false;
    }
    async autoEndLoginCall() {
        await (0, delay_1.default)(1000);
        this.activeLoginCall = false;
    }
    /**
     * Sends a login request
     *
     * @returns {*}
     */
    async login() {
        this.activeLoginCall = true;
        this.autoEndLoginCall();
        let res;
        try {
            res = await this.net.post("/login", {
                challenge: this.challenge,
            });
        }
        catch (err) {
            throw err;
        }
        this.token = new AuthenticationToken(res);
        this.net.defaults.headers["X-Auth-Token"] = this.token.getToken();
        if (res.data.code != 1000) {
            throw Error("Login request failed");
        }
        console.log("Login request successful");
        try {
            this.verify();
        }
        catch (err) {
            throw err;
        }
        this.activeLoginCall = false;
    }
    /**
     * Check that we are logged in to the device
     */
    async verify() {
        let res;
        if (this.token === undefined)
            throw errNoToken;
        try {
            res = await this.net.post("/verify", {
                "challenge-response": this.token.getChallengeResponse(),
            });
        }
        catch (err) {
            throw err;
        }
        if (res.data.code != 1000) {
            throw errNoToken;
        }
    }
    /**
     * Ensure that we are logged into to the device, and if not initiate a login request
     */
    async ensureLoggedIn() {
        try {
            await this.verify();
        }
        catch (err) {
            if (err != errNoToken) {
                throw err;
            }
            let i = 0;
            while (this.activeLoginCall && i < 5) {
                await (0, delay_1.default)(1200);
                i++;
            }
            await this.login();
        }
    }
    /**
     * Turns the device off
     *
     * @returns {unknown}
     */
    async setOff() {
        return this.setMode(deviceMode.off);
    }
    /**
     * Sets the state
     * @experimental
     * @param {boolean} state - Set on/off
     */
    async setState(state) {
        return this.setMode(state ? deviceMode.color : deviceMode.off);
    }
    /**
     * Get the name of the device
     *
     * @returns {Promise<string>} Name of device
     */
    async getName() {
        let data = await this.sendGetRequest("/device_name", {});
        let res = data.name;
        return res;
    }
    /**
     * Sets the name of the device
     *
     * @param {string} name Desired device name, max 32 charachters
     * @returns {Promise<void>}
     */
    async setName(name) {
        if (name.length > 32)
            throw new Error("Name is too long - must be 32 char or less");
        await this.sendPostRequest("/led/out/brightness", {
            name: name,
        });
    }
    /**
     * Sets the brightness level
     *
     * @param {number} value
     * @param {string} [mode="enabled"]
     * @param {string} [type="A"]
     * @returns {}
     */
    async setBrightness(value, mode = "enabled", type = "A") {
        await this.sendPostRequest("/led/out/brightness", {
            mode: mode,
            type: type,
            value: value,
        });
    }
    /**
     * Gets the current brightness level
     *
     * @returns {number} Current brightness in range 0..100
     */
    async getBrightness() {
        let data = await this.sendGetRequest("/led/out/brightness", {});
        return data.value;
    }
    /**
     * Gets the current colour in HSV
     */
    async getHSVColour() {
        let data = await this.sendGetRequest("/led/color", {});
        let res = {
            hue: data.hue,
            saturation: data.saturation,
            value: data.value,
        };
        return res;
    }
    /**
     * Gets the current colour in RGB
     */
    async getRGBColour() {
        let data = await this.sendGetRequest("/led/color", {});
        let res = { red: data.red, green: data.green, blue: data.blue };
        return res;
    }
    /**
     * Sets the colour in RGB when in colour mode
     *
     * @param {rgbColour} colour A RGB colour
     */
    async setRGBColour(colour) {
        await this.sendPostRequest("/led/color", {
            red: colour.red,
            green: colour.green,
            blue: colour.blue,
        });
    }
    /**
     * Sets the colour in HSV when in colour mode
     *
     * @param {hsvColour} colour A HSV colour
     */
    async setHSVColour(colour) {
        await this.sendPostRequest("/led/color", {
            hue: Math.round(colour.hue),
            saturation: Math.round(colour.saturation),
            value: Math.round(colour.value),
        });
    }
    /**
     * Gets the LED operation mode
     *
     * @returns {deviceMode} mode
     */
    async getMode() {
        let res = await this.sendGetRequest("/led/mode", {});
        let mode = deviceMode[res.mode];
        return mode;
    }
    /**
     * Sets the LED operation mode
     *
     * @param {deviceMode} mode
     */
    async setMode(mode) {
        await this.sendPostRequest("/led/mode", { mode: mode });
    }
    /**
     * Sends a POST request to the device, appending the required tokens
     *
     * @param {string} url
     * @param {object} params
     */
    async sendPostRequest(url, params) {
        if (!this.token)
            throw errNoToken;
        let res;
        try {
            res = await this.net.post(url, params);
        }
        catch (err) {
            throw err;
        }
        if (res.data.code != 1000) {
            throw Error("Mode set failed");
        }
        return res.data;
    }
    /**
     * Sends a GET request to the device, appending the required tokens
     *
     * @param {string} url
     * @param {object} params
     */
    async sendGetRequest(url, params) {
        if (!this.token)
            throw errNoToken;
        let res;
        try {
            res = await this.net.get(url, params);
        }
        catch (err) {
            throw err;
        }
        if (res.data.code != 1000) {
            throw Error("Get Request failed");
        }
        return res.data;
    }
}
exports.Light = Light;
/**
 * Represents an authentication token used to login to an xled instance
 * @internal
 */
class AuthenticationToken {
    /**
     * Creates an instance of AuthenticationToken.
     *
     * @constructor
     * @param {AxiosResponse} res Response from POST request
     */
    constructor(res) {
        this.token = res.data.authentication_token;
        this.expiry = new Date(Date.now() + res.data.authentication_token_expires_in * 1000);
        this.challengeResponse = res.data.challenge_response;
    }
    /**
     *
     * @returns Token as string
     */
    getToken() {
        return this.token;
    }
    /**
     *
     * @returns Challenge response generated by the XLED instance
     */
    getChallengeResponse() {
        return this.challengeResponse;
    }
}
exports.AuthenticationToken = AuthenticationToken;
var deviceMode;
(function (deviceMode) {
    deviceMode["demo"] = "demo";
    deviceMode["color"] = "color";
    deviceMode["off"] = "off";
    deviceMode["effect"] = "effect";
    deviceMode["movie"] = "movie";
    deviceMode["playlist"] = "playlist";
    deviceMode["rt"] = "rt";
})(deviceMode = exports.deviceMode || (exports.deviceMode = {}));
