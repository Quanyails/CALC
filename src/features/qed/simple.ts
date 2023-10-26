// Simple edge detection: check neighboring pixels for different values.

import { RgbaView } from "../../image_processing/rgbaView";

export const drawSimple = (imageData: ImageData): ImageData => {
  const w = imageData.width;
  const h = imageData.height;
  const rgbaView = new RgbaView(imageData);

  const outputData = new Uint8ClampedArray(w * h * 4);

  // Iterate through all but edge pixels.
  for (let x = 0; x < w - 1; x++) {
    for (let y = 0; y < h - 1; y++) {
      const currentPixel = rgbaView.get(x, y);
      const downPixel = rgbaView.get(x + 1, y);
      const rightPixel = rgbaView.get(x, y + 1);

      const datai = 4 * (y * w + x);

      // Pixels match, no edge.
      if (
        currentPixel.r === downPixel.r &&
        currentPixel.g === downPixel.g &&
        currentPixel.b === downPixel.b &&
        currentPixel.a === downPixel.a &&
        //
        currentPixel.r === rightPixel.r &&
        currentPixel.g === rightPixel.g &&
        currentPixel.b === rightPixel.b &&
        currentPixel.a === rightPixel.a
      ) {
        // white
        outputData[datai] = 255;
        outputData[datai + 1] = 255;
        outputData[datai + 2] = 255;
        outputData[datai + 3] = 255;
      }
      // Pixels don't match, edge.
      else {
        // black
        outputData[datai] = 0;
        outputData[datai + 1] = 0;
        outputData[datai + 2] = 0;
        outputData[datai + 3] = 255;
      }
    }
  }
  return new ImageData(outputData, w, h);
};
