import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        if (mounted) {
          setError("Could not access camera. Please check permissions.");
          console.error(err);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        // Get lower quality/resolution to speed up API processing if needed, 
        // but 0.8 jpeg is usually fine.
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 bg-black overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-white px-4 text-center">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* XR Overlay UI Hints */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white/50 rounded-lg flex items-center justify-center">
             <span className="text-white/70 text-sm bg-black/50 px-2 py-1 rounded">Point at object</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          <X size={24} />
        </button>

        <button 
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors shadow-lg active:scale-95"
          aria-label="Take Picture"
        >
          <div className="w-16 h-16 rounded-full border-2 border-white/20"></div>
        </button>

        <div className="w-12"></div> {/* Spacer for alignment */}
      </div>
    </div>
  );
};

export default CameraView;