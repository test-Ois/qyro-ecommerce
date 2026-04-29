import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { getCroppedImageFile } from "../utils/cropImage";

const overlayClass =
  "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-md";
const panelClass =
  "w-full max-w-5xl rounded-[28px] border border-white/20 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl";
const buttonPrimaryClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none";
const buttonSecondaryClass =
  "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50";

function ImageCropModal({ isOpen, imageSrc, fileName, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const croppedFile = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName);
      onConfirm(croppedFile);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (cropError) {
      setError(cropError.message || "Failed to crop the selected image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError("");
    onCancel();
  };

  if (!isOpen || !imageSrc) {
    return null;
  }

  return (
    <div className={overlayClass}>
      <div className={panelClass}>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-white/10 bg-black/30 sm:h-[440px]">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
          </div>

          <div className="w-full lg:max-w-sm">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-300">
                Crop Image
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white">Adjust the main product image</h2>
              <p className="mt-3 text-sm leading-6 text-gray-300">
                Drag to reposition, use zoom for framing, and save the cropped version before upload.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-pink-400"
                />
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <img
                  src={imageSrc}
                  alt="Selected for crop"
                  className="h-48 w-full object-contain"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={processing}
                  className={buttonPrimaryClass}
                >
                  {processing ? "Cropping..." : "Use Cropped Image"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={processing}
                  className={buttonSecondaryClass}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
