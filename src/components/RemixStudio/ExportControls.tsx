
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useState } from 'react';

interface ExportControlsProps {
    targetRef: React.RefObject<HTMLDivElement>;
}

export const ExportControls = ({ targetRef }: ExportControlsProps) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleDownload = async () => {
        if (!targetRef.current) return;

        setIsExporting(true);
        try {
            // Wait a tick to ensure rendering if hidden
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(targetRef.current, {
                useCORS: true,
                scale: 1, // Already 1080p sized
                backgroundColor: '#000', // Ensure background
            });

            const link = document.createElement('a');
            link.download = `portfolio-remix-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to generate poster. See console.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
            <Download size={16} />
            {isExporting ? 'Generating...' : 'Export Poster'}
        </button>
    );
};
