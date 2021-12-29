export interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface PixelMatrix {
  get: (x: number, y: number) => Pixel | undefined;
  height: number;
  width: number;
}

export const getPixelMatrix = (imageData: ImageData): PixelMatrix => {
  const data = imageData.data;
  const h = imageData.height;
  const w = imageData.width;

  const matrix: Pixel[][] = [];
  for (let x = 0; x < w; x++) {
    const row: Pixel[] = [];
    for (let y = 0; y < h; y++) {
      const i = 4 * (y * w + x);
      row.push({
        r: data[i], // eslint-disable-line sort-keys
        g: data[i + 1], // eslint-disable-line sort-keys
        b: data[i + 2], // eslint-disable-line sort-keys
        a: data[i + 3], // eslint-disable-line sort-keys
      });
    }
    matrix.push(row);
  }

  return {
    get: (x: number, y: number) => {
      const row = matrix[x];
      if (row === undefined) {
        return undefined;
      }
      const col = row[y];
      if (col === undefined) {
        return undefined;
      }
      return col;
    },
    height: h,
    width: w,
  };
};
