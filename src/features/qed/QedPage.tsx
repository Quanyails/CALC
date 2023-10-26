import { saveAs } from "file-saver";
import JSZip from "jszip";
import React from "react";

import Canvas from "../../components/Canvas";
import { EdgeDetectionMethod, draw } from "features/qed/methods";
import { read } from "util/fileReader";
import { loadImg } from "util/img";

const Interval = ({
  currentValue,
  max,
  min,
  onChange,
  step,
}: {
  currentValue: [number, number];
  max: number;
  min: number;
  onChange: (interval: [number, number]) => void;
  step?: number;
}) => {
  const [currentMin, currentMax] = currentValue;

  return (
    <div>
      <label>
        <p>Minimum value: {currentMin}</p>
        <input
          max={max}
          min={min}
          onChange={(e) => {
            const m = Number(e.currentTarget.value);
            onChange([m, Math.max(m, currentMax)]);
          }}
          step={step}
          type="range"
          value={currentMin}
        />
      </label>
      <label>
        <p>Maximum value: {currentMax}</p>
        <input
          max={max}
          min={min}
          onChange={(e) => {
            const m = Number(e.currentTarget.value);
            onChange([Math.min(m, currentMin), m]);
          }}
          step={step}
          type="range"
          value={currentMax}
        />
      </label>
    </div>
  );
};

const QedPage = () => {
  const [files, setFiles] = React.useState<FileList>();
  const [img, setImg] = React.useState<HTMLImageElement>();
  const [interval, setInterval] = React.useState<[number, number]>([0, 0]);
  const [method, setMethod] = React.useState<EdgeDetectionMethod>(
    EdgeDetectionMethod.Simple
  );
  const [processedBlob, setProcessedBlob] = React.useState<Blob>();
  const [processedImg, setProcessedImg] = React.useState<ImageData>();
  const [statusMessage, setStatusMessage] = React.useState<string>();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        const f = e.currentTarget.files;
        if (f) {
          setFiles(f);
        }
      },
      [setFiles]
    );

  const handleDrop: React.DragEventHandler<HTMLCanvasElement> =
    React.useCallback(
      (e) => {
        const data = e.dataTransfer;
        const url = data.getData("url");
        if (url !== "") {
          setStatusMessage(
            "Due to security issues, this script cannot accept cross-domain images. :("
          );
        }
        setFiles(data.files);
      },
      [setFiles, setStatusMessage]
    );

  const processImages = React.useCallback(async () => {
    setImg(undefined);
    setStatusMessage("Loading...");
    setProcessedBlob(undefined);

    if (files) {
      const zipped = new JSZip();
      for (const file of files) {
        const data = await read(file, "dataUrl");
        const i = await loadImg(data);
        setImg(i);

        const canvas = document.createElement("canvas");
        canvas.width = i.width;
        canvas.height = i.height;
        const context2d = canvas.getContext("2d");
        if (context2d) {
          context2d.drawImage(i, 0, 0);
          const processed = draw({
            imageData: context2d.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            ),
            interval,
            method,
          });
          context2d.putImageData(processed, 0, 0);
          setProcessedImg(processed);
        }
        zipped.file(
          `QED_${file.name}`,
          // Remove leading "data:image/png;base64," string, if it exists.
          canvas
            .toDataURL("image/png")
            .replace(/^(data:image\/png;base64,)/, ""),
          {
            base64: true,
          }
        );
      }
      const blob = await zipped.generateAsync({ type: "blob" });
      setProcessedBlob(blob);
      setStatusMessage("Loaded!");
    }
  }, [files, interval, method, setStatusMessage, setProcessedBlob]);

  React.useEffect(() => {
    if (method === EdgeDetectionMethod.ColorDifference) {
      setInterval([102, 187]);
    }
    if (method === EdgeDetectionMethod.NormalDifference) {
      setInterval([0.4, 0.7]);
    }
  }, [method]);

  React.useLayoutEffect(() => {
    processImages();
  }, [processImages]);

  return (
    <div>
      <h1>Edge Detection Widget</h1>
      <p>
        Hello! This is a simple script for edge detection processing. The script
        will return a zipped package containing one PNG image for each supported
        image file uploaded. Please be careful about the size of files uploaded.
        JavaScript is not an optimal language for image processing, so
        operations can be slow and stall your browser.
      </p>
      <label>
        <p>Method: </p>
        <select
          onChange={(e) =>
            setMethod(e.currentTarget.value as EdgeDetectionMethod)
          }
          value={method}
        >
          {[
            EdgeDetectionMethod.Simple,
            EdgeDetectionMethod.Sobel,
            EdgeDetectionMethod.ColorDifference,
            EdgeDetectionMethod.NormalDifference,
          ].map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      {method === EdgeDetectionMethod.ColorDifference ? (
        <Interval
          currentValue={interval}
          max={255}
          min={0}
          onChange={setInterval}
        />
      ) : null}
      {method === EdgeDetectionMethod.NormalDifference ? (
        <Interval
          currentValue={interval}
          max={1}
          min={0}
          onChange={setInterval}
          step={0.01}
        />
      ) : null}
      <input
        accept="image/*"
        multiple={true}
        onChange={handleFileChange}
        type="file"
      />
      {/* Input canvas */}
      <Canvas handleDrop={handleDrop} img={img} placeholder="Drag-and-drop!" />
      {/* Output canvas */}
      <Canvas img={processedImg} placeholder="Edges displayed here!" />
      {statusMessage ? <p>{statusMessage}</p> : null}
      <button
        disabled={processedBlob === undefined}
        onClick={() =>
          processedBlob ? saveAs(processedBlob, "QED.zip") : undefined
        }
        type="button"
      >
        Download
      </button>
    </div>
  );
};

export default QedPage;
