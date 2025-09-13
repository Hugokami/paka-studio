import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ResultsDisplay from './components/ResultsDisplay';
import Toast from './components/Toast';
import { useImageGenerator } from './hooks/useImageGenerator';
import { upscaleImage, enhancePromptStream, generateCreativePromptStream } from './services/geminiService';
import type { UploadedFile, EditingImage, ActiveTab, StylePreset, ReferenceConfig, AspectRatio } from './types';
import { NegativePromptInput } from './components/ControlPanel';

// Utility to convert data URL to an UploadedFile object
const dataUrlToUploadedFile = async (dataUrl: string, filename = 'edited-image.png'): Promise<UploadedFile> => {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: blob.type });
    const base64 = dataUrl.split(',')[1];
    return { file, base64 };
};

// Utility to convert serializable file back to UploadedFile
const serializableToUploadedFile = (sFile: {name: string, type: string, base64: string}): UploadedFile => {
    const byteCharacters = atob(sFile.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: sFile.type});
    const file = new File([blob], sFile.name, {type: sFile.type});
    return { file, base64: sFile.base64 };
};


const ImageViewerModal = ({ image, onClose, onDownload }) => {
  if (!image) return null;

   useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-[#161B22] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] p-4 flex flex-col relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close image viewer"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="flex-grow flex items-center justify-center overflow-hidden"><img src={image.src} alt="Generated image closeup" className="max-w-full max-h-full object-contain" /></div>
        <div className="flex-shrink-0 pt-4 flex items-center justify-center">
            <button onClick={() => onDownload(image.src)} className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 w-48">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Download
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
    const [editPrompt, setEditPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);


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
        onSave(dataUrl, editPrompt, negativePrompt);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose} role="dialog">
            <div className="bg-[#161B22] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] p-4 flex flex-col relative animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-2">Image Editor</h2>
                 <div className="flex-grow flex items-start justify-center overflow-auto gap-4">
                    <div className="flex-shrink-0 w-2/3 h-full flex items-center justify-center">
                        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseLeave={finishDrawing} onMouseMove={draw} className="max-w-full max-h-full object-contain cursor-crosshair rounded-lg" />
                    </div>
                    <div className="flex-grow w-1/3 flex flex-col gap-4 py-4 pr-4">
                        <h3 className="text-lg font-semibold">Drawing Tools</h3>
                        <div className="flex items-center gap-4">
                            <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-10 h-10 rounded-md cursor-pointer bg-gray-800 border-2 border-gray-600" />
                            <div className="flex items-center gap-2">
                                <label className="text-sm">Size:</label>
                                <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-32 accent-sky-500" />
                            </div>
                            <button onClick={undo} disabled={history.length <= 1} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition">Undo</button>
                        </div>
                        <div className="flex-grow space-y-4">
                            <h3 className="text-lg font-semibold mt-4">AI Retouching</h3>
                            <p className="text-xs text-gray-400">Draw a mask or sketch, then describe the change. The AI will apply it to the drawn areas.</p>
                            <textarea
                                value={editPrompt}
                                onChange={e => setEditPrompt(e.target.value)}
                                placeholder="e.g., 'make this a golden crown'"
                                rows={3}
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            />
                            <NegativePromptInput value={negativePrompt} onChange={setNegativePrompt} />
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 pt-4 flex items-center justify-end gap-4 flex-wrap">
                    <button onClick={onClose} className="px-6 py-2 font-medium rounded-md bg-gray-700 hover:bg-gray-600 transition">Cancel</button>
                    <button onClick={handleSave} disabled={!editPrompt} className="px-6 py-2 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed">Save & Apply Edit</button>
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

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Handle special case for uploaded files
                if (key === 'paka-uploadedFiles' && Array.isArray(parsed)) {
                    return parsed.map(serializableToUploadedFile);
                }
                return parsed;
            }
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
        }
        return defaultValue;
    });

    useEffect(() => {
        try {
            // Handle special case for uploaded files
            if (key === 'paka-uploadedFiles' && Array.isArray(state)) {
                 const serializableFiles = state.map((uf: UploadedFile) => ({
                    name: uf.file.name,
                    type: uf.file.type,
                    base64: uf.base64,
                }));
                window.localStorage.setItem(key, JSON.stringify(serializableFiles));
            } else {
                window.localStorage.setItem(key, JSON.stringify(state));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
};

export default function App() {
  const [activeTab, setActiveTab] = usePersistentState<ActiveTab>('paka-activeTab', 'studio');
  const [uploadedFiles, setUploadedFiles] = usePersistentState<UploadedFile[]>('paka-uploadedFiles', []);
  const [selectedFileIndices, setSelectedFileIndices] = usePersistentState<number[]>('paka-selectedFileIndices', []);
  const [imageCount, setImageCount] = usePersistentState<number>('paka-imageCount', 5);
  const [activeStyle, setActiveStyle] = usePersistentState<StylePreset>('paka-activeStyle', { id: 'none', name: 'None'});
  const [aspectRatio, setAspectRatio] = usePersistentState<AspectRatio>('paka-aspectRatio', '1:1');
  const [seed, setSeed] = usePersistentState<number | undefined>('paka-seed', undefined);

  const [modalImage, setModalImage] = useState<{ src: string } | null>(null);
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null);
  const [upscalingUrl, setUpscalingUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [lastGenerationConfig, setLastGenerationConfig] = useState<any>(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);

  const { state, setDescribedPrompt, generateNewImages, editExistingImage, processBatch, regenerateSingleImage, clearResults } = useImageGenerator();
  
  // Load persisted prompt into generator state
  useEffect(() => {
      try {
        const savedPrompt = window.localStorage.getItem('paka-describedPrompt');
        if (savedPrompt) {
            setDescribedPrompt(JSON.parse(savedPrompt));
        }
      } catch (e) { console.warn("Could not load persisted prompt", e); }
  }, []);

  // Persist prompt from generator state
  useEffect(() => {
      try {
        window.localStorage.setItem('paka-describedPrompt', JSON.stringify(state.describedPrompt));
      } catch (e) { console.warn("Could not persist prompt", e); }
  }, [state.describedPrompt]);

  const selectedFiles = selectedFileIndices.map(i => uploadedFiles[i]).filter(Boolean);
  const primarySelectedFile = selectedFiles.length > 0 ? selectedFiles[selectedFiles.length - 1] : null;

  const handleShowToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

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
    }
  }, [selectedFileIndices.length, uploadedFiles.length, setUploadedFiles, setSelectedFileIndices]);

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

  }, [activeTab, selectedFileIndices, setSelectedFileIndices]);
  
  const handleFileRemove = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    const newSelectedIndices = selectedFileIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i);
    setSelectedFileIndices(newSelectedIndices);
    
    if (newSelectedIndices.length === 0) {
        clearResults();
    }
  }, [selectedFileIndices, clearResults, setUploadedFiles, setSelectedFileIndices]);
  
  const handleRemoveAllFiles = useCallback(() => {
      setUploadedFiles([]);
      setSelectedFileIndices([]);
      clearResults();
  }, [clearResults, setUploadedFiles, setSelectedFileIndices]);

  const handleGenerateClick = useCallback((userPrompt: string, stylePrompt: string, negativePrompt: string, referenceConfig?: ReferenceConfig) => {
    if (userPrompt || selectedFiles.length > 0) {
      const config = { sourceFiles: selectedFiles, prompt: userPrompt, stylePrompt, negativePrompt, referenceConfig, aspectRatio, seed };
      setLastGenerationConfig(config);
      generateNewImages(selectedFiles, userPrompt, stylePrompt, negativePrompt, imageCount, aspectRatio, referenceConfig, seed);
    }
  }, [selectedFiles, imageCount, generateNewImages, aspectRatio, seed]);

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

  const handleRegenerateClick = useCallback((index: number) => {
      if (lastGenerationConfig) {
          regenerateSingleImage(index, lastGenerationConfig);
      } else {
          setToast({ message: "No recent generation context found. Please generate images first.", type: 'error' });
      }
  }, [lastGenerationConfig, regenerateSingleImage]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!state.describedPrompt) {
        handleShowToast("Please enter a prompt to enhance.", 'error');
        return;
    }
    setIsEnhancingPrompt(true);
    const promptToEnhance = state.describedPrompt;
    setDescribedPrompt("");
    try {
        const stream = await enhancePromptStream(promptToEnhance);
        let finalPrompt = "";
        for await (const chunk of stream) {
            // Fix: setDescribedPrompt expects a string, not a function. Accumulate the prompt and set the full string.
            finalPrompt += chunk;
            setDescribedPrompt(finalPrompt);
        }
        handleShowToast("Prompt enhanced successfully!", 'success');
    } catch (error) {
        console.error("Failed to enhance prompt:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        handleShowToast(errorMessage, 'error');
    } finally {
        setIsEnhancingPrompt(false);
    }
  }, [state.describedPrompt, setDescribedPrompt]);

  const handleSurpriseMe = useCallback(async () => {
    setIsGeneratingPrompt(true);
    setDescribedPrompt("");
    try {
        const stream = await generateCreativePromptStream();
        let finalPrompt = "";
        for await (const chunk of stream) {
            // Fix: setDescribedPrompt expects a string, not a function. Accumulate the prompt and set the full string.
            finalPrompt += chunk;
            setDescribedPrompt(finalPrompt);
        }
        handleShowToast("New prompt generated!", 'success');
    } catch (error) {
        console.error("Failed to generate prompt:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        handleShowToast(errorMessage, 'error');
    } finally {
        setIsGeneratingPrompt(false);
    }
  }, [setDescribedPrompt]);

  const handleUpscaleAndDisplay = async (imageUrl: string) => {
      if (upscalingUrl) return;
      setUpscalingUrl(imageUrl);
      try {
          const upscaledImageSrc = await performUpscale(imageUrl);
          setModalImage({ src: upscaledImageSrc });
      } catch (error) {
          console.error("Failed to upscale image:", error);
          setToast({ message: "AI upscaling failed. Please try again.", type: 'error' });
      } finally {
          setUpscalingUrl(null);
      }
  };
  
  const handleDownload = (imageUrl: string) => {
    try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `paka-studio-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to prepare image for download:", error);
        setToast({ message: "Failed to prepare image for download.", type: 'error' });
    }
  };

  const handleCopyImage = async (imageUrl: string) => {
    if (!navigator.clipboard?.write) {
        handleShowToast("Clipboard API not available in your browser.", 'error');
        return;
    }
    try {
        const blob = await (await fetch(imageUrl)).blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
        ]);
        handleShowToast("Image copied to clipboard!", 'success');
    } catch (error) {
        console.error("Failed to copy image:", error);
        handleShowToast("Failed to copy image.", 'error');
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
  
    const handleEditorSave = async (dataUrl: string, prompt: string, negativePrompt: string) => {
        const editedFile = await dataUrlToUploadedFile(dataUrl, `masked-${editingImage?.file.file.name || 'image.png'}`);
        if (prompt.trim()) {
            setActiveTab('retouch');
            editExistingImage(editedFile, prompt, negativePrompt);
        }
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
       @keyframes toast-in {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
      .animate-toast-in {
        animation: toast-in 0.5s cubic-bezier(0.21, 1.02, 0.73, 1);
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
              onShowToast={handleShowToast}
              studioConfig={{
                imageCount,
                onImageCountChange: setImageCount,
                activeStyle,
                onStyleChange: setActiveStyle,
                aspectRatio,
                onAspectRatioChange: setAspectRatio,
                seed,
                onSeedChange: setSeed,
                onGenerateClick: handleGenerateClick,
                isGenerationDisabled: (state.describedPrompt.trim() === '' && selectedFiles.length === 0) || state.isLoadingGeneration,
                isLoading: state.isLoadingGeneration,
                describedPrompt: state.describedPrompt,
                onDescribedPromptChange: setDescribedPrompt,
                onEnhancePrompt: handleEnhancePrompt,
                isEnhancingPrompt: isEnhancingPrompt,
                onSurpriseMe: handleSurpriseMe,
                isGeneratingPrompt: isGeneratingPrompt,
              }}
              retouchConfig={{
                onRetouchClick: handleRetouchClick,
                isRetouchDisabled: selectedFiles.length === 0 || state.isLoadingEditing,
                isLoading: state.isLoadingEditing,
              }}
              batchConfig={{
                  onBatchProcess: handleBatchProcess,
                  isBatchDisabled: uploadedFiles.length === 0 || state.isLoadingBatch,
                  isLoading: state.isLoadingBatch,
                  batchProgress: state.batchProgress,
              }}
            />
          </div>

          <div className="lg:col-span-8 xl:col-span-9 bg-[#161B22]/80 border border-gray-700/50 rounded-2xl p-6 min-h-[70vh] flex items-center justify-center">
            <ResultsDisplay
                state={state}
                activeTab={activeTab}
                onImageClick={(src) => setModalImage({ src })}
                onDownloadClick={handleDownload}
                onCopyClick={handleCopyImage}
                onUpscaleClick={handleUpscaleAndDisplay}
                onEditClick={handleSendToRetouch}
                onDrawClick={async (src) => {
                    const file = await dataUrlToUploadedFile(src);
                    handleOpenEditor(file, src);
                }}
                onRegenerateClick={handleRegenerateClick}
                regeneratingIndex={state.regeneratingIndex}
                upscalingUrl={upscalingUrl}
                imageCount={imageCount}
                selectedFiles={selectedFiles}
                uploadedFiles={uploadedFiles}
            />
          </div>
        </div>
      </main>
      <ImageViewerModal image={modalImage} onClose={() => setModalImage(null)} onDownload={handleDownload} />
      <ImageEditorModal image={editingImage} onClose={() => setEditingImage(null)} onSave={handleEditorSave} />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <footer className="text-center py-4 text-gray-600 text-sm"><p>Powered by Gemini. All generated images are AI-creations from Paka Studio.</p></footer>
    </div>
  );
}