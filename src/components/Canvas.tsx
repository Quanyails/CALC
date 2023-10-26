import React from "react";

const Canvas = ({
  handleDrop,
  img,
  placeholder,
}: {
  handleDrop?: React.DragEventHandler<HTMLCanvasElement>;
  img?: HTMLImageElement | ImageData;
  placeholder: string;
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Draw the drag-and-drop text after the canvas has rendered
  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const canvas2d = canvas?.getContext("2d");
    if (canvas && canvas2d) {
      canvas2d.clearRect(0, 0, canvas.width, canvas.height);
      canvas2d.font = "30px serif";
      canvas2d.textAlign = "center";
      canvas2d.fillText(placeholder, canvas.width / 2, canvas.height / 2);
    }
  }, [placeholder]);

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const canvas2d = canvas?.getContext("2d");
    if (canvas && canvas2d && img) {
      canvas2d.clearRect(0, 0, canvas.width, canvas.height);
      if (img instanceof HTMLImageElement) {
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        canvas2d.drawImage(img, 0, 0);
      } else {
        canvas.height = img.height;
        canvas.width = img.width;
        canvas2d.putImageData(img, 0, 0);
      }
    }
  }, [img]);

  return (
    <canvas
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      // Prevent browser redirect.
      onDragOver={(e) => e.preventDefault()}
      // Prevent browser redirect.
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleDrop?.(e);
      }}
      ref={canvasRef}
      style={{
        backgroundColor: isDragging ? "#EEE" : "#FFF",
        border: "1px solid black",
        display: "block",
      }}
    />
  );
};

export default Canvas;
