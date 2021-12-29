import { saveAs } from "file-saver";
import JSZip from "jszip";
import React from "react";

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
  const canvasInRef = React.useRef<HTMLCanvasElement | null>(null);
  const canvasOutRef = React.useRef<HTMLCanvasElement | null>(null);
  const [interval, setInterval] = React.useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [method, setMethod] = React.useState<EdgeDetectionMethod>(
    EdgeDetectionMethod.Simple
  );
  const [processed, setProcessed] = React.useState<Blob>();
  const [statusMessage, setStatusMessage] = React.useState<string>();

  const processFiles = React.useCallback(
    async (files: FileList) => {
      const zipped = new JSZip();
      setStatusMessage("Loading...");
      setProcessed(undefined);
      for (const file of files) {
        const data = await read(file, "dataUrl");
        const img = await loadImg(data);

        const canvasIn = canvasInRef.current;
        if (canvasIn) {
          canvasIn.height = img.naturalHeight;
          canvasIn.width = img.naturalWidth;
        }

        const canvasOut = canvasOutRef.current;
        if (canvasOut) {
          canvasOut.height = img.naturalHeight;
          canvasOut.width = img.naturalWidth;
        }

        const canvas2dIn = canvasIn?.getContext("2d");
        const canvas2dOut = canvasOut?.getContext("2d");

        if (canvasIn && canvas2dIn && canvasOut && canvas2dOut) {
          canvas2dIn.clearRect(0, 0, canvasIn.width, canvasIn.height);
          canvas2dIn.drawImage(img, 0, 0);
          draw({ canvasIn, canvasOut, interval, method });
          const dataUri = canvasOut.toDataURL("image/png");
          zipped.file(
            `QED_${file.name}`,
            // Remove leading "data:image/png;base64," string, if it exists.
            dataUri.replace(/^(data:image\/png;base64,)/, ""),
            {
              base64: true,
            }
          );
        }
      }
      const blob = await zipped.generateAsync({ type: "blob" });
      setProcessed(blob);
      setStatusMessage("Loaded!");
    },
    [interval, method, setStatusMessage, setProcessed]
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      async (e) => {
        const files = e.currentTarget.files;
        if (files) {
          await processFiles(files);
        }
      },
      [processFiles]
    );

  const handleDrop: React.DragEventHandler<HTMLCanvasElement> =
    React.useCallback(
      async (e) => {
        const data = e.dataTransfer;
        const url = data.getData("url");
        if (url !== "") {
          setStatusMessage(
            "Due to security issues, this script cannot accept cross-domain images. :("
          );
        }
        const files = data.files;
        await processFiles(files);
      },
      [processFiles, setStatusMessage]
    );

  React.useEffect(() => {
    if (method === EdgeDetectionMethod.ColorDifference) {
      setInterval([102, 187]);
    }
    if (method === EdgeDetectionMethod.NormalDifference) {
      setInterval([0.4, 0.7]);
    }
  }, [method]);

  // Draw the drag-and-drop text after the input canvas has rendered
  React.useLayoutEffect(() => {
    const canvasIn = canvasInRef.current;
    const canvas2dIn = canvasIn?.getContext("2d");

    if (canvasIn && canvas2dIn) {
      canvas2dIn.font = "30px serif";
      canvas2dIn.textAlign = "center";
      canvas2dIn.textBaseline = "middle";
      canvas2dIn.clearRect(0, 0, canvasIn.width, canvasIn.height);
      canvas2dIn.fillText(
        "Drag-and-drop!",
        canvasIn.width / 2,
        canvasIn.height / 2
      );
    }
  }, []);

  // Draw the description text after the output canvas has rendered
  React.useLayoutEffect(() => {
    const canvasOut = canvasOutRef.current;
    const canvas2dOut = canvasOut?.getContext("2d");

    if (canvasOut && canvas2dOut) {
      canvas2dOut.font = "30px serif";
      canvas2dOut.textAlign = "center"; // Horizontal centering
      canvas2dOut.textBaseline = "middle"; // Vertical centering
      canvas2dOut.clearRect(0, 0, canvasOut.width, canvasOut.height);
      canvas2dOut.fillText(
        "Edges displayed here!",
        canvasOut.width / 2,
        canvasOut.height / 2
      );
    }
  }, []);

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
        onChange={handleChange}
        type="file"
      />
      {/* Input canvas */}
      <canvas
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        // Prevent browser redirect.
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          // Prevent browser redirect.
          e.preventDefault();
          setIsDragging(false);
          handleDrop(e);
        }}
        ref={canvasInRef}
        style={{
          backgroundColor: isDragging ? "#EEE" : "#FFF",
          border: "1px solid black",
          display: "block",
        }}
      />
      {/* Output canvas */}
      <canvas
        ref={canvasOutRef}
        style={{
          backgroundColor: "#FFF",
          border: "1px solid #000000",
          display: "block",
        }}
      />
      {statusMessage ? <p>{statusMessage}</p> : null}
      <button
        disabled={processed === undefined}
        onClick={() => (processed ? saveAs(processed, "QED.zip") : undefined)}
        type="button"
      >
        Download
      </button>
    </div>
  );
};

export default QedPage;
