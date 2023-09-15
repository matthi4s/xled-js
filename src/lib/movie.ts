import { Frame } from "./frame.js";

export class Movie {
  id: number;
  name: string;
  unique_id: string;
  descriptor_type: string;
  leds_per_frame: number;
  frames_number: number;
  fps: number;
  frameData: Frame[];
  constructor(data: any) {
    this.id = data.id || 0;
    this.name = data.name || "";
    this.unique_id = data.unique_id || "";
    this.descriptor_type = data.descriptor_type || "";
    this.leds_per_frame = data.leds_per_frame || 0;
    this.frames_number = data.frames_number || 0;
    this.fps = data.fps || 0;
    this.frameData = data.frames || null;
    if (this.frameData) {
      this.frames_number = this.frameData.length;
      this.leds_per_frame = this.frameData[0].getNLeds();
    }
  }
  export() {
    return {
      id: this.id,
      name: this.name,
      unique_id: this.unique_id,
      descriptor_type: this.descriptor_type,
      leds_per_frame: this.leds_per_frame,
      frames: this.frames_number,
      fps: this.fps,
    };
  }
  toOctet() {
    const frames = this.frameData;
    this.frames_number = frames.length;
    this.leds_per_frame = frames[0].getNLeds();
    const output = new Uint8Array(this.frames_number * this.leds_per_frame * 3);
    frames.forEach((frame, index) => {
      if (frame.getNLeds() != this.leds_per_frame)
        throw new Error("Frames must all be the same length");

      // convert to octet
      let octet = frame.toOctet();

      // add octet to output
      let offset = index * this.leds_per_frame * 3;
      output.set(octet, offset);
    });
    // this.frameData = output;
    return output.buffer;
  }
}
