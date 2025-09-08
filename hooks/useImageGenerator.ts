import { useReducer, useCallback } from 'react';
import { generateImages, editImage } from '../services/geminiService';
import { UploadedFile, ReferenceConfig } from '../types';

type BatchResult = {
    original: UploadedFile;
    result: string;
    status: 'success' | 'error';
    error?: string;
}

type GeneratorState = {
  describedPrompt: string;
  generatedImages: string[];
  editedImage: { original: UploadedFile, result: string } | null;
  batchResults: BatchResult[];
  isLoadingGeneration: boolean;
  isLoadingEditing: boolean;
  isLoadingBatch: boolean;
  batchProgress: number;
  regeneratingIndex: number | null;
  error: string | null;
};

type Action = 
  | { type: 'SET_PROMPT', payload: string }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS', payload: string[] }
  | { type: 'GENERATE_ERROR', payload: string }
  | { type: 'EDIT_START' }
  | { type: 'EDIT_SUCCESS', payload: { original: UploadedFile, result: string } }
  | { type: 'EDIT_ERROR', payload: string }
  | { type: 'BATCH_START' }
  | { type: 'BATCH_PROGRESS', payload: { result: BatchResult, progress: number } }
  | { type: 'BATCH_SUCCESS' }
  | { type: 'BATCH_ERROR', payload: string }
  | { type: 'REGENERATE_START', payload: number }
  | { type: 'REGENERATE_SUCCESS', payload: { index: number, image: string } }
  | { type: 'REGENERATE_ERROR', payload: string }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'CLEAR_ERROR' };

const initialState: GeneratorState = {
  describedPrompt: '',
  generatedImages: [],
  editedImage: null,
  batchResults: [],
  isLoadingGeneration: false,
  isLoadingEditing: false,
  isLoadingBatch: false,
  batchProgress: 0,
  regeneratingIndex: null,
  error: null,
};

const clearResultsState = {
    generatedImages: [],
    editedImage: null,
    batchResults: [],
    error: null,
    batchProgress: 0,
    regeneratingIndex: null,
}

function generatorReducer(state: GeneratorState, action: Action): GeneratorState {
  switch (action.type) {
    case 'SET_PROMPT':
      return { ...state, describedPrompt: action.payload };
    case 'GENERATE_START':
      return { ...state, ...clearResultsState, isLoadingGeneration: true };
    case 'GENERATE_SUCCESS':
      return { ...state, isLoadingGeneration: false, generatedImages: action.payload };
    case 'GENERATE_ERROR':
      return { ...state, isLoadingGeneration: false, error: action.payload };
    case 'EDIT_START':
        return { ...state, ...clearResultsState, isLoadingEditing: true };
    case 'EDIT_SUCCESS':
        return { ...state, isLoadingEditing: false, editedImage: action.payload };
    case 'EDIT_ERROR':
        return { ...state, isLoadingEditing: false, error: action.payload };
    case 'BATCH_START':
        return { ...state, ...clearResultsState, isLoadingBatch: true };
    case 'BATCH_PROGRESS':
        return { ...state, batchResults: [...state.batchResults, action.payload.result], batchProgress: action.payload.progress };
    case 'BATCH_SUCCESS':
        return { ...state, isLoadingBatch: false };
    case 'BATCH_ERROR':
        return { ...state, isLoadingBatch: false, error: action.payload };
    case 'REGENERATE_START':
        return { ...state, regeneratingIndex: action.payload, error: null };
    case 'REGENERATE_SUCCESS':
        const newImages = [...state.generatedImages];
        newImages[action.payload.index] = action.payload.image;
        return { ...state, generatedImages: newImages, regeneratingIndex: null };
    case 'REGENERATE_ERROR':
        return { ...state, regeneratingIndex: null, error: action.payload };
    case 'CLEAR_RESULTS':
        return { ...state, ...clearResultsState };
    case 'CLEAR_ERROR':
        return { ...state, error: null };
    default:
      return state;
  }
}

export const useImageGenerator = () => {
  const [state, dispatch] = useReducer(generatorReducer, initialState);

  const handleError = (e: unknown, type: 'GENERATE' | 'EDIT' | 'BATCH' | 'REGENERATE') => {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error(e);
    dispatch({ type: `${type}_ERROR`, payload: errorMessage } as any);
  };
  
  const clearResults = useCallback(() => {
    dispatch({ type: 'CLEAR_RESULTS' });
  }, []);
  
  const setDescribedPrompt = useCallback((prompt: string) => {
      dispatch({ type: 'SET_PROMPT', payload: prompt });
  }, []);

  const generateNewImages = useCallback(async (sourceFiles: UploadedFile[], prompt: string, stylePrompt: string, negativePrompt: string, count: number, referenceConfig?: ReferenceConfig) => {
    dispatch({ type: 'GENERATE_START' });
    try {
      const images = await generateImages(sourceFiles, prompt, stylePrompt, negativePrompt, count, referenceConfig);
      dispatch({ type: 'GENERATE_SUCCESS', payload: images });
    } catch (e) {
      handleError(e, 'GENERATE');
    }
  }, []);

  const editExistingImage = useCallback(async (file: UploadedFile, prompt: string, negativePrompt: string) => {
      dispatch({ type: 'EDIT_START' });
      try {
        const result = await editImage(file.base64, file.file.type, prompt, negativePrompt);
        dispatch({ type: 'EDIT_SUCCESS', payload: { original: file, result } });
      } catch (e) {
        handleError(e, 'EDIT');
      }
  }, []);

  const processBatch = useCallback(async (files: UploadedFile[], prompt: string, negativePrompt: string) => {
    dispatch({ type: 'BATCH_START' });
    const totalFiles = files.length;
    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        try {
            const result = await editImage(file.base64, file.file.type, prompt, negativePrompt);
            dispatch({ type: 'BATCH_PROGRESS', payload: { result: { original: file, result, status: 'success' }, progress: (i + 1) / totalFiles * 100 } });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            dispatch({ type: 'BATCH_PROGRESS', payload: { result: { original: file, result: '', status: 'error', error: errorMessage }, progress: (i + 1) / totalFiles * 100 } });
        }
    }
    dispatch({ type: 'BATCH_SUCCESS' });
  }, []);

  const regenerateSingleImage = useCallback(async (index: number, config: any) => {
    dispatch({ type: 'REGENERATE_START', payload: index });
    try {
        const { sourceFiles, prompt, stylePrompt, negativePrompt, referenceConfig } = config;
        const images = await generateImages(sourceFiles, prompt, stylePrompt, negativePrompt, 1, referenceConfig);
        if (images.length > 0) {
            dispatch({ type: 'REGENERATE_SUCCESS', payload: { index, image: images[0] } });
        } else {
            throw new Error("AI failed to regenerate the image.");
        }
    } catch (e) {
        handleError(e, 'REGENERATE');
    }
}, []);

  return { state, setDescribedPrompt, generateNewImages, editExistingImage, processBatch, regenerateSingleImage, clearResults };
};