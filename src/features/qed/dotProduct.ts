// Use the most negative dot product of RGB channel values/vectors.
// We interpret RGB channels as XYZ vector magnitudes, and we use
// the normalized dot product between these vectors to determine contrast.
import type { Pixel } from "features/qed/matrix";
import { getPixelMatrix } from "features/qed/matrix";

export const drawDotProduct = function ({
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
  const [magnitudeMin, magnitudeMax] = interval;
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

      // This sequence of steps can be optimized by being pre-calculated.
      // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

      // Interpret RGB values as XYZ coordinates in vector.
      const vc = [currentPixel.r, currentPixel.g, currentPixel.b];
      const vd = [downPixel.r, downPixel.g, downPixel.b];
      const vr = [rightPixel.r, rightPixel.g, rightPixel.b];

      // Convert from [0, 255] to [-128, 127].
      for (let i = 0; i < 3; i++) {
        vc[i] -= 128;
        vd[i] -= 128;
        vr[i] -= 128;
      }
      // Normalize vectors.
      const normC = Math.hypot(vc[0], vc[1], vc[2]);
      const normD = Math.hypot(vd[0], vd[1], vd[2]);
      const normR = Math.hypot(vr[0], vr[1], vr[2]);
      for (let i = 0; i < 3; i++) {
        vc[i] /= normC;
        vd[i] /= normD;
        vr[i] /= normR;
      }

      // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      // Get dot product of current vector with neighbors'.
      // As we use normalized values, the dot product will be in [-1, 1].
      // Clamp values to [-1, 1].
      let dotD = vc[0] * vd[0] + vc[1] * vd[1] + vc[2] * vd[2];
      dotD = Math.max(-1, Math.min(1, dotD));
      let dotR = vc[0] * vr[0] + vc[1] * vr[1] + vc[2] * vr[2];
      dotR = Math.max(-1, Math.min(1, dotR));
      const isZeroD = isNaN(dotD); // Was RGB (0, 0, 0)?
      const isZeroR = isNaN(dotR); // Was RGB (0, 0, 0)?
      let dotMin: number;
      if (isZeroD && isZeroR) {
        dotMin = 1;
      } // max in [-1, 1].
      else if (isZeroD && !isZeroR) {
        dotMin = dotR;
      } else if (!isZeroD && isZeroR) {
        dotMin = dotD;
      } /* !isZeroD && !isZeroR */ else {
        dotMin = Math.min(dotD, dotR);
      }

      // Interpret dot product as cosine value on unit circle.
      // Convert from cosine ratio to radians and normalize.
      let contrast = Math.acos(dotMin) / Math.PI; // [1, 0]

      // Compute output color according to parameters.
      // clamp to [dMin, dMax].
      contrast = Math.max(magnitudeMin, Math.min(magnitudeMax, contrast));
      // map [dMin, dMax] -> [0, 255].
      contrast =
        ((contrast - magnitudeMin) / (magnitudeMax - magnitudeMin)) * 255;
      // Cast to grayscale channel.
      contrast = 255 - Math.round(contrast);

      // Set RGB values to the magnitude to get a shade of gray.
      canvas2dOut.fillStyle = `rgba(${contrast},${contrast},${contrast},${currentPixel.a})`;
      canvas2dOut.fillRect(x, y, 1, 1);
    }
  }
};
