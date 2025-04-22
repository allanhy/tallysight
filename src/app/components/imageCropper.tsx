/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Cropper from "react-easy-crop";

interface ImageCropperProps {
    imageFile: File;
    onCropComplete: (croppedDataUrl: string) => void;
    onCancel: () => void;
}

//for more information on using react-easy-crop and this code, https://www.npmjs.com/package/react-easy-crop
const ImageCropper: React.FC<ImageCropperProps> = ({ imageFile, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ width: number; height: number; x: number; y: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    // By using objectURL, makes it a bit faster, https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#example_using_object_urls_to_display_images
    useEffect(() => {
        const url = URL.createObjectURL(imageFile);
        setImageSrc(url);
    
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [imageFile]);

    // Prevent unnecessary function re-creation
    const onCropChange = useCallback((crop: { x: number; y: number }) => setCrop(crop), []);
    const onZoomChange = useCallback((zoom: number) => setZoom(zoom), []);

    const onCropCompleteHandler = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_: any, croppedAreaPixels: { width: number; height: number; x: number; y: number }) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleCrop = async () => {
        if (!croppedAreaPixels) return;
    
        setLoading(true);
        setError(null); // Reset error
    
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            console.log("Cropped image size " + croppedBlob.size + " bytes");
            if (croppedBlob.size > 3 * 1024 * 1024) { // Check if size < 3MB
                setError("Cropped image is too large. Please choose a smaller area.");
                console.log("Could not change profile picture, cropped image is too large. Please choose a smaller area or new file.");
                setLoading(false);
                return;
            }
    
            const croppedImageUrl = URL.createObjectURL(croppedBlob);
            onCropComplete(croppedImageUrl);
        } catch (error) {
            setError("Failed to process image. Please try again.");
        }
    
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Crop Your Image</h2>
                <div className="relative w-80 h-80">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteHandler}
                    />
                </div>
    
                {/* Error Message Display */}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    
                <div className="flex justify-end space-x-2 mt-4">
                    <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-600"
                        onClick={handleCrop}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to crop the image, for more information https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
const getCroppedImg = async (imageSrc: string, croppedAreaPixels: { width: number; height: number; x: number; y: number }): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject("Could not create canvas context");
                return;
            }

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject("Failed to generate cropped image");
                    return;
                }
                resolve(blob);
            }, "image/jpeg");
        };

        image.onerror = reject;
    });
};

//check if the image file is validjpeg, or jpg, and is less than 5mb to prevent bad stuff coming through.
export const isValidImageFile = (file: File): boolean => {
    // Check if file is an image and specifically jpg/jpeg
    const validTypes = ['image/jpeg', 'image/jpg'];
    
    // Check MIME type
    if (!validTypes.includes(file.type)) {
        alert('Only JPG/JPEG images are allowed');
        return false;
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
        alert('File must have a .jpg or .jpeg extension');
        return false;
    }
    
    // Check file size (max 5MB)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
        alert('Image file is too large. Maximum size is 3MB');
        return false;
    }
    
    return true;
};

export default ImageCropper;
