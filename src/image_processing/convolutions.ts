import { Rgba } from "./rgba";

/**
 * Performs a mathematical convolution on 2D image data.
 *
 * Assumes both the mask and matrixes are square 2D arrays.
 */
export const convolute = (mask: number[][], matrix: (Rgba | undefined)[][]) => {
  const convoluted = {
    r: 0, // eslint-disable-line sort-keys
    g: 0, // eslint-disable-line sort-keys
    b: 0, // eslint-disable-line sort-keys
    a: 0, // eslint-disable-line sort-keys
  };

  // Apply convolution mask.
  const size = mask.length;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const weight = mask[x][y];
      const sourcePixel = matrix[x][y];
      if (sourcePixel) {
        convoluted.r += weight * sourcePixel.r;
        convoluted.g += weight * sourcePixel.g;
        convoluted.b += weight * sourcePixel.b;
        convoluted.a += weight * sourcePixel.a;
      }
    }
  }
  return new Rgba(convoluted.r, convoluted.g, convoluted.b, convoluted.a);
};
