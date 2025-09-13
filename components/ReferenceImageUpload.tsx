import React, { useState, useCallback, useRef } from 'react';
import type { UploadedFile, ReferenceAspect, ReferenceConfig } from '../types';

const UploadIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>;
const CloseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;

const ASPECT_OPTIONS: { id: ReferenceAspect, name: string }[] = [
    { id: 'pose', name: 'Pose' },
    { id: 'style', name: 'Style' },
    { id: 'outfit', name: 'Outfit' },
    { id: 'background', name: 'Background' },
    { id: 'color', name: 'Color' },
    { id: 'composition', name: 'Composition' },
];

interface ReferenceImageUploadProps {
    onChange: (config: ReferenceConfig | null) => void;
}

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


const ReferenceImageUpload: React.FC<ReferenceImageUploadProps> = ({ onChange }) => {
    const [guideFile, setGuideFile] = useState<UploadedFile | null>(null);
    const [selectedAspects, setSelectedAspects] = useState<ReferenceAspect[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateParent = (file: UploadedFile | null, aspects: ReferenceAspect[]) => {
        if (file && aspects.length > 0) {
            onChange({ file, aspects });
        } else {
            onChange(null);
        }
    };

    const handleFileChange = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) return;
        
        const resizedFile = await resizeImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            const newFile = { file: resizedFile, base64: base64String };
            setGuideFile(newFile);
            updateParent(newFile, selectedAspects);
        };
        reader.readAsDataURL(resizedFile);
    }, [selectedAspects]);

    const handleRemoveFile = () => {
        setGuideFile(null);
        setSelectedAspects([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onChange(null);
    };

    const toggleAspect = (aspect: ReferenceAspect) => {
        const newAspects = selectedAspects.includes(aspect)
            ? selectedAspects.filter(a => a !== aspect)
            : [...selectedAspects, aspect];
        setSelectedAspects(newAspects);
        updateParent(guideFile, newAspects);
    };
    
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileChange(e.dataTransfer.files);
    };
    
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const onButtonClick = () => fileInputRef.current?.click();

    return (
        <div className="space-y-3">
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} accept="image/png, image/jpeg, image/webp" className="hidden"/>
            
            {guideFile ? (
                <div className="p-2 border-2 border-dashed border-gray-600 rounded-lg space-y-3">
                    <div className="relative group aspect-square w-24 mx-auto rounded-md overflow-hidden">
                        <img src={`data:${guideFile.file.type};base64,${guideFile.base64}`} alt="guide preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={handleRemoveFile} className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30" aria-label="Remove guide image"><CloseIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                     <div className="grid grid-cols-3 gap-2">
                        {ASPECT_OPTIONS.map(({ id, name }) => (
                            <button
                                key={id}
                                onClick={() => toggleAspect(id)}
                                className={`px-2 py-2 text-xs font-semibold rounded-md transition ${selectedAspects.includes(id) ? 'bg-sky-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                 <div onClick={onButtonClick} onDrop={onDrop} onDragOver={onDragOver} role="button" aria-label="Upload guide image" tabIndex={0} className="cursor-pointer border-2 border-dashed rounded-lg p-4 h-28 flex flex-col items-center justify-center text-center transition-colors duration-200 border-gray-600 hover:border-sky-500">
                    <div className="space-y-1 text-gray-400">
                        <UploadIcon className="w-8 h-8 mx-auto" />
                        <p className="text-sm font-semibold">Upload Guide Image</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferenceImageUpload;