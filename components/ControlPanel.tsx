import React from 'react';
import FileUpload from './FileUpload';
import ReferenceImageUpload from './ReferenceImageUpload';
import { ActiveTab, StylePreset, ReferenceConfig, AspectRatio } from '../types';

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

const ASPECT_RATIOS: { id: AspectRatio, name: string, icon: JSX.Element }[] = [
    { id: '1:1', name: 'Square', icon: <div className="w-5 h-5 border-2 border-current rounded-sm" /> },
    { id: '3:4', name: 'Portrait', icon: <div className="w-4 h-5 border-2 border-current rounded-sm" /> },
    { id: '4:3', name: 'Landscape', icon: <div style={{width: '20px', height: '15px'}} className="border-2 border-current rounded-sm" /> },
    { id: '9:16', name: 'Story', icon: <div style={{width: '11.25px', height: '20px'}} className="border-2 border-current rounded-sm" /> },
    { id: '16:9', name: 'Widescreen', icon: <div style={{width: '20px', height: '11.25px'}} className="border-2 border-current rounded-sm" /> },
];

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CloseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const WandIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
const SurpriseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a15.045 15.045 0 0 1-7.5 0C4.508 19.658 2.25 16.187 2.25 12c0-4.187 2.258-7.658 5.25-8.997V4.5c0-.414.336-.75.75-.75h3.5c.414 0 .75.336.75.75v.503c.128.02.256.042.383.067.218.043.437.09.654.143m0 0c3.18.636 5.62 3.362 5.62 6.535 0 .86-.145 1.68-.403 2.438" /></svg>;
const DiceIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.254 9.254 9 9.563 9h4.874c.309 0 .563.254.563.563v4.874c0 .309-.254.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" /></svg>

export const NegativePromptInput = ({ value, onChange }) => {
    const handleAddNegativePreset = () => {
        const preset = "text, watermark, signature, ugly, deformed, blurry, low quality, bad anatomy, poorly drawn";
        onChange(prev => prev ? `${prev}, ${preset}` : preset);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Negative Prompt (what to avoid)</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e.g., text, watermarks, extra limbs"
                    className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition pr-8"
                />
                {value && (
                     <button onClick={() => onChange('')} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-gray-500 hover:text-white" aria-label="Clear negative prompt"><CloseIcon className="w-4 h-4" /></button>
                )}
            </div>
            <button onClick={handleAddNegativePreset} className="text-xs text-gray-400 hover:text-sky-400 transition">+ Add quality improvement tags</button>
        </div>
    );
}

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="border border-gray-700/80 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 hover:bg-gray-800/50 transition rounded-t-lg">
                <h3 className="text-md font-semibold text-gray-200">{title}</h3>
                <svg className={`w-5 h-5 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && <div className="p-3 border-t border-gray-700/80">{children}</div>}
        </div>
    );
};

const StudioControls = ({ config }) => {
    const [negativePrompt, setNegativePrompt] = React.useState('');
    const [referenceConfig, setReferenceConfig] = React.useState<ReferenceConfig | null>(null);
    const [aiAssistOpen, setAiAssistOpen] = React.useState(false);
    const aiAssistRef = React.useRef(null);

     React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (aiAssistRef.current && !aiAssistRef.current.contains(event.target)) {
                setAiAssistOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const stylePrompts: Record<StylePreset['id'], string> = {
        'none': '', 'photorealistic': 'ultra realistic, 8k, sharp focus, high detail', 'cinematic': 'cinematic movie scene, dramatic lighting, film grain', 'vintage': 'vintage film photograph from the 1970s, desaturated colors, light leaks', 'analog': 'analog film photo, soft focus, warm tones', 'bw': 'high-contrast black and white photograph', 'product': 'professional product shot, clean lighting, isolated on a solid background', 'fantasy': 'digital painting, fantasy art, vibrant, detailed', 'cyberpunk': 'cyberpunk aesthetic, neon lights, futuristic cityscape', 'watercolor': 'watercolor painting, soft edges, paper texture', '3d': '3D render, smooth shading, high-quality character model',
    };

    const handleGenerate = () => {
        const stylePrompt = stylePrompts[config.activeStyle.id] || stylePrompts['none'];
        const userPrompt = config.describedPrompt || '';
        config.onGenerateClick(userPrompt, stylePrompt, negativePrompt, referenceConfig);
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
            <h2 className="text-xl font-semibold mb-2 text-gray-100">Prompt</h2>
            <p className="text-sm text-gray-400 mb-2">Describe the final image. Combine with subjects below or generate from text alone. (Ctrl+Enter to generate)</p>
             <div className="relative">
                <textarea
                    value={config.describedPrompt}
                    onChange={(e) => config.onDescribedPromptChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., A photo of a person smiling, futuristic city."
                    rows={4}
                    className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition pr-10"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2" ref={aiAssistRef}>
                    <button onClick={() => setAiAssistOpen(o => !o)} className="p-1.5 text-gray-400 hover:text-sky-400" aria-label="AI Assist"><WandIcon className="w-5 h-5" /></button>
                     {aiAssistOpen && (
                         <div className="absolute top-8 right-0 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 w-40 animate-fade-in">
                            <button onClick={() => {config.onEnhancePrompt(); setAiAssistOpen(false);}} disabled={config.isEnhancingPrompt || !config.describedPrompt} className="w-full text-left text-sm px-3 py-2 flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50">
                                {config.isEnhancingPrompt ? <SpinnerIcon /> : <WandIcon className="w-4 h-4" />} Enhance
                            </button>
                            <button onClick={() => {config.onSurpriseMe(); setAiAssistOpen(false);}} disabled={config.isGeneratingPrompt} className="w-full text-left text-sm px-3 py-2 flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50">
                                {config.isGeneratingPrompt ? <SpinnerIcon /> : <SurpriseIcon className="w-4 h-4" />} Surprise Me
                            </button>
                         </div>
                     )}
                </div>
            </div>
        </div>

        <div className="space-y-3">
             <CollapsibleSection title="Subject(s)">
                <p className="text-sm text-gray-400 mb-2">Add one or more reference subjects for the AI to combine or modify.</p>
                <FileUpload {...config.commonFileProps} />
             </CollapsibleSection>
             <CollapsibleSection title="Guide Image">
                <p className="text-sm text-gray-400 mb-2">Use a guide image for pose, style, outfit, etc.</p>
                <ReferenceImageUpload onChange={setReferenceConfig} />
            </CollapsibleSection>
             <CollapsibleSection title="Settings" defaultOpen={true}>
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-400 block mb-2">Style</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => config.onStyleChange({id: 'none', name: 'None'})} className={`px-2 py-2 text-xs font-semibold rounded-md transition truncate ${config.activeStyle.id === 'none' ? 'bg-sky-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>None</button>
                            {PRESETS.map(preset => (
                                <button key={preset.id} onClick={() => config.onStyleChange(preset)} className={`px-2 py-2 text-xs font-semibold rounded-md transition truncate ${config.activeStyle.id === preset.id ? 'bg-sky-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-400 block mb-2">Aspect Ratio</label>
                        <div className="grid grid-cols-5 gap-2">
                             {ASPECT_RATIOS.map(ratio => (
                                <button key={ratio.id} onClick={() => config.onAspectRatioChange(ratio.id)} className={`flex flex-col items-center justify-center gap-1 p-2 text-xs font-semibold rounded-md transition ${config.aspectRatio === ratio.id ? 'bg-sky-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} title={ratio.name}>
                                    {ratio.icon}
                                    {ratio.id}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-400 block mb-2">Number of Images</label>
                        <div className="flex items-center space-x-4">
                            <input type="range" min="1" max="10" value={config.imageCount} onChange={(e) => config.onImageCountChange(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                            <span className="font-bold text-lg text-sky-400 w-8 text-center">{config.imageCount}</span>
                        </div>
                    </div>
                    <NegativePromptInput value={negativePrompt} onChange={setNegativePrompt} />
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Advanced Settings">
                <div className="space-y-2">
                    <label htmlFor="seed-input" className="text-sm font-medium text-gray-400">Seed</label>
                    <p className="text-xs text-gray-500">Use the same seed to get more consistent results between generations.</p>
                     <div className="relative flex items-center gap-2">
                        <input
                            id="seed-input"
                            type="number"
                            value={config.seed === undefined ? '' : config.seed}
                            onChange={(e) => config.onSeedChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                            placeholder="A random number"
                            className="w-full bg-gray-900 border-2 border-gray-600 rounded-md p-2 text-sm text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                         <button onClick={() => config.onSeedChange(Math.floor(Math.random() * 1000000))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md" aria-label="Randomize seed">
                            <DiceIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </CollapsibleSection>
        </div>

        <button onClick={handleGenerate} disabled={config.isGenerationDisabled} className="w-full flex items-center justify-center px-6 py-3 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
            {config.isLoading ? (
                <><SpinnerIcon />{`Generating (${config.imageCount})...`}</>
            ) : (
                <><WandIcon className="w-5 h-5 mr-2" />Generate Photoshoot</>
            )}
        </button>
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