import React, { useState } from 'react';
import WelcomeStep from './WelcomeStep';
import ProfileSetupStep from './ProfileSetupStep';
import PreferencesStep from './PreferencesStep';
import FeatureHighlightsStep from './FeatureHighlightsStep';
import SocialConnectStep from './SocialConnectStep';
import CompletionStep from './CompletionStep';

/**
 * OnboardingFlow - Main controller for onboarding steps
 * Manages step navigation, state, and completion
 * Fully accessible, mobile-first, and quantum-documented
 */
const steps = [
  'welcome',
  'profile',
  'preferences',
  'features',
  'social',
  'complete',
] as const;
type StepKey = typeof steps[number];

const OnboardingFlow: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState<StepKey>('welcome');
  // State for onboarding data (could be persisted to Zustand/global store)
  const [profile, setProfile] = useState<{ avatar?: string; username?: string; bio?: string }>({});
  const [preferences, setPreferences] = useState<{ genres?: string[]; platforms?: string[]; notifications?: boolean }>({});
  const [social, setSocial] = useState<{ invites?: string; socials?: string[]; joinGroup?: boolean }>({});

  // Navigation handlers
  const handleNext = (data?: any) => {
    if (step === 'welcome') setStep('profile');
    else if (step === 'profile') {
      if (data) setProfile(data);
      setStep('preferences');
    } else if (step === 'preferences') {
      if (data) setPreferences(data);
      setStep('features');
    } else if (step === 'features') setStep('social');
    else if (step === 'social') {
      if (data) setSocial(data);
      setStep('complete');
    } else if (step === 'complete') {
      if (onFinish) onFinish();
    }
  };
  const handleBack = () => {
    if (step === 'profile') setStep('welcome');
    else if (step === 'preferences') setStep('profile');
    else if (step === 'features') setStep('preferences');
    else if (step === 'social') setStep('features');
    else if (step === 'complete') setStep('social');
  };

  // Render current step
  switch (step) {
    case 'welcome':
      return <WelcomeStep onNext={handleNext} />;
    case 'profile':
      return <ProfileSetupStep onNext={() => handleNext(profile)} onBack={handleBack} initialProfile={profile} />;
    case 'preferences':
      return <PreferencesStep onNext={() => handleNext(preferences)} onBack={handleBack} initialPreferences={preferences} />;
    case 'features':
      return <FeatureHighlightsStep onNext={handleNext} onBack={handleBack} />;
    case 'social':
      return <SocialConnectStep onNext={() => handleNext(social)} onBack={handleBack} />;
    case 'complete':
      return <CompletionStep onFinish={onFinish || (() => {})} />;
    default:
      return null;
  }
};

export default OnboardingFlow;
