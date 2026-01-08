
import { forwardRef } from 'react';

interface PosterCanvasProps {
    children: React.ReactNode;
}

// Fixed ratio canvas (Instagram Story / Phone Wallpaper ratio approx 9:16)
export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(({ children }, ref) => {
    return (
        <div
            ref={ref}
            style={{
                width: '1080px',
                height: '1920px',
                position: 'fixed',
                top: '-9999px', // Hide from view but keep renderable
                left: '-9999px',
                background: 'black',
                color: 'white',
                fontFamily: 'Outfit, sans-serif',
                overflow: 'hidden',
                // Any other base styles for the poster
            }}
        >
            {children}
        </div>
    );
});

// A preview wrapper to show a scaled down version in the UI
export const PosterPreviewWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            maxWidth: '300px', // Restrict width
            aspectRatio: '9/16',
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            transform: 'scale(1)',
            pointerEvents: 'none', // Prevent interaction usually
            position: 'relative',
        }}>
            <div style={{
                width: '1080px',
                height: '1920px',
                transformOrigin: 'top left',
                // Calculate scale based on container... this is tricky in CSS alone without JS knowing container width.
                // For MVP Preview, let's just make it "Fit".
                // Actually, let's just render the content responsive? 
                // No, we want WYSIWYG.
                // Simple hack: Scale based on fixed preview size (300px width / 1080px = 0.277)
                transform: 'scale(0.2777)',
            }}>
                {children}
            </div>
        </div>
    );
}

// Actually, re-using the exact same component for both Preview and Export might be tricky if one relies on fixed pixels.
// Let's assume the template is built with fixed pixels (1080p width) and we scale it down for preview.
