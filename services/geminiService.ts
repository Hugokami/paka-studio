import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
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

function getErrorMessageFromResponse(response: GenerateContentResponse, fallbackMessage: string): string {
    if (response.promptFeedback?.blockReason) {
        let message = `Request blocked: ${response.promptFeedback.blockReason}.`;
        const harmfulCategories = response.promptFeedback.safetyRatings
            ?.filter(r => ['MEDIUM', 'HIGH'].includes(r.probability))
            .map(r => r.category.replace('HARM_CATEGORY_', '').toLowerCase())
            .join(', ');
        if (harmfulCategories) {
            message += ` Detected categories: ${harmfulCategories}. Please adjust your prompt.`;
        }
        return message;
    }

    const textPart = response.candidates?.[0]?.content?.parts.find(part => part.text);
    if (textPart?.text) {
        return `AI failure: ${textPart.text}`;
    }

    return fallbackMessage;
}


export const generateImages = async (
    sourceFiles: UploadedFile[],
    prompt: string,
    stylePrompt: string,
    negativePrompt: string,
    count: number,
    aspectRatio: string,
    referenceConfig?: ReferenceConfig,
    seed?: number
): Promise<string[]> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-image-preview';
    const negativePromptSegment = constructNegativePromptSegment(negativePrompt);
    const aspectRatioSegment = aspectRatio !== '1:1' ? `\n\nThe final image MUST have a precise aspect ratio of ${aspectRatio}.` : '';

    const imageParts = sourceFiles.map(file => ({
        inlineData: {
            data: file.base64,
            mimeType: file.file.type,
        },
    }));
    
    // Add reference image if it exists, it will always be the last image
    if (referenceConfig?.file) {
        imageParts.push({
            inlineData: {
                data: referenceConfig.file.base64,
                mimeType: referenceConfig.file.file.type,
            },
        });
    }

    let baseInstruction: string;

    if (referenceConfig?.file && referenceConfig.aspects.length > 0 && sourceFiles.length > 0) {
        // Case: Both subject image(s) and a guide image are provided. This requires very specific instructions.
        const aspectsText = referenceConfig.aspects.join(', ');
        
        baseInstruction = `You are a master digital artist following extremely precise instructions. Your task is to create a new image. You have been provided with several images and a text prompt. Follow these steps exactly:
        
1.  **Identify Roles:** You have received multiple images.
    -   The **Subject Image(s):** The FIRST image(s) in the set are the main subject(s).
    -   The **Guide Image:** The VERY LAST image in the set is a guide image for reference ONLY.

2.  **Analyze Subject:** Look at the Subject Image(s). You MUST use the person, people, or objects from these images as the core subject of the final output. It is critical to preserve their exact identity, facial features, and key characteristics.

3.  **Analyze Guide:** Look at the Guide Image. You must ONLY use this image as a reference for the following specific aspects: **${aspectsText}**.

4.  **Synthesize:** Create a new image by applying the specified aspects (${aspectsText}) from the Guide Image to the subject(s) from the Subject Image(s). The overall theme and action should follow the main creative instruction: "${prompt}".

**CRITICAL RULES - NON-NEGOTIABLE:**
-   **NEVER** copy the face, identity, or any person from the guide image into the final result. The Guide Image is for reference ONLY.
-   The final image's subject **MUST** be the one from the Subject Image(s), not the guide.
-   If the guide is used for 'pose', replicate the pose on the subject from the Subject Image.
-   If the guide is used for 'outfit', put the outfit on the subject from the Subject Image.`;
        
    } else if (referenceConfig?.file && referenceConfig.aspects.length > 0) {
        // Case: A guide image is provided, but the subject comes from the text prompt alone.
        const aspectsText = referenceConfig.aspects.join(', ');
        baseInstruction = `You are a master digital artist. Create a new image based *only* on the following text description: "${prompt}". You are also provided with a guide image. You MUST use the guide image ONLY for the following aspects: **${aspectsText}**. Apply these aspects to the subject described in the text prompt.`;

    } else {
        // Case: No guide image is used. Standard generation.
        if (sourceFiles.length > 0) {
            const consistencyInstruction = `Crucially, you must preserve the identity, facial features, and key characteristics of any people present in the reference image(s). Apply the prompt's instructions while maintaining the person's likeness.`;
            baseInstruction = `You are a master digital artist. Create a new image based on the provided reference image(s) and the following instructions: "${prompt}". It's important to blend the elements from the reference images as described. ${consistencyInstruction}`;
        } else {
            baseInstruction = `You are a master digital artist. Create a new image based *only* on the following text description: "${prompt}".`;
        }
    }


    const generationPromises = Array(count).fill(0).map((_, i) => {
        const variationInstruction = `For this specific image (variation ${i + 1} of ${count}), create a unique version. Focus on a different pose, camera angle, expression or lighting compared to other generations.`;
        const generationInstruction = `${baseInstruction} ${variationInstruction} ${stylePrompt}.${negativePromptSegment}${aspectRatioSegment}`;
        
        const config: any = {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        };
        if (seed) {
            config.seed = seed;
        }

        return ai.models.generateContent({
            model,
            contents: {
                parts: [
                    ...imageParts,
                    { text: generationInstruction },
                ],
            },
            config,
        });
    });

    const responses = await Promise.all(generationPromises);

    return responses.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
            const errorMessage = getErrorMessageFromResponse(response, "AI failed to generate an image. An unknown error occurred.");
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
        const errorMessage = getErrorMessageFromResponse(response, "AI failed to edit the image. Please try a different prompt.");
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
    
    const prompt = `You are a professional photo restoration and upscaling AI. Your task is to upscale the provided image.
Key objectives:
1. **Enhance Resolution:** Intelligently increase the image's resolution, aiming for a 2x to 4x size increase, but prioritize quality over sheer size. The final image should look natural.
2. **Improve Micro-details:** Sharpen and clarify fine details like skin texture, fabric weaves, hair strands, and distant environmental elements without introducing artificial artifacts. The goal is to restore detail, not to create a fake, over-sharpened look.
3. **Denoise and Clean:** Subtly remove any compression artifacts or digital noise from the original image.
4. **Preserve Identity:** It is absolutely critical to maintain the original composition, colors, lighting, and the identity of any subjects. DO NOT add, remove, or change any elements of the image content. The output must be a cleaner, sharper, and more detailed version of the input image.`;

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
        const errorMessage = getErrorMessageFromResponse(response, "AI failed to upscale the image. An unknown error occurred.");
        throw new Error(errorMessage);
    }

    const base64ImageBytes = imagePart.inlineData.data;
    const imageMimeType = imagePart.inlineData.mimeType;
    return `data:${imageMimeType};base64,${base64ImageBytes}`;
};

export async function* enhancePromptStream(prompt: string) {
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

    const responseStream = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        },
    });
    
    let text = '';
    for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
            text += chunkText;
            yield chunkText;
        }
    }

    if (!text) {
        throw new Error("The AI failed to enhance the prompt. The response was empty.");
    }
}

export async function* generateCreativePromptStream() {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `You are a creative muse for a digital artist. Your task is to generate a single, compelling, and visually rich prompt for an AI image generator.
    Principles:
    1.  Be concise but descriptive. Aim for 1-2 sentences.
    2.  Combine a clear subject with an interesting action, setting, or style.
    3.  Use evocative adjectives.
    4.  Output ONLY the prompt string. No conversational text, no explanations, no quotation marks.

    Examples:
    -   A photorealistic portrait of an ancient warrior queen, her face etched with the wisdom of a thousand battles, cinematic lighting.
    -   A serene watercolor painting of a floating island in the sky, with waterfalls cascading into the clouds.
    -   A vintage 1970s film photo of a lone astronaut discovering a glowing, alien forest.
    -   Cyberpunk cityscape at night, neon signs reflecting on the wet streets, a mysterious figure in a trench coat in the foreground.

    Now, generate a new, unique prompt.`;

    const responseStream = await ai.models.generateContentStream({
        model,
        contents: "Generate a creative prompt.",
        config: {
            systemInstruction: systemInstruction,
        },
    });

    let text = '';
    for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
            text += chunkText;
            yield chunkText;
        }
    }

    if (!text) {
        throw new Error("The AI failed to generate a prompt. The response was empty.");
    }
};