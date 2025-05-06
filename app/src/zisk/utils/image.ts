import { Avatar } from "@/schema/models/Avatar";
import { Vibrant } from "node-vibrant/browser";

export async function createImageAvatar(file: File): Promise<Avatar> {
    const image = await loadImage(file);
    
    // Resize image to 64x64
    const resizedBase64 = resizeImage(image, 64, 64);

    return {
        kind: 'zisk:avatar',
        content: resizedBase64, // `data:image/png;base64,${resizedBase64}`,
        variant: 'IMAGE',
        primaryColor: '',
    };
}

export async function getPaletteColors(file: File): Promise<string[]> {
    const image = await loadImage(file);
    const colorPaletteBase64 = resizeImage(image, 512, 512);
    
    // Extract color palette
    const palette = await Vibrant.from(colorPaletteBase64).getPalette();
    return [
        palette.Vibrant?.hex ?? '',
        palette.DarkMuted?.hex ?? '',
        palette.DarkVibrant?.hex ?? '',
        palette.LightMuted?.hex ?? '',
        palette.LightVibrant?.hex ?? '',
        palette.Muted?.hex ?? '',
    ].filter(Boolean)
}

async function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Resize and get Base64 data URL
function resizeImage(image: HTMLImageElement, width: number, height: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas context is not available");

    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png")
}
