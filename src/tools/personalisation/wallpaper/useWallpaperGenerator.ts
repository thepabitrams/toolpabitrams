export function useWallpaperGenerator() {
  const generateWallpaper = async (
    color: string,
    width: number,
    height: number,
    fileType: 'png' | 'jpeg' | 'webp'
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mimeType = `image/${fileType}`;
    const quality = 1.0;

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob conversion failed'));
      }, mimeType, quality);
    });
  };

  return { generateWallpaper };
}