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
  canvasIn,
  canvasOut,
  method,
  interval,
}: {
  canvasIn: HTMLCanvasElement;
  canvasOut: HTMLCanvasElement;
  method: EdgeDetectionMethod;
  interval: [number, number];
}) => {
  const canvas2dOut = canvasOut.getContext("2d") as CanvasRenderingContext2D;
  canvas2dOut.clearRect(0, 0, canvasOut.width, canvasOut.height);

  switch (method) {
    case EdgeDetectionMethod.ColorDifference:
      drawDifference({ canvasIn, canvasOut, interval });
      break;
    case EdgeDetectionMethod.NormalDifference:
      drawDotProduct({ canvasIn, canvasOut, interval });
      break;
    case EdgeDetectionMethod.Simple:
      drawSimple(canvasIn, canvasOut);
      break;
    case EdgeDetectionMethod.Sobel:
      drawSobel(canvasIn, canvasOut);
      break;
    default:
      throw Error(`Unexpected value for method: ${method}`);
  }
};
