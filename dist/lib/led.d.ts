/**
 * A RGB(W) led
 *
 * @export
 * @class Led
 * @typedef {Led}
 */
export declare class Led {
    red: number;
    green: number;
    blue: number;
    white: number | null;
    /**
     * Creates an instance of the Led class.
     *
     * @param {number} red - Red value (0-255).
     * @param {number} green - Green value (0-255).
     * @param {number} blue - Blue value (0-255).
     * @param {number} white - White value (0-255). (Only for RGBW LEDs)
     */
    constructor(red: number, green: number, blue: number, white?: number | null);
    /**
     * Converts the RGB(W) values to a Uint8Array.
     *
     * @param {boolean} rgbw - Whether the output should be RGBW or not.
     * @returns {Uint8Array} The RGB(W) values in a Uint8Array format.
     */
    toOctet(rgbw?: boolean): Uint8Array;
    /**
     * Checks if the LED color is turned on (non-zero).
     *
     * @returns {boolean} True if the LED is on, false otherwise.
     */
    isOn(): boolean;
    /**
     * Sets all RGB values to 0, turning the LED off.
     *
     * @returns {Led} The updated Led instance.
     */
    turnOff(): this;
    /**
     * Sets the RGB(W) values to the specified values.
     *
     * @param {number} red - New red value.
     * @param {number} green - New green value.
     * @param {number} blue - New blue value.
     * @param {number} white - New white value. (Only for RGBW LEDs)
     * @returns {Led} The updated Led instance.
     */
    setColor(red: number, green: number, blue: number, white?: number | null): this;
    /**
     * Inverts the RGB values.
     *
     * @returns {Led} The updated Led instance.
     */
    invertColor(): this;
    /**
     * Returns a string representation of the RGB values.
     *
     * @returns {string} String in the format 'rgb(r, g, b)'.
     */
    toString(): string;
    /**
     * Brightens the LED color by a specified factor.
     *
     * @param {number} factor - Brightness factor (e.g., 1.2 is 20% brighter).
     * @returns {Led} The updated Led instance.
     */
    brighten(factor: number): this;
    /**
     * Dims the LED color by a specified factor.
     *
     * @param {number} factor - Dim factor (e.g., 0.8 is 20% dimmer).
     * @returns {Led} The updated Led instance.
     */
    dim(factor: number): this;
    /**
     * Saturates the LED color by a specified factor.
     *
     * @param {number} factor - Saturation factor (greater than 1 to saturate, between 0 and 1 to desaturate).
     * @returns {Led} The updated Led instance.
     */
    saturate(factor: number): this;
    /**
     * Desaturates the LED color by a specified factor.
     *
     * @param {number} factor - Desaturation factor (1 for full grayscale, 0 for no change).
     * @returns {Led} The updated Led instance.
     */
    desaturate(factor: number): this;
}
