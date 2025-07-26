import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@gamedin/auth';
import { OnboardingStep } from '../types/onboarding';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';

interface OnboardingContainerProps {
  children: React.ReactNode;
  currentStep: OnboardingStep;
  onComplete?: () => void;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  currentStep,
  onComplete,
}) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [onboardingStatus, setOnboardingStatus] = useState<{
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    isComplete: boolean;
  } | null>(null);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data } = await api.get('/onboarding/status');
        setOnboardingStatus(data.status);
        
        // Calculate progress
        const totalSteps = Object.values(OnboardingStep).length;
        const completedSteps = data.status.completedSteps.length;
        setProgress(Math.round((completedSteps / totalSteps) * 100));
        
        // If onboarding is already complete, redirect to dashboard
        if (data.status.isComplete) {
          onComplete?.();
          return;
        }
        
        // If current step is not the same as the server, update the URL
        if (data.status.currentStep !== currentStep) {
          navigate(`/onboarding/${data.status.currentStep}`);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        toast.error('Failed to load onboarding data');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [currentStep, navigate, onComplete]);

  // Mark step as complete and move to next step
  const completeStep = async (data: Record<string, any> = {}) => {
    try {
      const { data: status } = await api.post('/onboarding/complete-step', {
        step: currentStep,
        data,
      });
      
      setOnboardingStatus(status);
      
      // Update progress
      const totalSteps = Object.values(OnboardingStep).length;
      const completedSteps = status.completedSteps.length;
      setProgress(Math.round((completedSteps / totalSteps) * 100));
      
      // If onboarding is complete, call onComplete
      if (status.isComplete) {
        // Update user in auth context
        updateUser({ ...user, hasCompletedOnboarding: true });
        onComplete?.();
      } else if (status.nextStep) {
        // Navigate to next step
        navigate(`/onboarding/${status.nextStep}`);
      }
      
      return status;
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      toast.error('Failed to save your progress');
      throw error;
    }
  };

  // Update user profile during onboarding
  const updateProfile = async (data: any) => {
    try {
      await api.post('/onboarding/profile', data);
      
      // Update user in auth context
      updateUser({ ...user, ...data });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Skip the current step
  const skipStep = async () => {
    return completeStep({ skipped: true });
  };

  if (isLoading || !onboardingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Render children with onboarding context
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  completeStep,
                  skipStep,
                  updateProfile,
                  currentStep: onboardingStatus.currentStep,
                  completedSteps: onboardingStatus.completedSteps,
                  isComplete: onboardingStatus.isComplete,
                  progress,
                  user,
                });
              }
              return child;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a context for the onboarding data
export const OnboardingContext = React.createContext<{
  completeStep: (data?: any) => Promise<any>;
  skipStep: () => Promise<any>;
  updateProfile: (data: any) => Promise<boolean>;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isComplete: boolean;
  progress: number;
  user: any;
} | null>(null);

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingContainer');
  }
  return context;
};
