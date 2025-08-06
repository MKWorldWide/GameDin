import React from 'react';
import Generator from '../components/creator/Generator';
import { SparklesIcon } from '../components/Icons';

const CreatorStudioPage: React.FC = () => {

    return (
        <div className="space-y-8">
            <header className="text-center">
                <SparklesIcon className="w-16 h-16 mx-auto text-accent animate-glow" />
                <h1 className="text-4xl font-extrabold tracking-tighter text-primary mt-4">Creator Studio</h1>
                <p className="mt-2 text-lg text-secondary max-w-2xl mx-auto">
                    Forge new concepts from the aether. As an Architect of this world, your imagination is the blueprint.
                </p>
            </header>
            
            <Generator />

            <footer className="text-center p-4 text-tertiary text-sm">
                <p>Creations powered by Google Gemini AI. ✨</p>
            </footer>
        </div>
    );
};

export default CreatorStudioPage;
