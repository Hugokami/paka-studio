import React from 'react';
import FileUpload from './FileUpload';
import ReferenceImageUpload from './ReferenceImageUpload';
import { ActiveTab, StylePreset, ReferenceConfig } from '../types';

const PRESETS: StylePreset[] = [
    { id: 'photorealistic', name: 'Photorealistic' },
    { id: 'cinematic', name: 'Cinematic' },
    { id: 'vintage', name: 'Vintage Film' },
    { id: 'analog', name: 'Analog' },
    { id: 'bw', name: 'Black & White' },
    { id: 'product', name: 'Product Shot' },
    { id: 'fantasy', name: 'Fantasy Art' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'watercolor', name: 'Watercolor' },
    { id: '3d', name: '3D Render' },
];

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CloseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const CopyIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>;
const EnhanceIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;


const NegativePromptInput = ({ value, onChange }) => (
    <div className="relative">
        <label className="text-sm font-medium text-gray-400">Negative Prompt (what to avoid)</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., text, watermarks, extra limbs"
            className="mt-1 w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition pr-8"
        />
        {value && (
             <button onClick={() => onChange('')} className="absolute top-8 right-2 p-1 text-gray-500 hover:text-white" aria-label="Clear negative prompt"><CloseIcon className="w-4 h-4" /></button>
        )}
    </div>
);

const StudioControls = ({ config }) => {
    const [negativePrompt, setNegativePrompt] = React.useState('');
    const [referenceConfig, setReferenceConfig] = React.useState<ReferenceConfig | null>(null);

    const stylePrompts: Record<StylePreset['id'], string> = {
        'none': '',
        'photorealistic': 'ultra realistic, 8k, sharp focus, high detail',
        'cinematic': 'cinematic movie scene, dramatic lighting, film grain',
        'vintage': 'vintage film photograph from the 1970s, desaturated colors, light leaks',
        'analog': 'analog film photo, soft focus, warm tones',
        'bw': 'high-contrast black and white photograph',
        'product': 'professional product shot, clean lighting, isolated on a solid background',
        'fantasy': 'digital painting, fantasy art, vibrant, detailed',
        'cyberpunk': 'cyberpunk aesthetic, neon lights, futuristic cityscape',
        'watercolor': 'watercolor painting, soft edges, paper texture',
        '3d': '3D render, smooth shading, high-quality character model',
    };

    const handleGenerate = () => {
        const stylePrompt = stylePrompts[config.activeStyle.id] || stylePrompts['none'];
        const userPrompt = config.describedPrompt || '';
        config.onGenerateClick(userPrompt, stylePrompt, negativePrompt, referenceConfig);
    };
    
    const handleCopy = () => {
        if (!config.describedPrompt) return;
        navigator.clipboard.writeText(config.describedPrompt);
        config.onShowToast('Prompt copied to clipboard!', 'success');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!config.isGenerationDisabled) {
                handleGenerate();
            }
        }
    };


    return (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">1. Upload Subject(s) (Optional)</h2>
             <p className="text-sm text-gray-400 mb-2">Add reference subjects or generate from text alone.</p>
            <FileUpload {...config.commonFileProps} />
        </div>
         <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">2. Guide the AI (Optional)</h2>
             <p className="text-sm text-gray-400 mb-2">Use a guide image for pose, style, outfit, etc.</p>
            <ReferenceImageUpload onChange={setReferenceConfig} />
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">3. Write Prompt</h2>
            <p className="text-sm text-gray-400 mb-2">Describe the final image. Press Ctrl+Enter to generate.</p>
             <div className="relative">
                <textarea
                    value={config.describedPrompt}
                    onChange={(e) => config.onDescribedPromptChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., A photo of a person smiling, futuristic city."
                    rows={4}
                    className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition pr-16"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {config.describedPrompt && (
                        <button onClick={() => config.onDescribedPromptChange('')} className="p-1 text-gray-500 hover:text-white" aria-label="Clear prompt"><CloseIcon className="w-4 h-4" /></button>
                    )}
                    <button onClick={handleCopy} className="p-1 text-gray-500 hover:text-white" aria-label="Copy prompt"><CopyIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="mt-2 text-right">
                <button 
                    onClick={config.onEnhancePrompt} 
                    disabled={config.isEnhancingPrompt || !config.describedPrompt}
                    className="inline-flex items-center text-sm px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 disabled:text-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed transition font-semibold"
                >
                    {config.isEnhancingPrompt ? (
                        <SpinnerIcon />
                    ) : (
                        <EnhanceIcon className="w-4 h-4 mr-2" />
                    )}
                    Enhance with AI
                </button>
            </div>
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">4. Select Style</h2>
            <div className="grid grid-cols-3 gap-2">
                 <button onClick={() => config.onStyleChange({id: 'none', name: 'None'})} className={`px-2 py-3 text-xs font-semibold rounded-md transition ${config.activeStyle.id === 'none' ? 'bg-sky-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    None
                </button>
                {PRESETS.map(preset => (
                    <button key={preset.id} onClick={() => config.onStyleChange(preset)} className={`px-2 py-3 text-xs font-semibold rounded-md transition ${config.activeStyle.id === preset.id ? 'bg-sky-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">5. Configure & Generate</h2>
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Number of images to generate:</p>
                <div className="flex items-center space-x-4">
                    <input type="range" min="1" max="10" value={config.imageCount} onChange={(e) => config.onImageCountChange(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                    <span className="font-bold text-lg text-sky-400 w-8 text-center">{config.imageCount}</span>
                </div>
                <NegativePromptInput value={negativePrompt} onChange={setNegativePrompt} />
            </div>
        </div>
        <div>
            <button onClick={handleGenerate} disabled={config.isGenerationDisabled} className="w-full flex items-center justify-center px-6 py-3 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
                {config.isLoading ? (
                    <>
                        <SpinnerIcon />
                        Generating...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
                        Generate Photoshoot
                    </>
                )}
            </button>
        </div>
    </div>
    );
};

const RetouchControls = ({ config }) => {
    const [prompt, setPrompt] = React.useState('');
    const [negativePrompt, setNegativePrompt] = React.useState('');
    const [replaceBgPrompt, setReplaceBgPrompt] = React.useState('');
    
    const handleBackgroundTool = (tool: 'remove' | 'replace' | 'extend') => {
        let toolPrompt = '';
        switch(tool) {
            case 'remove':
                toolPrompt = 'Remove the background completely, leaving only the main subject with a fully transparent background. Output as a PNG with alpha transparency.';
                break;
            case 'extend':
                toolPrompt = 'Extend the background of the image naturally, keeping the subject centered. This is also known as "outpainting".';
                break;
            case 'replace':
                if (!replaceBgPrompt) return; // Don't do anything if the prompt is empty
                toolPrompt = `Replace the background with: "${replaceBgPrompt}". Keep the foreground subject exactly the same.`;
                break;
        }
        config.onRetouchClick(toolPrompt, negativePrompt);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">1. Select Image</h2>
                <p className="text-sm text-gray-400 mb-2">Upload or select an image to edit or draw on.</p>
                <FileUpload {...config.commonFileProps} />
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">2. AI Background Tools</h2>
                <div className="space-y-2">
                    <button onClick={() => handleBackgroundTool('remove')} disabled={config.isRetouchDisabled} className="w-full text-sm text-center py-2 px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition">Remove Background</button>
                     <button onClick={() => handleBackgroundTool('extend')} disabled={config.isRetouchDisabled} className="w-full text-sm text-center py-2 px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition">Extend Background</button>
                    <div className="relative flex gap-2">
                        <input type="text" value={replaceBgPrompt} onChange={e => setReplaceBgPrompt(e.target.value)} placeholder="A new background..." className="w-full text-sm bg-gray-900 border-2 border-gray-600 rounded-md p-2 focus:ring-sky-500 pr-8"/>
                        {replaceBgPrompt && (
                             <button onClick={() => setReplaceBgPrompt('')} className="absolute top-2 right-20 p-1 text-gray-500 hover:text-white" aria-label="Clear background prompt"><CloseIcon className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => handleBackgroundTool('replace')} disabled={config.isRetouchDisabled || !replaceBgPrompt} className="px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition text-sm">Replace</button>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">3. Describe Custom Edit</h2>
                <div className="space-y-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Change shirt to blue'"
                            className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition pr-8"
                        />
                        {prompt && (
                             <button onClick={() => setPrompt('')} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white" aria-label="Clear edit prompt"><CloseIcon className="w-4 h-4" /></button>
                        )}
                    </div>
                    <NegativePromptInput value={negativePrompt} onChange={setNegativePrompt} />
                </div>
            </div>
            <div>
                 <button onClick={() => {config.onRetouchClick(prompt, negativePrompt); setPrompt('');}} disabled={config.isRetouchDisabled || !prompt} className="w-full flex items-center justify-center px-6 py-3 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
                    {config.isLoading ? (
                        <>
                            <SpinnerIcon />
                            Applying...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                            Apply Custom Edit
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const BatchControls = ({ config }) => {
    const [prompt, setPrompt] = React.useState('');
    const [negativePrompt, setNegativePrompt] = React.useState('');
    const [replaceBgPrompt, setReplaceBgPrompt] = React.useState('');

    const handleBackgroundTool = (tool: 'remove' | 'replace' | 'extend') => {
        let toolPrompt = '';
        switch(tool) {
            case 'remove':
                toolPrompt = 'Remove the background completely, leaving only the main subject with a fully transparent background. Output as a PNG with alpha transparency.';
                break;
            case 'extend':
                toolPrompt = 'Extend the background of the image naturally, keeping the subject centered. This is also known as "outpainting".';
                break;
            case 'replace':
                if (!replaceBgPrompt) return;
                toolPrompt = `Replace the background with: "${replaceBgPrompt}". Keep the foreground subject exactly the same.`;
                break;
        }
        config.onBatchProcess(toolPrompt, negativePrompt);
    };

    return (
         <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">1. Upload Batch</h2>
                <p className="text-sm text-gray-400 mb-2">Upload all images you want to process with the same instruction.</p>
                <FileUpload {...config.commonFileProps} onRemoveAllFiles={config.commonFileProps.onRemoveAllFiles} />
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">2. Select Batch Action</h2>
                <div className="space-y-3">
                    <h3 className="text-md font-semibold text-gray-300">AI Background Tools</h3>
                    <div className="space-y-2">
                        <button onClick={() => handleBackgroundTool('remove')} disabled={config.isBatchDisabled} className="w-full text-sm text-center py-2 px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition">Remove Background</button>
                        <button onClick={() => handleBackgroundTool('extend')} disabled={config.isBatchDisabled} className="w-full text-sm text-center py-2 px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition">Extend Background</button>
                        <div className="relative flex gap-2">
                            <input type="text" value={replaceBgPrompt} onChange={e => setReplaceBgPrompt(e.target.value)} placeholder="A new background..." className="w-full text-sm bg-gray-900 border-2 border-gray-600 rounded-md p-2 focus:ring-sky-500 pr-8"/>
                            {replaceBgPrompt && (
                                <button onClick={() => setReplaceBgPrompt('')} className="absolute top-2 right-20 p-1 text-gray-500 hover:text-white" aria-label="Clear background prompt"><CloseIcon className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => handleBackgroundTool('replace')} disabled={config.isBatchDisabled || !replaceBgPrompt} className="px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition text-sm">Replace</button>
                        </div>
                    </div>
                 </div>
                 <div className="mt-4 space-y-2">
                    <h3 className="text-md font-semibold text-gray-300">Custom Edit Instruction</h3>
                    <div className="relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Make the image black and white'"
                            className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition pr-8"
                        />
                         {prompt && (
                             <button onClick={() => setPrompt('')} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white" aria-label="Clear batch prompt"><CloseIcon className="w-4 h-4" /></button>
                        )}
                    </div>
                 </div>
            </div>
             <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">3. Configure & Process</h2>
                <div className="space-y-4">
                    <NegativePromptInput value={negativePrompt} onChange={setNegativePrompt} />
                    <button onClick={() => config.onBatchProcess(prompt, negativePrompt)} disabled={config.isBatchDisabled || !prompt} className="w-full flex items-center justify-center px-6 py-3 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
                       {config.isLoading ? (
                           <>
                             <SpinnerIcon />
                             {`Processing... (${Math.round(config.batchProgress)}%)`}
                           </>
                       ) : (
                           <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>
                            Process Batch ({config.commonFileProps.uploadedFiles.length} images)
                           </>
                       )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ isActive, onClick, children }) => (
    <button onClick={onClick} className={`flex-1 py-3 text-sm font-bold border-b-4 transition-all duration-200 ${isActive ? 'text-sky-400 border-sky-400' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'}`}>
        {children}
    </button>
);


export default function ControlPanel({
  activeTab,
  onTabChange,
  onFilesSelect,
  onFileSelect,
  onFileRemove,
  onRemoveAllFiles,
  onImageEditRequest,
  uploadedFiles,
  selectedFileIndices,
  onShowToast,
  studioConfig,
  retouchConfig,
  batchConfig
}) {

  const commonFileProps = {
    onFilesSelect,
    uploadedFiles,
    selectedFileIndices,
    onFileSelect,
    onFileRemove,
    onImageEditRequest,
  };
  
  const TABS: Record<ActiveTab, React.ReactNode> = {
      studio: <StudioControls config={{...studioConfig, commonFileProps, onShowToast}} />,
      retouch: <RetouchControls config={{...retouchConfig, commonFileProps}} />,
      batch: <BatchControls config={{...batchConfig, commonFileProps: {...commonFileProps, onRemoveAllFiles }}} />,
  };

  return (
    <div className="bg-[#161B22]/80 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex mb-6 border-b border-gray-700">
        <TabButton isActive={activeTab === 'studio'} onClick={() => onTabChange('studio')}>Studio</TabButton>
        <TabButton isActive={activeTab === 'retouch'} onClick={() => onTabChange('retouch')}>Retouch</TabButton>
        <TabButton isActive={activeTab === 'batch'} onClick={() => onTabChange('batch')}>Batch</TabButton>
      </div>
      {TABS[activeTab]}
    </div>
  );
}