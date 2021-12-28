export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/gif"];
const MIN_SIZE = 320;
const MAX_SIZE = 640;

interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

const getBitmap = (
  canvas: HTMLCanvasElement,
  rect: {
    height: number;
    left: number;
    top: number;
    width: number;
  }
) => {
  const canvas2d = canvas.getContext("2d");
  if (canvas2d) {
    const pixels: Pixel[] = [];
    const imageData = canvas2d.getImageData(
      rect.left,
      rect.top,
      rect.width,
      rect.height
    );
    for (let x = 0; x < imageData.width; x++) {
      for (let y = 0; y < imageData.height; y++) {
        const i = x + imageData.width * y;
        pixels.push({
          r: imageData.data[i], // eslint-disable-line sort-keys
          g: imageData.data[i + 1], // eslint-disable-line sort-keys
          b: imageData.data[i + 2], // eslint-disable-line sort-keys
          a: imageData.data[i + 3], // eslint-disable-line sort-keys
        });
      }
    }
    return pixels;
  }
  return undefined;
};

const getEdgePixels = (canvas: HTMLCanvasElement) => {
  const leftEdge =
    getBitmap(canvas, {
      height: canvas.height,
      left: 0,
      top: 0,
      width: 1,
    }) ?? [];
  const rightEdge =
    getBitmap(canvas, {
      height: canvas.height,
      left: canvas.height - 1,
      top: 0,
      width: 1,
    }) ?? [];
  const topEdge =
    getBitmap(canvas, {
      height: 1,
      left: 0,
      top: 0,
      width: canvas.width,
    }) ?? [];
  const bottomEdge =
    getBitmap(canvas, {
      height: 1,
      left: 0,
      top: canvas.height - 1,
      width: canvas.width,
    }) ?? [];

  return [leftEdge, rightEdge, topEdge, bottomEdge].flat();
};

const isClipping = (canvas: HTMLCanvasElement) => {
  const threshold = 0.95;
  // Minimum channel value needed for a color to be considered 'white'.
  const rgbLimit = 240;
  const pixels = getEdgePixels(canvas);

  return (
    pixels.filter((p) => {
      const { r, g, b } = p;

      return [r, g, b].every((c) => c > rgbLimit);
    }).length /
      pixels.length <=
    threshold
  );
};

const isInDimensions = (canvas: HTMLCanvasElement) => {
  const height = canvas.height;
  const width = canvas.width;

  const widthInRange = MIN_SIZE <= width && width <= MAX_SIZE;
  const heightInRange = MIN_SIZE <= height && height <= MAX_SIZE;
  return widthInRange && heightInRange;
};

const isOnBackground = (canvas: HTMLCanvasElement) => {
  const threshold = 0.8;
  // Minimum channel value needed for a color to be considered 'white'.
  const rgbLimit = 240;
  // Minimum channel value needed for a pixel to be considered opaque.
  const aLimit = 255;

  const pixels = getEdgePixels(canvas);

  return (
    pixels.filter((p) => {
      const { r, g, b, a } = p;
      return [r, g, b].every((c) => c > rgbLimit) && a >= aLimit;
    }).length /
      pixels.length >
    threshold
  );
};

export const getImageIssues = (canvas: HTMLCanvasElement) => {
  const result = [];

  if (!isInDimensions(canvas)) {
    result.push(
      `The image is not between ${MIN_SIZE} and ${MAX_SIZE} pixels in dimension.`
    );
  }
  if (!isOnBackground(canvas)) {
    result.push("The background is not solid, non-transparent white.");
  }
  if (isClipping(canvas)) {
    result.push(
      "The image clips off the image's canvas (may be caused by background issues)."
    );
  }

  return result;
};
