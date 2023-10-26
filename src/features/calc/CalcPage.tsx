import React from "react";

import Canvas from "components/Canvas";
import { ALLOWED_MIME_TYPES, getImageIssues } from "features/calc/util";
import { read } from "util/fileReader";
import { loadImg } from "util/img";

const CalcPage = () => {
  const [fileType, setFileType] = React.useState<string>();
  const [img, setImg] = React.useState<HTMLImageElement>();
  const [imageIssues, setImageIssues] = React.useState<string[]>([]);
  const [statusMessage, setStatusMessage] = React.useState<string>();

  const readFile = React.useCallback(
    async (f: File) => {
      setStatusMessage("Loading...");
      const data = await read(f, "dataUrl");
      const i = await loadImg(data);
      setImg(i);

      const canvas = document.createElement("canvas");
      canvas.width = i.width;
      canvas.height = i.height;
      const context2d = canvas.getContext("2d");
      if (context2d) {
        context2d.drawImage(i, 0, 0);
      }
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
      setStatusMessage("Loaded!");
    },
    [fileType, setStatusMessage]
  );

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> =
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
      <Canvas handleDrop={handleDrop} img={img} placeholder="Drag-and-drop!" />
      <input accept="image/*" onChange={handleFileChange} type="file" />
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
