export const loadImg = async (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement("img");
    img.onerror = reject;
    img.onload = () => resolve(img);
    img.src = src;
  });
