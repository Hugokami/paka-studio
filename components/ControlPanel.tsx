import React from 'react';
import FileUpload from './FileUpload';
import { ActiveTab, StylePreset } from '../types';

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

const NegativePromptInput = ({ value, onChange }) => (
    <div>
        <label className="text-sm font-medium text-gray-400">Negative Prompt (what to avoid)</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., text, watermarks, extra limbs"
            className="mt-1 w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
    </div>
);

const StudioControls = ({ config }) => {
    const [negativePrompt, setNegativePrompt] = React.useState('');

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
        config.onGenerateClick(userPrompt, stylePrompt, negativePrompt);
    };

    return (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">1. Upload Photo(s)</h2>
             <p className="text-sm text-gray-400 mb-2">Select one or more images to use as references.</p>
            <FileUpload {...config.commonFileProps} />
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">2. Write Prompt</h2>
            <p className="text-sm text-gray-400 mb-2">Describe the final image. If using multiple images, refer to them in the order they were selected (e.g., "person from image 1 wearing outfit from image 2").</p>
             <div className="relative">
                <textarea
                    value={config.describedPrompt || ''}
                    onChange={(e) => config.onDescribedPromptChange(e.target.value)}
                    placeholder={config.isLoading ? "Analyzing image..." : "e.g., A photo of the subject smiling"}
                    rows={4}
                    className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    disabled={config.isLoading}
                />
                {config.isLoading && <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-dashed rounded-full animate-spin border-sky-400"></div>}
            </div>
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-100">3. Select Style</h2>
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
            <h2 className="text-xl font-semibold mb-2 text-gray-100">4. Configure & Generate</h2>
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
                Generate Photoshoot
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
                    <div className="flex gap-2">
                        <input type="text" value={replaceBgPrompt} onChange={e => setReplaceBgPrompt(e.target.value)} placeholder="A new background..." className="w-full text-sm bg-gray-900 border-2 border-gray-600 rounded-md p-2 focus:ring-sky-500"/>
                        <button onClick={() => handleBackgroundTool('replace')} disabled={config.isRetouchDisabled || !replaceBgPrompt} className="px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition text-sm">Replace</button>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">3. Describe Custom Edit</h2>
                <div className="space-y-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'Change shirt to blue'"
                        className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    />
                    <NegativePromptInput value={negativePrompt} onChange={setNegativePrompt} />
                </div>
            </div>
            <div>
                 <button onClick={() => {config.onRetouchClick(prompt, negativePrompt); setPrompt('');}} disabled={config.isRetouchDisabled || !prompt} className="w-full flex items-center justify-center px-6 py-3 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                    Apply Custom Edit
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
                        <div className="flex gap-2">
                            <input type="text" value={replaceBgPrompt} onChange={e => setReplaceBgPrompt(e.target.value)} placeholder="A new background..." className="w-full text-sm bg-gray-900 border-2 border-gray-600 rounded-md p-2 focus:ring-sky-500"/>
                            <button onClick={() => handleBackgroundTool('replace')} disabled={config.isBatchDisabled || !replaceBgPrompt} className="px-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition text-sm">Replace</button>
                        </div>
                    </div>
                 </div>
                 <div className="mt-4 space-y-2">
                    <h3 className="text-md font-semibold text-gray-300">Custom Edit Instruction</h3>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'Make the image black and white'"
                        className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    />
                 </div>
            </div>
             <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-100">3. Configure & Process</h2>
                <div className="space-y-4">
                    <NegativePromptInput value={negativePrompt} onChange={setNegativePrompt} />
                    <button onClick={() => config.onBatchProcess(prompt, negativePrompt)} disabled={config.isBatchDisabled || !prompt} className="w-full flex items-center justify-center px-6 py-3 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>
                        Process Batch ({config.commonFileProps.uploadedFiles.length} images)
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
      studio: <StudioControls config={{...studioConfig, commonFileProps}} />,
      retouch: <RetouchControls config={{...retouchConfig, commonFileProps}} />,
      batch: <BatchControls config={{...batchConfig, commonFileProps: {...commonFileProps, onRemoveAllFiles }}} />,
  };

  return (
    <div className="bg-[#161B22]/80 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex mb-6 border-b border-gray-700">
        <TabButton isActive={activeTab === 'studio'} onClick={() => onTabChange('studio')}>Studio</TabButton>
        <TabButton isActive={activeTab === 'retouch'} onClick={() => onTabChange('retouch')}>Retouch</TabButton>
        {/* FIX: Corrected typo from TabB to TabButton and completed the component */}
        <TabButton isActive={activeTab === 'batch'} onClick={() => onTabChange('batch')}>Batch</TabButton>
      </div>
      {TABS[activeTab]}
    </div>
  );
}
