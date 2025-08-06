import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateConcept } from '../../services/creator';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import ResultCard from './ResultCard';
import { GeneratedConcept } from '../../types';
import { SparklesIcon } from '../Icons';


const Generator: React.FC = () => {
    const { user, updateCreatorXP, saveConceptToGallery } = useAuth();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [faction, setFaction] = useState('');
    const [description, setDescription] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Omit<GeneratedConcept, 'id'> | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name || !category || !description) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        setIsSaved(false);

        try {
            const concept = await generateConcept({ name, category, faction, description }, user);
            setResult({ ...concept, name });
            // Grant XP for successful generation
            updateCreatorXP({
                innovation: 15,
                expression: 10,
                engineering: 5,
            });

        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred during generation.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if(!result || isSaved) return;
        saveConceptToGallery(result);
        setIsSaved(true);
    }

    const inputClasses = "mt-1 block w-full rounded-md border-0 bg-tertiary py-2.5 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm transition-colors duration-300";

    return (
        <div className="bg-secondary p-6 rounded-lg border border-primary shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-4">Generate a Character Concept</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary">Character Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Kaelan the Star-Forged" required className={inputClasses}/>
                    </div>
                     <div>
                        <label htmlFor="faction" className="block text-sm font-medium text-secondary">Faction / Allegiance</label>
                        <input type="text" id="faction" value={faction} onChange={e => setFaction(e.target.value)} placeholder="e.g., The Sun-scorched Nomads" className={inputClasses}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-secondary">Class / Category</label>
                    <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Celestial Knight, Aether-Mage" required className={inputClasses}/>
                </div>
                <div>
                     <label htmlFor="description" className="block text-sm font-medium text-secondary">Key Features / Core Idea</label>
                     <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the most important aspects. e.g., 'Wears armor made of starlight, carries a spear that channels cosmic energy.'" required className={inputClasses}></textarea>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-base font-semibold text-on-accent shadow-sm hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Forging in the Cosmos...' : 'Generate'}
                        {!isLoading && <SparklesIcon className="w-5 h-5"/>}
                    </button>
                </div>
            </form>

            <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message={error} />}
                {result && (
                    <div className="animate-fade-in space-y-4">
                         <h3 className="text-xl font-bold text-primary mb-2 text-center">Your Creation</h3>
                        <ResultCard result={{...result, id: 'temp'}} />
                        <button 
                            onClick={handleSave}
                            disabled={isSaved}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-tertiary px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaved ? 'Saved to Gallery' : 'Save to Gallery'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Generator;