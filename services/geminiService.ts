import { GoogleGenAI, Modality } from "@google/genai";
import { UploadedFile } from "../types";

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const constructNegativePromptSegment = (negativePrompt: string): string => {
    return negativePrompt ? `\n\nIMPORTANT: The final image must NOT contain any of the following elements under any circumstances: "${negativePrompt}".` : '';
}

export const describeImage = async (
    base64ImageData: string,
    mimeType: string,
): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    const prompt = "You are a professional photographer's assistant. Describe the subject of this image in a detailed, factual, and concise manner. This description will be used as a prompt for an AI image generator to recreate the subject. Focus on key visual features like gender, ethnicity, hair style and color, eye color, clothing, and any notable accessories. Do not add creative interpretation. Start the description directly. Example: 'A woman with long blonde hair, blue eyes, wearing a red t-shirt and silver necklace.'";

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType,
                    },
                },
                { text: prompt },
            ],
        },
    });

    return response.text.trim();
};

export const generateImages = async (
    sourceFiles: UploadedFile[],
    prompt: string,
    stylePrompt: string,
    negativePrompt: string,
    count: number
): Promise<string[]> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-image-preview';

    const negativePromptSegment = constructNegativePromptSegment(negativePrompt);
    
    const imageParts = sourceFiles.map(file => ({
        inlineData: {
            data: file.base64,
            mimeType: file.file.type,
        },
    }));

    const generationPromises = Array(count).fill(0).map((_, i) => {
        const variationInstruction = `For this specific image (variation ${i + 1} of ${count}), create a unique version. Focus on a different pose, camera angle, expression or lighting compared to other generations.`;
        const generationInstruction = `${prompt}. ${variationInstruction} ${stylePrompt}.${negativePromptSegment}`;
        
        return ai.models.generateContent({
            model,
            contents: {
                parts: [
                    ...imageParts,
                    { text: generationInstruction },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    });

    const responses = await Promise.all(generationPromises);

    return responses.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
            console.warn("An image generation call failed to return an image.");
            return null; 
        }
        const base64ImageBytes = imagePart.inlineData.data;
        const imageMimeType = imagePart.inlineData.mimeType;
        return `data:${imageMimeType};base64,${base64ImageBytes}`;
    }).filter((img): img is string => img !== null);
};


export const editImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    negativePrompt: string
): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-image-preview';
    
    const negativePromptSegment = constructNegativePromptSegment(negativePrompt);
    const finalPrompt = `${prompt}.${negativePromptSegment}`;

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType,
                    },
                },
                { text: finalPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
        const textPart = response.candidates?.[0]?.content?.parts.find(part => part.text);
        const errorMessage = textPart?.text ? `AI failed to edit the image. Reason: ${textPart.text}` : "AI failed to edit the image. Please try a different prompt.";
        throw new Error(errorMessage);
    }

    const base64ImageBytes = imagePart.inlineData.data;
    const imageMimeType = imagePart.inlineData.mimeType;
    return `data:${imageMimeType};base64,${imageMimeType}`;
};

export const upscaleImage = async (
    base64ImageData: string,
    mimeType: string
): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-image-preview';
    
    const prompt = "Upscale this image to 4x its original resolution. Enhance details and clarity to create a high-quality, high-resolution photograph. Do not add, remove, or change any elements in the original image content. The output must be a more detailed version of the input.";

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType,
                    },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
        const textPart = response.candidates?.[0]?.content?.parts.find(part => part.text);
        const errorMessage = textPart?.text ? `AI failed to upscale the image. Reason: ${textPart.text}` : "AI failed to upscale the image. An unknown error occurred.";
        throw new Error(errorMessage);
    }

    const base64ImageBytes = imagePart.inlineData.data;
    const imageMimeType = imagePart.inlineData.mimeType;
    return `data:${imageMimeType};base64,${base64ImageBytes}`;
};