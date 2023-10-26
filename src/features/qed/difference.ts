import { processDifference } from "../../image_processing/difference";
import { RgbaView } from "../../image_processing/rgbaView";
import { LinearScale } from "../../util/linearScale";

export const drawDifference = ({
  imageData,
  interval,
}: {
  imageData: ImageData;
  interval: [number, number];
}): ImageData => {
  const w = imageData.width;
  const h = imageData.height;
  const rgbaView = new RgbaView(imageData);

  const contrastScale = new LinearScale({
    clamp: true,
    domain: interval,
    range: [0, 255],
  });

  const outputData = new Uint8ClampedArray(w * h * 4);

  // Iterate through all but edge pixels.
  for (let x = 0; x < w - 1; x++) {
    for (let y = 0; y < h - 1; y++) {
      // Sample the adjacent pixels with increasing indices.
      const currentPixel = rgbaView.get(x, y);
      const downPixel = rgbaView.get(x + 1, y);
      const rightPixel = rgbaView.get(x, y + 1);

      const processed = processDifference(currentPixel, [
        downPixel,
        rightPixel,
      ]);

      const datai = 4 * (y * w + x);
      outputData[datai] = Math.round(contrastScale.get(processed.r));
      outputData[datai + 1] = Math.round(contrastScale.get(processed.g));
      outputData[datai + 2] = Math.round(contrastScale.get(processed.b));
      outputData[datai + 3] = processed.a;
    }
  }
  return new ImageData(outputData, w, h);
};
