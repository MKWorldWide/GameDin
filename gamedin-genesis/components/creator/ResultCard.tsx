import React from 'react';
import { GeneratedConcept } from '../../types';

interface ResultCardProps {
    result: GeneratedConcept;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
    return (
        <div className="bg-primary border border-secondary rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-2">
                    <img 
                        src={result.imageUrl} 
                        alt={`Generated concept art for ${result.name}`}
                        className="w-full h-full object-cover aspect-[3/4]"
                    />
                </div>
                <div className="md:col-span-3 p-6 flex flex-col">
                    <h3 className="text-3xl font-bold text-accent tracking-tight">{result.name}</h3>
                    <div className="mt-4 text-secondary whitespace-pre-wrap overflow-y-auto" style={{maxHeight: '400px'}}>
                        {result.description}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
