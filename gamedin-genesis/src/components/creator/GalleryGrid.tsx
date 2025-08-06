import React from 'react';
import { GeneratedConcept } from '../../types';

interface GalleryGridProps {
    concepts: GeneratedConcept[];
    onConceptClick: (concept: GeneratedConcept) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ concepts, onConceptClick }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
            {concepts.map(concept => (
                <button 
                    key={concept.id} 
                    onClick={() => onConceptClick(concept)}
                    className="aspect-[3/4] relative group rounded-lg overflow-hidden border-2 border-primary hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                >
                    <img 
                        src={concept.imageUrl} 
                        alt={`Generated artwork for ${concept.name}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                        <p className="text-white text-xs font-bold truncate group-hover:text-accent transition-colors">
                            {concept.name}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default GalleryGrid;