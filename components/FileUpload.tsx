import React, { useCallback, useRef } from 'react';
import type { UploadedFile } from '../types';

interface FileUploadProps {
  onFilesSelect: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  selectedFileIndices: number[];
  onFileSelect: (index: number) => void;
  onFileRemove: (index: number) => void;
  onRemoveAllFiles?: () => void;
  onImageEditRequest: (index: number) => void;
}

const UploadIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>;
const EditIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>;
const CloseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;

const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const MAX_DIMENSION = 1568;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
                    return resolve(file);
                }

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height = Math.round(height * (MAX_DIMENSION / width));
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width = Math.round(width * (MAX_DIMENSION / height));
                        height = MAX_DIMENSION;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    } else {
                        resolve(file); // Fallback to original
                    }
                }, file.type, 0.9);
            };
            img.src = e.target.result as string;
        };
        reader.readAsDataURL(file);
    });
};

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, uploadedFiles, selectedFileIndices, onFileSelect, onFileRemove, onRemoveAllFiles, onImageEditRequest }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const fileList = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    const filePromises = fileList.map(async file => {
      const resizedFile = await resizeImage(file);
      return new Promise<{file: File, base64: string}>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({ file: resizedFile, base64: base64String });
        };
        reader.readAsDataURL(resizedFile);
      });
    });
    
    const newFiles = await Promise.all(filePromises);
    if(newFiles.length > 0) {
        onFilesSelect(newFiles);
    }

  }, [onFilesSelect]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e.dataTransfer.files);
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onButtonClick = () => fileInputRef.current?.click();

  return (
    <div className="space-y-3">
        {uploadedFiles.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2">
                {uploadedFiles.map((uf, index) => (
                    <div key={index} className={`relative group aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${selectedFileIndices.includes(index) ? 'border-sky-500' : 'border-transparent'}`} onClick={() => onFileSelect(index)}>
                        <img src={`data:${uf.file.type};base64,${uf.base64}`} alt={`upload preview ${index}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={(e) => {e.stopPropagation(); onImageEditRequest(index)}} className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30" aria-label="Edit image"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={(e) => {e.stopPropagation(); onFileRemove(index)}} className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30" aria-label="Remove image"><CloseIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
            {onRemoveAllFiles && (
                <button onClick={onRemoveAllFiles} className="text-xs text-center w-full text-gray-500 hover:text-red-400 transition">Remove all</button>
            )}
          </>
        )}
        <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} accept="image/png, image/jpeg, image/webp" multiple className="hidden"/>
        <div onClick={onButtonClick} onDrop={onDrop} onDragOver={onDragOver} role="button" aria-label="Upload image" tabIndex={0} className="cursor-pointer border-2 border-dashed rounded-lg p-4 h-28 flex flex-col items-center justify-center text-center transition-colors duration-200 border-gray-600 hover:border-sky-500">
            <div className="space-y-1 text-gray-400">
                <UploadIcon className="w-8 h-8 mx-auto" />
                <p className="text-sm font-semibold">Click to upload or drag & drop</p>
                <p className="text-xs">Add one or more images</p>
            </div>
        </div>
    </div>
  );
};

export default FileUpload;