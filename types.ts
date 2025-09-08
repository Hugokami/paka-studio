export interface UploadedFile {
    file: File;
    base64: string;
}

export interface EditingImage {
    file: UploadedFile;
    src: string;
}

export type ActiveTab = 'studio' | 'retouch' | 'batch';

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