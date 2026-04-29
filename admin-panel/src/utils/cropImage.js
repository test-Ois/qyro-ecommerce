const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the selected image."));
    reader.readAsDataURL(file);
  });

const getCanvasContext = (canvas) => {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to initialize the image editor.");
  }

  return context;
};

export const createCropImageUrl = async (file) => readFileAsDataUrl(file);

export const getCroppedImageFile = async (imageSrc, cropPixels, fileName = "cropped-image.jpg") => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = getCanvasContext(canvas);

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to crop the selected image."));
          return;
        }

        const croppedFile = new File([blob], fileName, {
          type: blob.type || "image/jpeg"
        });

        resolve(croppedFile);
      },
      "image/jpeg",
      0.92
    );
  });
};
