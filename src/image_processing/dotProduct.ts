import { Rgba } from "./rgba";

// Interpret RGB values as XYZ coordinates in vector space.
const toNormalizedVector = ({ r, g, b }: Rgba): [number, number, number] => {
  // Convert from [0, 255] to [-128, 127].
  const balanced = [r - 128, g - 128, b - 128] as const;

  // Normalize vector length.
  const norm = Math.hypot(...balanced);

  return balanced.map((c) => c / norm) as [number, number, number];
};

export const processDotProduct = (pixel: Rgba, neighbors: Rgba[]) => {
  // This sequence of steps can be optimized by being pre-calculated.
  // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

  const pixelVector = toNormalizedVector(pixel);
  const neighborVectors = neighbors.map((n) => toNormalizedVector(n));

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  // Get dot product of current vector with neighbors'.
  // As we use normalized values, the dot product will be in [-1, 1].
  const [or, og, ob] = pixelVector;
  const minDotProduct = neighborVectors
    .map(([r, g, b]) => {
      // This number can end up outside [-1, 1] due to floating-point math.
      const dp = r * or + g * og + b * ob;
      // Clamp values in case value ends up outside [-1, 1].
      return Math.max(-1, Math.min(1, dp));
    })
    .reduce((dp1, dp2) => {
      const isFirstZero = isNaN(dp1); // Was RGB (0, 0, 0)?
      const isSecondZero = isNaN(dp2); // Was RGB (0, 0, 0)?
      if (isFirstZero && isSecondZero) {
        return 1;
      } // max in [-1, 1].
      else if (isFirstZero && !isSecondZero) {
        return dp2;
      } else if (!isFirstZero && isSecondZero) {
        return dp1;
      } /* !isZeroD && !isZeroR */ else {
        return Math.min(dp1, dp2);
      }
    });

  // Interpret dot product as cosine value on unit circle.
  // Convert from cosine ratio to radians and normalize.
  const contrast = Math.acos(minDotProduct) / Math.PI; // [1, 0]
  // Cast to grayscale channel.
  const channelValue = Math.round((1 - contrast) * 255);

  return new Rgba(channelValue, channelValue, channelValue, pixel.a);
};
