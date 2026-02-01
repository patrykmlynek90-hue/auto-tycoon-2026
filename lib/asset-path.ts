// Utility to prefix asset paths with basePath for GitHub Pages deployment
const basePath = process.env.NODE_ENV === 'production' ? '/auto-tycoon-2026' : '';

export function getAssetPath(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath}${normalizedPath}`;
}
