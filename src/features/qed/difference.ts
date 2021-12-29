import type { Pixel } from "features/qed/matrix";
import { getPixelMatrix } from "features/qed/matrix";

// Use the largest contrast in RGB channel values as the line intensity.
// Conceptually derived from: http://gamedev.stackexchange.com/a/86413
export const drawDifference = function ({
  canvasIn,
  canvasOut,
  interval,
}: {
  canvasIn: HTMLCanvasElement;
  canvasOut: HTMLCanvasElement;
  interval: [number, number];
}) {
  const w = canvasIn.width;
  const h = canvasIn.height;
  const [channelMin, channelMax] = interval;
  const canvas2dIn = canvasIn.getContext("2d") as CanvasRenderingContext2D;
  const canvas2dOut = canvasOut.getContext("2d") as CanvasRenderingContext2D;

  const selection = canvas2dIn.getImageData(0, 0, w, h);
  const matrix = getPixelMatrix(selection);

  // Iterate through all but edge pixels.
  for (let x = 0; x < w - 1; x++) {
    for (let y = 0; y < h - 1; y++) {
      // Sample the adjacent pixels with increasing indices.
      const currentPixel = matrix.get(x, y) as Pixel;
      const downPixel = matrix.get(x + 1, y) as Pixel;
      const rightPixel = matrix.get(x, y + 1) as Pixel;

      // Get RGB values for each pixel.
      const { r: rc, g: gc, b: bc } = currentPixel;

      const { r: rd, g: gd, b: bd } = downPixel;

      const { r: rr, g: gr, b: br } = rightPixel;

      // Get difference in values between the pixel and its neighbors.
      const deltas = [rc - rd, gc - gd, bc - bd, rc - rr, gc - gr, bc - br];
      // Find the biggest difference in values as the magnitude.
      const maxDelta = deltas
        // Take magnitude of each channel difference.
        .map(function (n) {
          return Math.abs(n);
        })
        // Take maximal value of the computed magnitudes.
        .reduce(function (prev, current) {
          return Math.max(prev, current);
        }, 0);

      // Modified version of reference threshold algorithm,
      // which removes small contrasts and retains a nice
      // range of dark values for retained edges.
      //
      // In contrast to the reference,
      // the channels have values from 0 to 255 nstead of 0 to 1.
      // Hence, I used values from [0, 255] instead of [0, 1].
      //
      // In addition, I didn't see significant difference in
      // output if I removed the first/inner clamp, so I removed it.
      //
      // Otherwise, I simplified the operations before the clamp:
      // contrast = 1.5 * (2 * maxDelta - 0.8 * 255);
      // 			= 3 * maxDelta - 306;
      // 			= 3 * (maxDelta - 102);
      // And we can see that, by default,
      // maxDelta <= 102 -> black
      // maxDelta >= 187 -> white

      // But that's a bit moot with this implementation,
      // since it now uses a parameterized slider set above.
      // Unary + to convert value from string to number.
      let contrast = maxDelta;
      // clamp to [dMin, dMax].
      contrast = Math.max(channelMin, Math.min(channelMax, contrast));
      // map [dMin, dMax] -> [0, 255].
      contrast = ((contrast - channelMin) / (channelMax - channelMin)) * 255;
      // Cast to grayscale channel.
      contrast = 255 - Math.round(contrast);

      // Set RGB values to the magnitude to get a shade of gray.
      canvas2dOut.fillStyle = `rgba(${contrast},${contrast},${contrast},${currentPixel.a})`;
      canvas2dOut.fillRect(x, y, 1, 1);
    }
  }
};
