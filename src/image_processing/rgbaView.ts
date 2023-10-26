import { Rgba } from "./rgba";

/**
 * Maps an (x, y) coordinate to the index `i` on a Uint8ClampedArray
 * representing the color channels of that pixel.
 *
 * The channels can be found as follows:
 *
 * r = data[i]
 * g = data[i + 1]
 * b = data[i + 2]
 * a = data[i + 3]
 */
const getIndex = (x: number, y: number, width: number) => 4 * (y * width + x);

export class RgbaView {
  public width: number;
  public height: number;

  private data: Uint8ClampedArray;
  public constructor(imageData: ImageData) {
    this.data = imageData.data;
    this.height = imageData.height;
    this.width = imageData.width;
  }

  public get(x: number, y: number): Rgba {
    const i = getIndex(x, y, this.width);
    const channels = this.data.slice(i, i + 4);
    if (channels.length === 4) {
      return new Rgba(channels[0], channels[1], channels[2], channels[3]);
    }
    throw new Error(`Could not get coordinate (${x}, ${y}).`);
  }

  public getSubviewAt(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): RgbaView {
    const subWidth = x1 - x0 + 1;
    const subHeight = y1 - y0 + 1;
    const data = new Uint8ClampedArray(subWidth * subHeight * 4);
    for (let i = 0; i < subWidth; i++) {
      for (let j = 0; j < subHeight; j++) {
        const x = x0 + i;
        const y = y0 + j;
        const subi = getIndex(i, j, subWidth);
        const fulli = getIndex(x, y, this.width);
        for (let k = 0; k < 4; k++) {
          data[subi + k] = this.data[fulli + k];
        }
      }
    }
    const imageData = new ImageData(data, subWidth, subHeight);
    return new RgbaView(imageData);
  }
}
