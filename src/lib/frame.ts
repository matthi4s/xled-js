import { Led } from "./led.js";

/**
 * A frame of LEDs, used when you wish to set color pixel by pixel
 *
 * @export
 * @class Frame
 * @typedef {Frame}
 */
export class Frame {
  leds: Led[];

  /**
   * Creates an instance of Frame.
   *
   * @constructor
   * @param {Led[]} leds Array of Led, of same length as nleds
   */
  constructor(leds: Led[]) {
    this.leds = leds;
  }

  /**
   * Output the frame as a Uint8Array of bytes
   *
   * @returns {Uint8Array}
   */
  toOctet(): Uint8Array {
    let buffer = new ArrayBuffer(this.leds.length * 3);
    let output = new Uint8Array(buffer);
    let offset = 0;
    this.leds.forEach((led) => {
      output.set(led.toOctet(), offset);
      offset += 3;
    });
    return output;
  }

  /**
   * Get the number of LEDs in this frame
   *
   * @returns {number}
   */
  getNLeds(): number {
    return this.leds.length;
  }
}
