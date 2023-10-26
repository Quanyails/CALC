import { Rgba } from "./rgba";

/**
 * Use the largest contrast in RGB channel values as the line intensity.
 *
 * Conceptually derived from: http://gamedev.stackexchange.com/a/86413
 */
export const processDifference = (pixel: Rgba, neighbors: Rgba[]): Rgba => {
  // Get difference in values between the pixel and its neighbors.
  // This is a value in [0, 255].
  const maxDelta = neighbors
    .flatMap(({ r, g, b }) => [pixel.r - r, pixel.g - g, pixel.b - b])
    // Find the biggest difference in values as the magnitude.
    // Take magnitude of each channel difference.
    .map((n) => Math.abs(n))
    // Take maximal value of the computed magnitudes.
    .reduce(function (prev, current) {
      return Math.max(prev, current);
    }, 0);

  const channelValue = 255 - maxDelta;

  // Invert mapping so high difference = lower channel value.
  return new Rgba(channelValue, channelValue, channelValue, pixel.a);
};

// Modified version of reference threshold algorithm,
// which removes small contrasts and retains a nice
// range of dark values for retained edges.
//
// In contrast to the reference,
// the channels have values from 0 to 255 instead of 0 to 1.
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
