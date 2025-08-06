
import React from 'react';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  images: string[];
  title: string;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({ isOpen, onClose, onSelect, images, title }) => {
  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center" onClick={onClose}>
      <div 
        className="bg-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-primary pb-3 mb-4">
            <h3 className="text-xl font-bold text-primary">{title}</h3>
            <button onClick={onClose} className="text-secondary hover:text-primary text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-2">
          {images.map((url) => (
            <button key={url} onClick={() => handleSelect(url)} className="aspect-square rounded-lg overflow-hidden ring-2 ring-transparent hover:ring-accent focus:ring-accent transition">
              <img src={url} alt="Selectable image" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
