import { randomBytes } from "node:crypto";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import delay from "delay";
import * as udp from "node:dgram";

import { Led } from "./led.js";
import { Frame } from "./frame.js";
import { Movie } from "./movie.js";

import {
  rgbColor,
  hsvColor,
  deviceMode,
  applicationResponseCode,
  timer,
} from "./interfaces.js";

// create error
let errNoToken = Error("No valid token");

/**
 * Represents a Twinkly device
 * @public
 *
 */
export class Light {
  ipaddr: string;
  challenge: string;
  net: AxiosInstance;
  token: AuthenticationToken | undefined;
  activeLoginCall: boolean;
  nleds: number | undefined;
  udpClient: udp.Socket;
  /**
   * Creates an instance of Light.
   *
   * @constructor
   * @param {string} ipaddr IP Address of the Twinkly device
   */
  constructor(ipaddr: string, timeout: number = 20000) {
    this.ipaddr = ipaddr;
    this.challenge = randomBytes(256).toString("hex");
    this.net = axios.create({
      baseURL: `http://${this.ipaddr}/xled/v1/`,
      timeout: timeout,
    });
    this.activeLoginCall = false;
    this.udpClient = udp.createSocket("udp4");
  }
  async autoEndLoginCall(): Promise<void> {
    await delay(1000);
    this.activeLoginCall = false;
  }
  /**
   * Sends a login request
   *
   * @returns {*}
   */
  async login(): Promise<void> {
    this.activeLoginCall = true;
    this.autoEndLoginCall();
    let res: AxiosResponse;
    try {
      res = await this.net.post("/login", {
        challenge: this.challenge,
      });
    } catch (err) {
      throw err;
    }
    this.token = new AuthenticationToken(res);
    this.net.defaults.headers["X-Auth-Token"] = this.token.getToken();
    if (res.data.code != applicationResponseCode.Ok) {
      throw Error("Login request failed");
    }
    console.log("Login request successful");
    try {
      this.verify();
    } catch (err) {
      throw err;
    }
    this.activeLoginCall = false;
  }

  /**
   * Check that we are logged in to the device
   */
  async verify(): Promise<void> {
    let res: AxiosResponse;
    if (this.token === undefined) throw errNoToken;
    try {
      res = await this.net.post("/verify", {
        "challenge-response": this.token.getChallengeResponse(),
      });
    } catch (err) {
      throw err;
    }
    if (res.data.code != applicationResponseCode.Ok) {
      throw errNoToken;
    }
  }
  /**
   * Ensure that we are logged into to the device, and if not initiate a login request
   */
  async ensureLoggedIn(): Promise<void> {
    try {
      await this.verify();
    } catch (err) {
      if (err != errNoToken) {
        throw err;
      }
      let i = 0;
      while (this.activeLoginCall && i < 5) {
        await delay(1200);
        i++;
      }
      await this.login();
    }
  }

  /**
   * Gets details about the device
   *
   * @returns {Promise<object>} Results vary, see https://xled-docs.readthedocs.io/en/latest/rest_api.html#device-details
   */
  async getDeviceDetails(): Promise<object> {
    let data = await this.sendGetRequest("/gestalt", undefined, false);
    return data;
  }
  /**
   * Turns the device off
   *
   * @returns {unknown}
   */
  async setOff(): Promise<void> {
    return this.setMode(deviceMode.off);
  }
  /**
   * Sets the state
   * @experimental
   * @param {boolean} state - Set on/off
   */
  async setState(state: boolean): Promise<void> {
    return this.setMode(state ? deviceMode.color : deviceMode.off);
  }

  /**
   * Get the name of the device
   *
   * @returns {Promise<string>} Name of device
   */
  async getName(): Promise<string> {
    let data = await this.sendGetRequest("/device_name");
    let res: string = data.name;
    return res;
  }

  /**
   * Sets the name of the device
   *
   * @param {string} name Desired device name, max 32 charachters
   * @returns {Promise<void>}
   */
  async setName(name: string): Promise<void> {
    if (name.length > 32)
      throw new Error("Name is too long - must be 32 char or less");

    await this.sendPostRequest("/led/out/brightness", {
      name: name,
    });
  }

  /**
   * Gets time when lights will turn on and off
   *
   * @returns {Promise<timer>}
   */
  async getTimer(): Promise<timer> {
    let data: timer = await this.sendGetRequest("/timer");
    return data;
  }
  /**
   * Sets the brightness level
   *
   * @param {number} value
   * @param {string} [mode="enabled"]
   * @param {string} [type="A"]
   * @returns {}
   */
  async setBrightness(
    value: number,
    mode: string = "enabled",
    type: string = "A"
  ): Promise<void> {
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
  async getBrightness(): Promise<number> {
    let data = await this.sendGetRequest("/led/out/brightness", {});
    return data.value;
  }

  /**
   * Gets the current color in HSV
   */
  async getHSVColor(): Promise<hsvColor> {
    let data = await this.sendGetRequest("/led/color", {});
    let res: hsvColor = {
      hue: data.hue,
      saturation: data.saturation,
      value: data.value,
    };
    return res;
  }

  /**
   * Gets the current color in RGB
   */
  async getRGBColor(): Promise<rgbColor> {
    let data = await this.sendGetRequest("/led/color", {});
    let res: rgbColor = { red: data.red, green: data.green, blue: data.blue };
    return res;
  }

  /**
   * Sets the color in RGB when in color mode
   *
   * @param {rgbColor} color A RGB color
   */
  async setRGBColor(color: rgbColor): Promise<void> {
    await this.sendPostRequest("/led/color", {
      red: color.red,
      green: color.green,
      blue: color.blue,
    });
  }
  async setRGBColorRealTime(color: rgbColor): Promise<void> {
    let frame = new OneColorFrame(color, await this.getNLeds());
    await this.sendRealTimeFrame(frame);
  }

  /**
   * Sets the color in HSV when in color mode
   *
   * @param {hsvColor} color A HSV color
   */
  async setHSVColor(color: hsvColor): Promise<void> {
    await this.sendPostRequest("/led/color", {
      hue: Math.round(color.hue),
      saturation: Math.round(color.saturation),
      value: Math.round(color.value),
    });
  }

  /**
   * Gets the LED operation mode
   *
   * @returns {deviceMode} mode
   */
  async getMode(): Promise<deviceMode> {
    let res = await this.sendGetRequest("/led/mode", {});
    let mode: deviceMode = (<any>deviceMode)[res.mode];
    return mode;
  }
  /**
   * Sets the LED operation mode
   *
   * @param {deviceMode} mode
   */
  async setMode(mode: deviceMode): Promise<void> {
    await this.sendPostRequest("/led/mode", { mode: mode });
  }

  /**
   * Sends a POST request to the device, appending the required tokens
   *
   * @param {string} url
   * @param {object} params
   */
  async sendPostRequest(
    url: string,
    data: any,
    contentType: string = "application/json"
  ): Promise<any> {
    if (!this.token) throw errNoToken;
    let res: AxiosResponse;
    try {
      res = await this.net.post(url, data, {
        headers: {
          "Content-Type": contentType,
        },
      });
    } catch (err) {
      throw err;
    }
    if (res.data.code != applicationResponseCode.Ok) {
      throw Error(`Mode set failed with error code ${res.data.code}`);
    }
    return res.data;
  }

  /**
   * Sends a GET request to the device, appending the required tokens
   *
   * @param {string} url
   * @param {object} params
   */
  async sendGetRequest(
    url: string,
    params?: object,
    requiresToken: boolean = true
  ): Promise<any> {
    if (!this.token && requiresToken) throw errNoToken;
    let res: AxiosResponse;
    try {
      res = await this.net.get(url, params || {});
    } catch (err) {
      throw err;
    }
    if (res.data.code != applicationResponseCode.Ok) {
      throw Error("Get Request failed");
    }
    return res.data;
  }
  async sendMovieConfig(movie: Movie) {
    let params = movie.export();
    let delay = Math.floor(1000 / params.fps);
    let number_of_leds = params.leds_per_frame;
    let number_of_frames = params.frames;

    let data = {
      delay,
      number_of_leds,
      number_of_frames,
    };
    let res = await this.sendPostRequest(
      "led/movie/config",
      data,
      "application/json"
    );
    return res;
  }
  async sendMovieToDevice(movie: Movie) {
    let res = await this.sendPostRequest(
      "led/movie/full",
      movie.toOctet(),
      "application/octet-stream"
    );
    return res;
  }
  async sendRealTimeFrame(frame: Frame) {
    let res = await this.sendPostRequest(
      "led/rt/frame",
      frame.toOctet(),
      "application/octet-stream"
    );
    return res;
  }
  async sendRealTimeFrameUDP(frame: Frame) {
    if (!this.token) throw errNoToken;

    // Generate the header
    let tokenArray = this.token.getTokenDecoded();
    let udpHeader = Buffer.alloc(tokenArray.length + 4);

    udpHeader.writeUInt8(0x03); // the version number
    udpHeader.fill(tokenArray, 1); // the actual token, 8 bytes
    udpHeader.writeUInt8(0x00, tokenArray.length + 1); // zero blanking
    udpHeader.writeUInt8(0x00, tokenArray.length + 2); // zero blanking
    udpHeader.writeUInt8(0x00, tokenArray.length + 3); // number of packets (currently only 1 as i only hav 250 leds)

    // Generate the body
    const data = Buffer.alloc(udpHeader.length + frame.getNLeds() * 3);
    data.fill(udpHeader);
    data.fill(frame.toOctet(), udpHeader.length);
    this.udpClient.send(data, 7777, this.ipaddr, (error) => {
      if (error) {
        console.warn(error);
      }
    });
  }
  async getListOfMovies() {
    let res = await this.sendGetRequest("/movies", {});
    let movies: Movie[] = res.movies.map((data: any) => {
      return new Movie(data);
    });
    return movies;
  }
  async addMovie(movie: Movie) {
    await this.sendPostRequest("/movies/new", movie.export());
  }
  async getLayout() {
    let res = await this.sendGetRequest("/led/layout/full", {});
    return res;
  }
  async getNLeds() {
    if (this.nleds) return this.nleds;
    let res: any = await this.getDeviceDetails();
    let nleds: number = res.number_of_led;
    this.nleds = nleds;
    return nleds;
  }
}

/**
 * Represents an authentication token used to login to an xled instance
 * @internal
 */
export class AuthenticationToken {
  token: string;
  expiry: Date;
  challengeResponse: string;

  /**
   * Creates an instance of AuthenticationToken.
   *
   * @constructor
   * @param {AxiosResponse} res Response from POST request
   */
  constructor(res: AxiosResponse) {
    this.token = res.data.authentication_token;
    this.expiry = new Date(
      Date.now() + res.data.authentication_token_expires_in * 1000
    );
    this.challengeResponse = res.data.challenge_response;
  }
  /**
   *
   * @returns Token as string
   */
  getToken(): string {
    return this.token;
  }

  /**
   *
   * @returns Token as buffer, for UDP use
   */
  getTokenDecoded() {
    return Buffer.from(this.getToken(), "base64");
  }

  /**
   *
   * @returns Challenge response generated by the XLED instance
   */
  getChallengeResponse(): string {
    return this.challengeResponse;
  }
}

/**
 * Easy way to create an entire frame of one color
 *
 * @export
 * @class OneColorFrame
 * @typedef {OneColorFrame}
 * @extends {Frame}
 */
export class OneColorFrame extends Frame {
  /**
   * Creates an instance of OneColorFrame.
   *
   * @constructor
   * @param {rgbColor} rgb
   * @param {number} nleds Number of LEDs to include in this frame (probably the number of LEDs in the string)
   */
  constructor(rgb: rgbColor, nleds: number) {
    let leds: Led[] = Array(nleds).fill(new Led(rgb.red, rgb.green, rgb.blue));
    super(leds);
  }
}
