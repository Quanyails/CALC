export const read = (file: File, as: "dataUrl") => {
  if (as === "dataUrl") {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        resolve(result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } else {
    throw Error(`Unexpected value for as: ${as}`);
  }
};
