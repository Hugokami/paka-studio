export interface UploadedFile {
    file: File;
    base64: string;
}

export interface EditingImage {
    file: UploadedFile;
    src: string;
}

export type ActiveTab = 'studio' | 'retouch' | 'batch';

export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export type StylePreset = 
    | { id: 'none', name: 'None' }
    | { id: 'photorealistic', name: 'Photorealistic' }
    | { id: 'cinematic', name: 'Cinematic' }
    | { id: 'vintage', name: 'Vintage Film' }
    | { id: 'analog', name: 'Analog' }
    | { id: 'bw', name: 'Black & White' }
    | { id: 'product', name: 'Product Shot' }
    | { id: 'fantasy', name: 'Fantasy Art' }
    | { id: 'cyberpunk', name: 'Cyberpunk' }
    | { id: 'watercolor', name: 'Watercolor' }
    | { id: '3d', name: '3D Render' };

export type ReferenceAspect = 'pose' | 'style' | 'outfit' | 'background' | 'color' | 'composition';

export interface ReferenceConfig {
    file: UploadedFile;
    aspects: ReferenceAspect[];
}
