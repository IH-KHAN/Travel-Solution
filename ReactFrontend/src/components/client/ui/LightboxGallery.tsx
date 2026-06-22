import React from 'react';
import { ChevronLeft, ArrowRight, X } from 'lucide-react';

export interface LightboxGalleryProps {
  images: string[];
  index: number;
  onClose: () => void;
  onNav: (index: number) => void;
}

export const LightboxGallery: React.FC<LightboxGalleryProps> = ({ images, index, onClose, onNav }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
        <X size={20} />
      </button>
      <button
        onClick={() => onNav(Math.max(0, index - 1))}
        className="absolute left-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-30 transition-colors"
        disabled={index === 0}>
        <ChevronLeft size={22} />
      </button>
      <img src={images[index]} alt="" className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain animate-in fade-in duration-300" />
      <button
        onClick={() => onNav(Math.min(images.length - 1, index + 1))}
        className="absolute right-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-30 transition-colors"
        disabled={index === images.length - 1}>
        <ArrowRight size={22} />
      </button>
      <p className="absolute bottom-6 text-white/60 text-sm font-medium">{index + 1} / {images.length}</p>
    </div>
  );
};

export default LightboxGallery;
