/**
 * A frame of LEDs, used when you wish to set color pixel by pixel
 *
 * @export
 * @class Frame
 * @typedef {Frame}
 */
export class Frame {
    /**
     * Creates an instance of Frame.
     *
     * @constructor
     * @param {Led[]} leds Array of Led, of same length as nleds
     */
    constructor(leds) {
        this.leds = leds;
    }
    /**
     * Output the frame as a Uint8Array of bytes
     *
     * @param {boolean} rgbw Whether the output should be RGBW or not.
     * @returns {Uint8Array}
     */
    toOctet(rgbw = false) {
        let ledLength = rgbw ? 4 : 3;
        let output = new Uint8Array(this.leds.length * ledLength);
        let offset = 0;
        this.leds.forEach((led) => {
            output.set(led.toOctet(rgbw), offset);
            offset += ledLength;
        });
        return output;
    }
    /**
     * Get the number of LEDs in this frame
     *
     * @returns {number}
     */
    getNLeds() {
        return this.leds.length;
    }
}
