import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ResultsDisplay from './components/ResultsDisplay';
import { useImageGenerator } from './hooks/useImageGenerator';
import { upscaleImage } from './services/geminiService';
import type { UploadedFile, EditingImage, ActiveTab, StylePreset } from './types';

// Utility to convert data URL to an UploadedFile object
const dataUrlToUploadedFile = async (dataUrl: string, filename = 'edited-image.png'): Promise<UploadedFile> => {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: blob.type });
    const base64 = dataUrl.split(',')[1];
    return { file, base64 };
};

const ImageViewerModal = ({ image, onClose, onDownload, isUpscaling }) => {
  if (!image) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-[#161B22] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] p-4 flex flex-col relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close image viewer"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="flex-grow flex items-center justify-center overflow-hidden"><img src={image.src} alt="Generated image closeup" className="max-w-full max-h-full object-contain" /></div>
        <div className="flex-shrink-0 pt-4 flex items-center justify-center">
            <button onClick={() => onDownload(image.src)} disabled={isUpscaling} className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-800 disabled:cursor-wait transition-all duration-200 w-48">
              {isUpscaling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Upscaling...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Download HQ
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

const ImageEditorModal = ({ image, onClose, onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState('#FFFFFF');
    const [brushSize, setBrushSize] = useState(5);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (image?.src && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                const data = canvas.toDataURL('image/png');
                setHistory([data]);
            };
            img.src = image.src;
        }
    }, [image]);

    if (!image) return null;

    const getContext = () => canvasRef.current.getContext('2d');

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        const context = getContext();
        context.strokeStyle = brushColor;
        context.lineWidth = brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        const canvas = canvasRef.current;
        if (!isDrawing) return;
        getContext().closePath();
        setIsDrawing(false);
        const data = canvas.toDataURL('image/png');
        setHistory(prev => [...prev, data]);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const context = getContext();
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };
    
    const undo = () => {
        if (history.length <= 1) return;
        const newHistory = [...history];
        newHistory.pop();
        const lastState = newHistory[newHistory.length - 1];
        
        const canvas = canvasRef.current;
        const context = getContext();
        const img = new Image();
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        };
        img.src = lastState;
        setHistory(newHistory);
    };
    
    const handleSave = () => {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSave(dataUrl);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose} role="dialog">
            <div className="bg-[#161B22] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] p-4 flex flex-col relative animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-4">Image Editor</h2>
                <div className="flex-grow flex items-center justify-center overflow-auto">
                    <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseLeave={finishDrawing} onMouseMove={draw} className="max-w-full max-h-full object-contain cursor-crosshair rounded-lg" />
                </div>
                <div className="flex-shrink-0 pt-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-10 h-10 rounded-md cursor-pointer bg-gray-800 border-2 border-gray-600" />
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Size:</label>
                            <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-32 accent-sky-500" />
                        </div>
                         <button onClick={undo} disabled={history.length <= 1} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition">Undo</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="px-6 py-2 font-medium rounded-md bg-gray-700 hover:bg-gray-600 transition">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition">Save & Retouch</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable upscale function
const performUpscale = async (imageUrl: string): Promise<string> => {
    const [header, base64Data] = imageUrl.split(',');
    if (!header || !base64Data) throw new Error("Invalid image data URL");
    
    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not determine MIME type from data URL");
    
    const mimeType = mimeTypeMatch[1];
    return await upscaleImage(base64Data, mimeType);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFileIndices, setSelectedFileIndices] = useState<number[]>([]);
  const [imageCount, setImageCount] = useState<number>(5);
  const [modalImage, setModalImage] = useState<{ src: string } | null>(null);
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null);
  const [activeStyle, setActiveStyle] = useState<StylePreset>({ id: 'none', name: 'None'});
  const [upscalingUrl, setUpscalingUrl] = useState<string | null>(null);

  const { state, setDescribedPrompt, generateDescription, generateNewImages, editExistingImage, processBatch, clearResults } = useImageGenerator();
  
  const selectedFiles = selectedFileIndices.map(i => uploadedFiles[i]).filter(Boolean);
  const primarySelectedFile = selectedFiles.length > 0 ? selectedFiles[selectedFiles.length - 1] : null;

  const handleTabChange = (tab: ActiveTab) => {
    clearResults();
    setActiveTab(tab);
    // If not in studio, ensure only one file is selected
    if (tab !== 'studio' && selectedFileIndices.length > 1) {
        setSelectedFileIndices(prev => [prev[prev.length - 1]]);
    }
  };

  const handleFilesSelect = useCallback((newFiles: UploadedFile[]) => {
    const newFileStartIndex = uploadedFiles.length;
    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (selectedFileIndices.length === 0 && newFiles.length > 0) {
        setSelectedFileIndices([newFileStartIndex]);
        if(activeTab === 'studio') {
            generateDescription(newFiles[0]);
        }
    }
  }, [selectedFileIndices, uploadedFiles, activeTab, generateDescription]);

  const handleFileSelect = useCallback((index: number) => {
    let newIndices;
    const isCurrentlySelected = selectedFileIndices.includes(index);

    if (activeTab === 'studio') {
        newIndices = isCurrentlySelected
            ? selectedFileIndices.filter(i => i !== index)
            : [...selectedFileIndices, index];
    } else {
        newIndices = [index];
    }
    
    setSelectedFileIndices(newIndices);

    if (activeTab === 'studio' && !isCurrentlySelected && newIndices.length === 1) {
        // If this is the first file selected in studio mode, generate a description
        generateDescription(uploadedFiles[index]);
    } else if (activeTab === 'studio' && newIndices.length === 0) {
        setDescribedPrompt('');
    }

  }, [activeTab, uploadedFiles, generateDescription, selectedFileIndices, setDescribedPrompt]);
  
  const handleFileRemove = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    const newSelectedIndices = selectedFileIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i);
    setSelectedFileIndices(newSelectedIndices);
    
    if (newSelectedIndices.length > 0 && activeTab === 'studio') {
        const lastSelectedFile = uploadedFiles[newSelectedIndices[newSelectedIndices.length - 1]];
        generateDescription(lastSelectedFile);
    } else {
        clearResults();
    }
  }, [selectedFileIndices, uploadedFiles, activeTab, generateDescription, clearResults]);
  
  const handleRemoveAllFiles = useCallback(() => {
      setUploadedFiles([]);
      setSelectedFileIndices([]);
      clearResults();
  }, [clearResults]);

  const handleGenerateClick = useCallback((userPrompt: string, stylePrompt: string, negativePrompt: string) => {
    if (selectedFiles.length > 0 && userPrompt) {
      generateNewImages(selectedFiles, userPrompt, stylePrompt, negativePrompt, imageCount);
    }
  }, [selectedFiles, imageCount, generateNewImages]);

  const handleRetouchClick = useCallback((retouchPrompt: string, negativePrompt: string) => {
      if (primarySelectedFile && retouchPrompt) {
        editExistingImage(primarySelectedFile, retouchPrompt, negativePrompt);
      }
  }, [primarySelectedFile, editExistingImage]);
  
  const handleBatchProcess = useCallback((prompt: string, negativePrompt: string) => {
      if(uploadedFiles.length > 0 && prompt) {
          processBatch(uploadedFiles, prompt, negativePrompt);
      }
  }, [uploadedFiles, processBatch]);

  const handleUpscaleAndDisplay = async (imageUrl: string) => {
      if (upscalingUrl) return;
      setUpscalingUrl(imageUrl);
      try {
          const upscaledImageSrc = await performUpscale(imageUrl);
          setModalImage({ src: upscaledImageSrc });
      } catch (error) {
          console.error("Failed to upscale image:", error);
          alert("AI upscaling failed. Please try again.");
      } finally {
          setUpscalingUrl(null);
      }
  };
  
  const handleDownload = async (imageUrl: string) => {
    setUpscalingUrl(imageUrl);
    try {
        const upscaledImage = await performUpscale(imageUrl);
        const link = document.createElement('a');
        link.href = upscaledImage;
        link.download = `paka-studio-hq-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to upscale image:", error);
        alert("AI upscaling failed. Downloading the original image instead.");
        // Fallback to download original
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `paka-studio-original-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } finally {
        setUpscalingUrl(null);
    }
  };
  
  const handleSendToRetouch = async (imageSrc: string) => {
    const newFile = await dataUrlToUploadedFile(imageSrc);
    const newIndex = uploadedFiles.length;
    setUploadedFiles(prev => [...prev, newFile]);
    setSelectedFileIndices([newIndex]);
    handleTabChange('retouch');
  };

  const handleOpenEditor = (file, src) => {
      setEditingImage({ file, src });
  };
  
  const handleEditorSave = async (dataUrl) => {
      const newFile = await dataUrlToUploadedFile(dataUrl);
      const newIndex = uploadedFiles.length;
      setUploadedFiles(prev => [...prev, newFile]);
      setSelectedFileIndices([newIndex]);
      handleTabChange('retouch');
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-200 font-sans">
      <style>{`
      .animate-fade-in { animation: fadeIn 0.3s ease-out; } 
      @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
      .animate-ellipsis::after {
        display: inline-block;
        animation: ellipsis 1.25s infinite;
        content: ".";
        width: 1em;
        text-align: left;
      }
      @keyframes ellipsis {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
      }
      .shimmer-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(100deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 80%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
      }
       @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3 space-y-8">
            <ControlPanel
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onFilesSelect={handleFilesSelect}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onRemoveAllFiles={handleRemoveAllFiles}
              onImageEditRequest={(index) => handleOpenEditor(uploadedFiles[index], `data:${uploadedFiles[index].file.type};base64,${uploadedFiles[index].base64}`)}
              uploadedFiles={uploadedFiles}
              selectedFileIndices={selectedFileIndices}
              studioConfig={{
                imageCount,
                onImageCountChange: setImageCount,
                activeStyle,
                onStyleChange: setActiveStyle,
                onGenerateClick: handleGenerateClick,
                isGenerationDisabled: selectedFiles.length === 0 || !state.describedPrompt || state.isLoadingGeneration,
                describedPrompt: state.describedPrompt,
                onDescribedPromptChange: setDescribedPrompt,
                isLoading: state.isLoadingDescription,
              }}
              retouchConfig={{
                onRetouchClick: handleRetouchClick,
                isRetouchDisabled: selectedFiles.length === 0 || state.isLoadingEditing,
              }}
              batchConfig={{
                  onBatchProcess: handleBatchProcess,
                  isBatchDisabled: uploadedFiles.length === 0 || state.isLoadingBatch,
              }}
            />
          </div>

          <div className="lg:col-span-8 xl:col-span-9 bg-[#161B22]/80 border border-gray-700/50 rounded-2xl p-6 min-h-[70vh] flex items-center justify-center">
            <ResultsDisplay
                state={state}
                activeTab={activeTab}
                onImageClick={(src) => setModalImage({ src })}
                onDownloadClick={handleDownload}
                onUpscaleClick={handleUpscaleAndDisplay}
                onEditClick={handleSendToRetouch}
                onDrawClick={async (src) => {
                    const file = await dataUrlToUploadedFile(src);
                    handleOpenEditor(file, src);
                }}
                upscalingUrl={upscalingUrl}
                imageCount={imageCount}
                selectedFiles={selectedFiles}
            />
          </div>
        </div>
      </main>
      <ImageViewerModal image={modalImage} onClose={() => setModalImage(null)} onDownload={handleDownload} isUpscaling={upscalingUrl === modalImage?.src} />
      <ImageEditorModal image={editingImage} onClose={() => setEditingImage(null)} onSave={handleEditorSave} />
      <footer className="text-center py-4 text-gray-600 text-sm"><p>Powered by Gemini. All generated images are AI-creations from Paka Studio.</p></footer>
    </div>
  );
}