import { convolute } from "../../image_processing/convolutions";
import { Rgba } from "../../image_processing/rgba";
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
export const drawSobel = (
  canvasIn: HTMLCanvasElement,
  canvasOut: HTMLCanvasElement
) => {
  const w = canvasIn.width;
  const h = canvasIn.height;
  const canvas2dIn = canvasIn.getContext("2d") as CanvasRenderingContext2D;
  const canvas2dOut = canvasOut.getContext("2d") as CanvasRenderingContext2D;

  const selection = canvas2dIn.getImageData(0, 0, w, h);
  const rgbaView = new RgbaView(selection);

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

      const cxy = new Rgba(
        getMagnitude(cx.r, cy.r),
        getMagnitude(cx.g, cy.g),
        getMagnitude(cx.b, cy.b),
        // Retain original A.
        rgbaView.get(x, y).a
      );

      canvas2dOut.fillStyle = cxy.toColor();
      canvas2dOut.fillRect(x, y, 1, 1);
    }
  }
};
