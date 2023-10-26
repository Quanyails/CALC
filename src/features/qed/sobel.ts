import { convolute } from "../../image_processing/convolutions";
import type { Rgba } from "../../image_processing/rgba";
import { RgbaView } from "../../image_processing/rgbaView";

const xMask = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

const yMask = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

const getMagnitude = (xChannel: number, yChannel: number) => {
  let channel = Math.hypot(xChannel, yChannel);
  // Clamp value to [0, 255]
  channel = Math.max(0, Math.min(255, channel));
  // Set value to nearest uint8 integer.
  channel = Math.round(channel);
  return channel;
};

// Sobel edge filter: use a convolution mask to approximate sharp gradients.
export const drawSobel = (imageData: ImageData): ImageData => {
  const w = imageData.width;
  const h = imageData.height;
  const rgbaView = new RgbaView(imageData);

  const outputData = new Uint8ClampedArray(w * h * 4);

  // Convolute all pixels not on boundary.
  for (let x = 1; x < w - 1; x++) {
    for (let y = 1; y < h - 1; y++) {
      const subview = rgbaView.getSubviewAt(x - 1, y - 1, x + 1, y + 1);
      const matrix: (Rgba | undefined)[][] = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => undefined)
      );
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          matrix[i][j] = subview.get(i, j);
        }
      }

      const cx = convolute(xMask, matrix);
      const cy = convolute(yMask, matrix);

      const datai = 4 * (y * w + x);
      outputData[datai] = getMagnitude(cx.r, cy.r);
      outputData[datai + 1] = getMagnitude(cx.g, cy.g);
      outputData[datai + 2] = getMagnitude(cx.b, cy.b);
      outputData[datai + 3] = rgbaView.get(x, y).a;
      // Retain original A.
    }
  }
  return new ImageData(outputData, w, h);
};
