import { drawDifference } from "features/qed/difference";
import { drawDotProduct } from "features/qed/dotProduct";
import { drawSimple } from "features/qed/simple";
import { drawSobel } from "features/qed/sobel";

export enum EdgeDetectionMethod {
  ColorDifference = "color difference",
  NormalDifference = "normal difference",
  Simple = "simple",
  Sobel = "sobel",
}

export const draw = ({
  imageData,
  interval,
  method,
}: {
  imageData: ImageData;
  interval: [number, number];
  method: EdgeDetectionMethod;
}) => {
  switch (method) {
    case EdgeDetectionMethod.ColorDifference:
      return drawDifference({ imageData, interval });
    case EdgeDetectionMethod.NormalDifference:
      return drawDotProduct({ imageData, interval });
    case EdgeDetectionMethod.Simple:
      return drawSimple(imageData);
    case EdgeDetectionMethod.Sobel:
      return drawSobel(imageData);
    default:
      throw Error(`Unexpected value for method: ${method}`);
  }
};
