import { GoogleGenAI, Modality } from "@google/genai";
import { UploadedFile, ReferenceConfig } from "../types";

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const constructNegativePromptSegment = (negativePrompt: string): string => {
    return negativePrompt ? `\n\nIMPORTANT: The final image must NOT contain any of the following elements under any circumstances: "${negativePrompt}".` : '';
}

export const generateImages = async (
    sourceFiles: UploadedFile[],
    prompt: string,
    stylePrompt: string,
    negativePrompt: string,
    count: number,
    referenceConfig?: ReferenceConfig
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
    
    // Add reference image if it exists
    if (referenceConfig?.file) {
        imageParts.push({
            inlineData: {
                data: referenceConfig.file.base64,
                mimeType: referenceConfig.file.file.type,
            },
        });
    }

    let baseInstruction: string;

    if (referenceConfig?.file && referenceConfig.aspects.length > 0) {
        const aspectsText = referenceConfig.aspects.join(', ');
        const subjectDescription = sourceFiles.length > 0 
            ? "the provided subject image(s)" 
            : "the subject described in the text prompt";
        
        baseInstruction = `You are a master digital artist following precise instructions. Create a new image based on ${subjectDescription}. You are also provided with a separate guide image. You MUST use the guide image ONLY for the following aspects: **${aspectsText}**. Apply these aspects to the subject. DO NOT copy the subject or any other unrequested elements from the guide image. The main creative instruction is: "${prompt}".`;
        
        if (sourceFiles.length > 0) {
            baseInstruction += `\n\nCrucially, you must preserve the identity, facial features, and key characteristics of any people present in the subject image(s). Apply the prompt's instructions and the guide's aspects while maintaining the person's likeness.`;
        }
    } else {
        if (sourceFiles.length > 0) {
            const consistencyInstruction = `Crucially, you must preserve the identity, facial features, and key characteristics of any people present in the reference image(s). Apply the prompt's instructions while maintaining the person's likeness.`;
            baseInstruction = `You are a master digital artist. Create a new image based on the provided reference image(s) and the following instructions: "${prompt}". It's important to blend the elements from the reference images as described. ${consistencyInstruction}`;
        } else {
            baseInstruction = `You are a master digital artist. Create a new image based *only* on the following text description: "${prompt}".`;
        }
    }


    const generationPromises = Array(count).fill(0).map((_, i) => {
        const variationInstruction = `For this specific image (variation ${i + 1} of ${count}), create a unique version. Focus on a different pose, camera angle, expression or lighting compared to other generations.`;
        const generationInstruction = `${baseInstruction} ${variationInstruction} ${stylePrompt}.${negativePromptSegment}`;
        
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
        });
    });

    const responses = await Promise.all(generationPromises);

    return responses.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
            const textPart = response.candidates?.[0]?.content?.parts.find(part => part.text);
            const errorMessage = textPart?.text ? `AI failed to generate an image. Reason: ${textPart.text}` : "AI failed to generate an image. An unknown error occurred.";
            console.warn(errorMessage);
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
    const consistencyInstruction = `Maintain the original image's quality, lighting, and composition as much as possible, only changing what is requested in the prompt.`;
    const finalPrompt = `You are an expert photo editor. Your task is to edit the provided image based *only* on the following instruction: "${prompt}". It is crucial that you DO NOT change the subject's identity, facial features, body shape, or any other aspect of the image that is not explicitly mentioned in the instruction. The final image must be a realistic modification of the original. ${consistencyInstruction}${negativePromptSegment}`;

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
    return `data:${imageMimeType};base64,${base64ImageBytes}`;
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

export const enhancePrompt = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `You are a world-class AI prompt engineer for visual synthesis models. Your task is to elevate a user's simple prompt into a masterpiece of descriptive detail.
Principles:
1. Deconstruct the user's prompt to understand the core subject, action, and setting.
2. The original intent and subject MUST be preserved. Do not change them.
3. Enrich with photographic concepts: Specify lighting (e.g., 'golden hour', 'dramatic Rembrandt lighting'), composition (e.g., 'rule of thirds', 'dutch angle'), and camera/lens details (e.g., '85mm f/1.4 lens', 'shallow depth of field').
4. Evoke emotion and style: Add keywords for mood and artistic style (e.g., 'ethereal fantasy', 'gritty cyberpunk noir', 'hyperrealistic 8k').
5. Output ONLY the final, enhanced prompt string. No conversational text or explanations.

Example:
User: "photo of a woman in a red dress"
You: "Golden hour portrait of a woman in a flowing scarlet red dress, captured with a Canon EOS R5 and an 85mm f/1.2 lens, shallow depth of field, cinematic lighting, soft focus on the background, hyperrealistic, intricate detail, 8k."

Now, process the following user prompt.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        },
    });
    
    const enhancedPrompt = response.text.trim();
    if (!enhancedPrompt) {
        throw new Error("The AI failed to enhance the prompt. The response was empty.");
    }

    return enhancedPrompt;
};