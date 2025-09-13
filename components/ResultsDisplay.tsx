import React from 'react';
import ErrorDisplay from './ErrorDisplay';
import ImageGrid from './ImageGrid';
import { UploadedFile } from '../types';

interface ResultsDisplayProps {
    state: any;
    activeTab: 'studio' | 'retouch' | 'batch';
    onImageClick: (src: string) => void;
    onDownloadClick: (src: string, ext?: 'png') => void;
    onCopyClick: (src: string) => void;
    onUpscaleClick: (src: string) => void;
    onEditClick: (src: string) => void;
    onDrawClick: (src: string) => void;
    onRegenerateClick: (index: number) => void;
    regeneratingIndex: number | null;
    upscalingUrl: string | null;
    imageCount: number;
    selectedFiles: UploadedFile[];
    uploadedFiles: UploadedFile[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    state,
    activeTab,
    onImageClick,
    onDownloadClick,
    onCopyClick,
    onUpscaleClick,
    onEditClick,
    onDrawClick,
    onRegenerateClick,
    regeneratingIndex,
    upscalingUrl,
    imageCount,
    selectedFiles,
    uploadedFiles,
}) => {
    
    const { isLoadingGeneration, isLoadingEditing, isLoadingBatch } = state;

    if (isLoadingGeneration || isLoadingEditing || isLoadingBatch) {
        let placeholders: any[] = [];
        let sourceImages: string[] = [];

        if (isLoadingGeneration && imageCount > 0) {
            placeholders = Array.from({ length: imageCount });
            if (selectedFiles.length > 0) {
                const sourceImage = `data:${selectedFiles[0].file.type};base64,${selectedFiles[0].base64}`;
                sourceImages = Array(imageCount).fill(sourceImage);
            }
        } else if (isLoadingEditing && selectedFiles.length > 0) {
            placeholders = [{}];
            sourceImages = [`data:${selectedFiles[0].file.type};base64,${selectedFiles[0].base64}`];
        } else if (isLoadingBatch && uploadedFiles.length > 0) {
            placeholders = uploadedFiles;
            sourceImages = uploadedFiles.map(f => `data:${f.file.type};base64,${f.base64}`);
        }

        if (placeholders.length > 0) {
             return <ImageGrid
                images={[]}
                // Fix: Added missing batchResults prop
                batchResults={null}
                isLoading={true}
                loadingPlaceholders={placeholders}
                placeholderImages={sourceImages}
                onImageClick={onImageClick}
                onDownloadClick={onDownloadClick}
                onCopyClick={onCopyClick}
                onUpscaleClick={onUpscaleClick}
                onEditClick={onEditClick}
                onDrawClick={onDrawClick}
                onRegenerateClick={onRegenerateClick}
                upscalingUrl={upscalingUrl}
                regeneratingIndex={regeneratingIndex}
            />;
        }
    }

    if (state.error) {
        return <ErrorDisplay message={state.error} />;
    }
    
    const imageGridProps = {
        onImageClick,
        onDownloadClick,
        onCopyClick,
        onUpscaleClick,
        onEditClick,
        onDrawClick,
        onRegenerateClick,
        upscalingUrl,
        regeneratingIndex,
    };

    switch (activeTab) {
        case 'studio':
            if (state.generatedImages.length > 0) {
                // Fix: Added missing batchResults prop
                return <ImageGrid images={state.generatedImages} batchResults={null} {...imageGridProps} />;
            }
            break;
        case 'retouch':
            if (state.editedImage) {
                // Fix: Added missing batchResults prop
                return <ImageGrid images={[state.editedImage.result]} batchResults={null} {...imageGridProps} />;
            }
            break;
        case 'batch':
             if (state.batchResults.length > 0) {
                // Fix: Added missing images prop
                return <ImageGrid images={[]} batchResults={state.batchResults} {...imageGridProps} />;
             }
             break;
        default:
            break;
    }

    return (
        <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-300">Your results will appear here</h3>
            <p className="mt-1 text-sm text-gray-500">Upload an image and generate a new creation.</p>
        </div>
    );
};

export default ResultsDisplay;