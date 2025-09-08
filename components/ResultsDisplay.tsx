import React from 'react';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import ImageGrid from './ImageGrid';
import { UploadedFile } from '../types';

interface ResultsDisplayProps {
    state: any;
    activeTab: 'studio' | 'retouch' | 'batch';
    onImageClick: (src: string) => void;
    onDownloadClick: (src: string, ext?: 'png') => void;
    onUpscaleClick: (src: string) => void;
    onEditClick: (src: string) => void;
    onDrawClick: (src: string) => void;
    upscalingUrl: string | null;
    imageCount: number;
    selectedFiles: UploadedFile[];
}

const ShimmerPlaceholder = ({ imageSrc }) => (
    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative">
        <img src={imageSrc} alt="loading placeholder" className="w-full h-full object-cover" style={{ filter: 'brightness(0.4)' }}/>
        <div className="shimmer-overlay" />
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    state,
    activeTab,
    onImageClick,
    onDownloadClick,
    onUpscaleClick,
    onEditClick,
    onDrawClick,
    upscalingUrl,
    imageCount,
    selectedFiles,
}) => {
    
    // FIX: Pass required props to ImageGrid during loading state.
    if (state.isLoadingGeneration && activeTab === 'studio' && selectedFiles.length > 0) {
        const placeholders = Array.from({ length: imageCount });
        const sourceImage = `data:${selectedFiles[0].file.type};base64,${selectedFiles[0].base64}`;
        return <ImageGrid
            images={[]}
            isLoading={true}
            loadingPlaceholders={placeholders}
            placeholderImage={sourceImage}
            onImageClick={onImageClick}
            onDownloadClick={onDownloadClick}
            onUpscaleClick={onUpscaleClick}
            onEditClick={onEditClick}
            onDrawClick={onDrawClick}
            upscalingUrl={upscalingUrl}
        />;
    }

    const isLoading = state.isLoadingEditing || state.isLoadingBatch;
    if (isLoading) {
        let message = 'Generating...';
        if (state.isLoadingEditing) message = 'Applying edits...';
        if (state.isLoadingBatch) message = `Processing batch... (${Math.round(state.batchProgress)}%)`;
        const progress = activeTab === 'batch' ? state.batchProgress : undefined;
        return <Loader message={message} progress={progress} />;
    }

    if (state.error) {
        return <ErrorDisplay message={state.error} />;
    }
    
    const imageGridProps = {
        onImageClick,
        onDownloadClick,
        onUpscaleClick,
        onEditClick,
        onDrawClick,
        upscalingUrl,
    };

    switch (activeTab) {
        case 'studio':
            if (state.generatedImages.length > 0) {
                return <ImageGrid images={state.generatedImages} {...imageGridProps} />;
            }
            break;
        case 'retouch':
            if (state.editedImage) {
                return <ImageGrid images={[state.editedImage.result]} {...imageGridProps} />;
            }
            break;
        case 'batch':
             if (state.batchResults.length > 0) {
                 const successfulResults = state.batchResults.filter(r => r.status === 'success').map(r => r.result);
                 if (successfulResults.length > 0) {
                    return <ImageGrid images={successfulResults} {...imageGridProps} />;
                 }
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