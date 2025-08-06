import React from 'react';
import { GeneratedConcept } from '../../types';
import ResultCard from '../creator/ResultCard';

interface ConceptDetailModalProps {
  concept: GeneratedConcept | null;
  onClose: () => void;
}

const ConceptDetailModal: React.FC<ConceptDetailModalProps> = ({ concept, onClose }) => {
  if (!concept) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex-grow overflow-y-auto">
            <ResultCard result={concept} />
        </div>
         <div className="p-3 bg-tertiary/50 text-right border-t border-primary">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-tertiary text-primary hover:bg-border-primary transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ConceptDetailModal;
