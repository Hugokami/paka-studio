import React from 'react';

const DownloadIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const RetouchIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A2.25 2.25 0 0 0 7.5 21H12a2.25 2.25 0 0 0 2.25-2.25m-3.75-9.375c.621 0 1.125-.504 1.125-1.125V4.5c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v3.375c0 .621.504 1.125 1.125 1.125h1.5Zm-1.125 4.5h1.5v3.375h-1.5V11.25Z" /></svg>;
const DrawIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>;
const UpscaleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
const RegenerateIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.18-3.185m-3.181-4.992-3.182-3.182a8.25 8.25 0 0 0-11.664 0l-3.18 3.185" /></svg>;

const ActionButton = ({ onClick, children, tooltip, disabled }) => (
    <div className="relative flex items-center">
        <button
            onClick={onClick}
            className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label={tooltip}
            disabled={disabled}
        >
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 z-10">
                {tooltip}
            </div>
        </button>
    </div>
);

const ImageGridItem = ({ imageSrc, index, onImageClick, onDownloadClick, onEditClick, onDrawClick, onUpscaleClick, onRegenerateClick, upscalingUrl, regeneratingIndex }) => {
    const isUpscaling = upscalingUrl === imageSrc;
    const isRegenerating = regeneratingIndex === index;

    return (
        <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden shadow-lg group relative">
            <img
                src={imageSrc}
                alt="Generated variation"
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
                onClick={() => onImageClick(imageSrc)}
            />
             {isRegenerating && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex space-x-2">
                     <ActionButton tooltip="Download" onClick={(e) => { e.stopPropagation(); onDownloadClick(imageSrc); }} disabled={isUpscaling}>
                         {isUpscaling ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <DownloadIcon className="w-5 h-5" />}
                     </ActionButton>
                     <ActionButton tooltip="Upscale" onClick={(e) => { e.stopPropagation(); onUpscaleClick(imageSrc); }} disabled={isUpscaling}>
                        <UpscaleIcon className="w-5 h-5" />
                    </ActionButton>
                     <ActionButton tooltip="Regenerate" onClick={(e) => { e.stopPropagation(); onRegenerateClick(index); }} disabled={isRegenerating}>
                        <RegenerateIcon className="w-5 h-5" />
                    </ActionButton>
                    {/* Fix: Added disabled prop to prevent actions during other operations. */}
                    <ActionButton tooltip="Draw" onClick={(e) => { e.stopPropagation(); onDrawClick(imageSrc); }} disabled={isUpscaling || isRegenerating}>
                        <DrawIcon className="w-5 h-5" />
                    </ActionButton>
                    {/* Fix: Added disabled prop to prevent actions during other operations. */}
                    <ActionButton tooltip="Send to Retouch" onClick={(e) => { e.stopPropagation(); onEditClick(imageSrc); }} disabled={isUpscaling || isRegenerating}>
                        <RetouchIcon className="w-5 h-5" />
                    </ActionButton>
                </div>
            </div>
        </div>
    );
};

const ShimmerPlaceholder = ({ imageSrc }) => (
    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative">
        <img src={imageSrc} alt="loading placeholder" className="w-full h-full object-cover" style={{ filter: 'brightness(0.4)' }}/>
        <div className="shimmer-overlay" />
    </div>
);


export default function ImageGrid({ images, onImageClick, onDownloadClick, onEditClick, onDrawClick, onUpscaleClick, onRegenerateClick, upscalingUrl, regeneratingIndex, isLoading = false, loadingPlaceholders = [], placeholderImages = [] }) {
  const items = isLoading ? loadingPlaceholders : images;
  const count = items.length;

  const columnClasses = {
      1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2',
      5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3',
      6: 'grid-cols-2 md:grid-cols-3',
      7: 'grid-cols-3 md:grid-cols-4',
      8: 'grid-cols-3 md:grid-cols-4',
      9: 'grid-cols-3',
      10: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5',
  };
  const gridClass = columnClasses[count] || columnClasses[6];

  return (
    <div className={`w-full h-full grid ${gridClass} gap-4`}>
      {isLoading ? (
        loadingPlaceholders.map((_, index) => <ShimmerPlaceholder key={index} imageSrc={placeholderImages[index] || placeholderImages[0]} />)
      ) : (
        images.map((imageSrc, index) => (
            <ImageGridItem 
                key={index}
                index={index}
                imageSrc={imageSrc} 
                onImageClick={onImageClick}
                onDownloadClick={onDownloadClick}
                onEditClick={onEditClick}
                onDrawClick={onDrawClick}
                onUpscaleClick={onUpscaleClick}
                onRegenerateClick={onRegenerateClick}
                upscalingUrl={upscalingUrl}
                regeneratingIndex={regeneratingIndex}
            />
        ))
      )}
    </div>
  );
};
