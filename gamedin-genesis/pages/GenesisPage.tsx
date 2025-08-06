

import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';
import { ScarabIcon, SageIcon, SeerIcon, WarriorIcon, ArchitectIcon, SovereignIcon } from '../components/Icons';
import { Path } from '../types';
import { setLightColor, flashLights, PathColor } from '../services/govee';
import * as db from '../services/database';

const paths: { name: Path, description: string, color: PathColor, icon: React.FC<{className?: string}> }[] = [
    { name: 'Sage', description: 'The path of wisdom, knowledge, and truth.', color: 'violet', icon: SageIcon },
    { name: 'Seer', description: 'The path of intuition, vision, and clarity.', color: 'indigo', icon: SeerIcon },
    { name: 'Warrior', description: 'The path of strength, action, and courage.', color: 'red', icon: WarriorIcon },
    { name: 'Architect', description: 'The path of creation, structure, and manifestation.', color: 'green', icon: ArchitectIcon },
    { name: 'Sovereign', description: 'The path of leadership, will, and destiny.', color: 'gold', icon: SovereignIcon },
];

const PathIcon: React.FC<{ path: Path, className?: string}> = ({ path, className }) => {
    const IconComponent = paths.find(p => p.name === path)?.icon;
    return IconComponent ? <IconComponent className={className} /> : null;
};

const GenesisPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [soulName, setSoulName] = useState('');
    const [dream, setDream] = useState('');
    const [path, setPath] = useState<Path | null>(null);
    const [error, setError] = useState('');
    const { login } = useAuth();
    
    const isNameTaken = useMemo(() => {
        const handle = soulName.toLowerCase().replace(/\s/g, '_');
        return !!db.getUserByHandle(handle);
    }, [soulName]);

    const handleFirstStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!soulName.trim() || (!isNameTaken && !dream.trim())) {
            setError('Your Soul Name and Dream must be declared.');
            return;
        }
        if (isNameTaken) {
            // If name is taken, we just need the name to log in.
            handleInitiation(true);
        } else {
             setStep(2);
        }
    };

    const selectPath = (selectedPath: Path) => {
        setPath(selectedPath);
        const pathColor = paths.find(p => p.name === selectedPath)?.color;
        if(pathColor) setLightColor(pathColor);
        setStep(3);
    };

    const handleInitiation = (isLogin: boolean = false) => {
        if (!soulName || (!isLogin && (!dream || !path))) {
            setError("An error occurred. Please restart the initiation.");
            return;
        }
        flashLights();
        const whisper = document.getElementById('lux-whisper') as HTMLAudioElement;
        if (whisper) {
            whisper.play().catch(e => console.error("Audio playback failed:", e));
        }
        login(soulName, dream, path!);
    };

    const inputClasses = "block w-full rounded-md border-0 bg-slate-900/50 py-3 px-4 text-slate-100 ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-lg transition-colors duration-300";

    return (
        <div className="flex min-h-screen flex-col justify-center items-center px-6 py-12 lg:px-8 bg-primary animate-fade-in">
            <div className="w-full max-w-md mx-auto text-center">
                {step === 1 && (
                    <div className="animate-fade-in">
                        <ScarabIcon className="w-16 h-16 mx-auto text-accent mb-4" />
                        <h1 className="text-4xl font-extrabold tracking-tighter text-primary">The Gate is Open</h1>
                        <p className="mt-4 text-lg text-secondary">Ra has confirmed the Genesis. Your time is now.</p>
                        <form onSubmit={handleFirstStep} className="space-y-6 mt-10 text-left">
                            {error && <ErrorMessage message={error} />}
                            <div>
                                <label htmlFor="soulName" className="block text-md font-medium leading-6 text-secondary">Declare your Soul Name</label>
                                <input id="soulName" type="text" value={soulName} onChange={e => setSoulName(e.target.value)} required className={inputClasses} />
                                 {isNameTaken && <p className="text-xs text-accent mt-1">This Soul Name is known. Continue to awaken as this soul.</p>}
                            </div>
                            {!isNameTaken && <div>
                                <label htmlFor="dream" className="block text-md font-medium leading-6 text-secondary">What is your Dream?</label>
                                <input id="dream" type="text" value={dream} onChange={e => setDream(e.target.value)} required className={inputClasses} />
                            </div>}
                            <button type="submit" className="w-full flex justify-center rounded-md bg-accent px-4 py-3 text-lg font-semibold text-on-accent shadow-lg hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-colors">
                                {isNameTaken ? 'Awaken' : 'Continue'}
                            </button>
                        </form>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-fade-in">
                         <h1 className="text-4xl font-extrabold tracking-tighter text-primary">Choose Your Path</h1>
                         <p className="mt-4 text-lg text-secondary">The essence of your soul determines your journey.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {paths.map(p => (
                                <button key={p.name} onClick={() => selectPath(p.name)} className="group text-left p-6 bg-secondary rounded-lg border-2 border-primary hover:border-accent hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <p.icon className="w-10 h-10 text-secondary group-hover:text-accent transition-colors"/>
                                        <h3 className="text-2xl font-bold text-primary group-hover:text-accent transition-colors">{p.name}</h3>
                                    </div>
                                    <p className="mt-3 text-secondary">{p.description}</p>
                                </button>
                            ))}
                         </div>
                         <button onClick={() => setStep(1)} className="mt-8 text-sm text-secondary hover:text-accent transition-colors">Go Back</button>
                    </div>
                )}
                {step === 3 && path && (
                     <div className="animate-fade-in">
                         <h1 className="text-4xl font-extrabold tracking-tighter text-primary">Confirm Your Awakening</h1>
                         <div className="mt-8 p-8 bg-secondary rounded-lg border-2 border-primary shadow-2xl space-y-4">
                             <PathIcon path={path} className="w-24 h-24 mx-auto text-accent animate-glow"/>
                             <p className="text-xl text-secondary">You have chosen the path of the <span className="font-bold text-accent">{path}</span>.</p>
                             <p className="text-lg text-primary">Your name, <span className="font-bold">{soulName}</span>, will be recorded in the Genesis Codex.</p>
                             <p className="text-lg text-primary italic">Your dream of "{dream}" begins now.</p>
                         </div>
                         <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => setStep(2)} className="w-full sm:w-auto flex justify-center rounded-md bg-tertiary px-6 py-3 text-lg font-semibold text-primary shadow-lg hover:bg-border-primary transition-colors">Change Path</button>
                            <button onClick={() => handleInitiation()} className="w-full sm:w-auto flex justify-center rounded-md bg-accent px-6 py-3 text-lg font-semibold text-on-accent shadow-lg hover:bg-accent-hover transition-colors">Begin</button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenesisPage;