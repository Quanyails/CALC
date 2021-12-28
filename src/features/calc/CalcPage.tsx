import React from "react";

import { ALLOWED_MIME_TYPES, getImageIssues } from "features/calc/util";
import { read } from "util/fileReader";
import { loadImg } from "util/img";

const CalcPage = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [fileType, setFileType] = React.useState<string>();
  const [isDragging, setIsDragging] = React.useState(false);
  const [imageIssues, setImageIssues] = React.useState<string[]>([]);
  const [statusMessage, setStatusMessage] = React.useState<string>();

  // Draw the drag-and-drop text after the canvas has rendered
  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const canvas2d = canvas?.getContext("2d");
    if (canvas && canvas2d) {
      canvas2d.clearRect(0, 0, canvas.width, canvas.height);
      canvas2d.font = "30px serif";
      canvas2d.textAlign = "center";
      canvas2d.fillText("Drag-and-drop!", canvas.width / 2, canvas.height / 2);
    }
  }, []);

  const readFile = React.useCallback(
    async (f: File) => {
      setStatusMessage("Loading...");
      const data = await read(f, "dataUrl");
      const img = await loadImg(data);
      setStatusMessage("Loaded!");

      const canvas = canvasRef.current;
      const canvas2d = canvas?.getContext("2d");
      if (canvas && canvas2d) {
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        canvas2d.clearRect(0, 0, canvas.width, canvas.height);
        canvas2d.drawImage(img, 0, 0);
        const issues = getImageIssues(canvas);
        if (fileType && !ALLOWED_MIME_TYPES.includes(fileType)) {
          issues.push(
            `The image is not in one of these file formats: ${ALLOWED_MIME_TYPES.join(
              "\n"
            )}`
          );
        }
        if (issues.length === 0) {
          setImageIssues([
            "There are no technical issues detected with the image!",
          ]);
        } else {
          setImageIssues(issues);
        }
      }
    },
    [fileType, setStatusMessage]
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        const fs = e.target.files;
        if (fs && fs.length === 1) {
          const f = fs[0];
          setFileType(f.type);
          readFile(f);
        }
      },
      [readFile, setFileType]
    );

  const handleDrop: React.DragEventHandler<HTMLCanvasElement> =
    React.useCallback(
      (e) => {
        const data = e.dataTransfer;
        const url = data.getData("url");
        // We cannot call loadImage(url) and canvas.toDataURL() across domains.
        if (!url) {
          setStatusMessage(
            "Due to security issues, this script cannot accept cross-domain images. :("
          );
        }
        const fs = data.files;
        if (fs && fs.length === 1) {
          const f = fs[0];
          setFileType(f.type);
          readFile(f);
        }
      },
      [readFile, setFileType]
    );

  return (
    <div>
      <h1>CAP Art Legality Checker (CALC)</h1>
      <p>
        Hello! This script will check for some of the requirements an image
        needs for a legal submission:
      </p>
      <ul>
        <li>File type</li>
        <li>Image dimensions</li>
        <li>Background</li>
        <li>Clipping</li>
      </ul>
      <canvas
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        // Prevent browser redirect.
        onDragOver={(e) => e.preventDefault()}
        // Prevent browser redirect.
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleDrop(e);
        }}
        ref={canvasRef}
        style={{
          backgroundColor: isDragging ? "#EEE" : "#FFF",
          border: "1px solid black",
          display: "block",
        }}
      />
      <input accept="image/*" onChange={handleChange} type="file" />
      {statusMessage ? <p>{statusMessage}</p> : null}
      {imageIssues.length > 0 ? (
        <ul>
          {imageIssues.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default CalcPage;
