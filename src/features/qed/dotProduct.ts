// Use the most negative dot product of RGB channel values/vectors.
// We interpret RGB channels as XYZ vector magnitudes, and we use
// the normalized dot product between these vectors to determine contrast.

import { processDotProduct } from "../../image_processing/dotProduct";
import { Rgba } from "../../image_processing/rgba";
import { RgbaView } from "../../image_processing/rgbaView";
import { LinearScale } from "../../util/linearScale";

export const drawDotProduct = ({
  canvasIn,
  canvasOut,
  interval,
}: {
  canvasIn: HTMLCanvasElement;
  canvasOut: HTMLCanvasElement;
  interval: [number, number];
}) => {
  const w = canvasIn.width;
  const h = canvasIn.height;
  const canvas2dIn = canvasIn.getContext("2d") as CanvasRenderingContext2D;
  const canvas2dOut = canvasOut.getContext("2d") as CanvasRenderingContext2D;

  const contrastScale = new LinearScale({
    clamp: true,
    domain: [interval[0] * 255, interval[1] * 255],
    range: [0, 255],
  });
  const selection = canvas2dIn.getImageData(0, 0, w, h);
  const rgbaView = new RgbaView(selection);

  // Iterate through all but edge pixels.
  for (let x = 0; x < w - 1; x++) {
    for (let y = 0; y < h - 1; y++) {
      // Sample the adjacent pixels with increasing indices.
      const currentPixel = rgbaView.get(x, y);
      const downPixel = rgbaView.get(x + 1, y);
      const rightPixel = rgbaView.get(x, y + 1);

      const processed = processDotProduct(currentPixel, [
        downPixel,
        rightPixel,
      ]);
      const rescaled = new Rgba(
        Math.round(contrastScale.get(processed.r)),
        Math.round(contrastScale.get(processed.g)),
        Math.round(contrastScale.get(processed.b)),
        processed.a
      );

      // Set RGB values to the magnitude to get a shade of gray.
      canvas2dOut.fillStyle = rescaled.toColor();
      canvas2dOut.fillRect(x, y, 1, 1);
    }
  }
};
