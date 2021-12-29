import type { Pixel, PixelMatrix } from "features/qed/matrix";
import { getPixelMatrix } from "features/qed/matrix";

const convolute = ({
  convoluteAlpha,
  mask,
  matrix,
  x,
  y,
}: {
  convoluteAlpha: boolean;
  // Assume mask is a square 2D array
  mask: number[][];
  matrix: PixelMatrix;
  x: number;
  y: number;
}) => {
  const h = matrix.height;
  const maskSize = mask.length;
  const w = matrix.width;

  const original = matrix.get(x, y) as Pixel;
  const convoluted: Pixel = {
    r: 0, // eslint-disable-line sort-keys
    g: 0, // eslint-disable-line sort-keys
    b: 0, // eslint-disable-line sort-keys
    a: 0, // eslint-disable-line sort-keys
  };

  // Apply convolution mask.
  for (let mx = 0; mx < maskSize; mx++) {
    for (let my = 0; my < maskSize; my++) {
      const xi = x - (maskSize - 1) / 2 + mx;
      const yi = y - (maskSize - 1) / 2 + my;
      // Convolute if the pixel is in bounds.
      if (xi >= 0 && xi < w && yi >= 0 && yi < h) {
        // Array access should be safe if the mask is proper.
        const weight = mask[mx][my];
        const sourcePixel = matrix.get(xi, yi);

        if (sourcePixel) {
          convoluted.r += weight * sourcePixel.r;
          convoluted.g += weight * sourcePixel.g;
          convoluted.b += weight * sourcePixel.b;
          convoluted.a += weight * sourcePixel.a;
        }
      }
    }
  }
  if (!convoluteAlpha) {
    convoluted.a = original.a;
  }
  return convoluted;
};

const getSobelMagnitude = (xChannel: number, yChannel: number) => {
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
  const matrix = getPixelMatrix(selection);

  // Convolute all pixels not on boundary.
  for (let x = 1; x < w - 1; x++) {
    for (let y = 1; y < h - 1; y++) {
      const cx = convolute({
        convoluteAlpha: false,
        mask: [
          [-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1],
        ],
        matrix,
        x,
        y,
      });
      const cy = convolute({
        convoluteAlpha: false,
        mask: [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1],
        ],
        matrix,
        x,
        y,
      });

      const cxy: Pixel = {
        r: getSobelMagnitude(cx.r, cy.r), // eslint-disable-line sort-keys
        g: getSobelMagnitude(cx.g, cy.g), // eslint-disable-line sort-keys
        b: getSobelMagnitude(cx.b, cy.b), // eslint-disable-line sort-keys
        a: getSobelMagnitude(cx.r, cy.r), // eslint-disable-line sort-keys
      };
      // Retain original A.
      cxy.a = matrix.get(x, y)?.a as number;

      canvas2dOut.fillStyle = `rgba(${cxy.r},${cxy.g}, ${cxy.b}, ${cxy.a})`;
      canvas2dOut.fillRect(x, y, 1, 1);
    }
  }
};
