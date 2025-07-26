import React, { useState } from 'react';
import { useOnboarding } from '../OnboardingContainer';
import { OnboardingStep } from '../../types/onboarding';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

// Form validation schema
const welcomeFormSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  email: z.string().email('Please enter a valid email address'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type WelcomeFormValues = z.infer<typeof welcomeFormSchema>;

export const WelcomeStep: React.FC = () => {
  const { completeStep, updateProfile, user } = useOnboarding();
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<WelcomeFormValues>({
    resolver: zodResolver(welcomeFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      username: user?.username || '',
      email: user?.email || '',
      acceptTerms: false,
    },
  });
  
  const currentUsername = watch('username');
  
  // Check if username is available
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return;
    
    setIsCheckingUsername(true);
    
    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      
      if (data.available) {
        setIsUsernameAvailable(true);
      } else {
        setIsUsernameAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      toast.error('Failed to check username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: WelcomeFormValues) => {
    try {
      // Update user profile with the form data
      await updateProfile({
        displayName: data.displayName,
        username: data.username,
        email: data.email,
      });
      
      // Mark the step as complete
      await completeStep({
        displayName: data.displayName,
        username: data.username,
        email: data.email,
      });
      
      // Send verification email if email was provided
      if (data.email) {
        try {
          await fetch('/api/auth/send-verification-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: data.email }),
          });
          
          toast.success('Verification email sent! Please check your inbox.');
        } catch (error) {
          console.error('Error sending verification email:', error);
          toast.error('Failed to send verification email. You can verify later in your profile settings.');
        }
      }
    } catch (error) {
      console.error('Error in welcome step:', error);
      toast.error('Failed to save your information. Please try again.');
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome to GameDin</h2>
        <p className="mt-2 text-lg text-gray-600">
          Let's set up your account. This will only take a minute.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <div className="mt-1">
            <Input
              id="displayName"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...register('displayName')}
              error={errors.displayName?.message}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">@</span>
            </div>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              className="pl-7"
              placeholder="username"
              {...register('username', {
                onChange: (e) => {
                  // Reset availability check when username changes
                  setIsUsernameAvailable(null);
                  // Trigger validation
                  trigger('username');
                },
                onBlur: (e) => {
                  checkUsernameAvailability(e.target.value);
                },
              })}
              error={errors.username?.message}
            />
            {isCheckingUsername && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}
            {isUsernameAvailable === true && (
              <p className="mt-1 text-sm text-green-600">Username is available!</p>
            )}
            {isUsernameAvailable === false && (
              <p className="mt-1 text-sm text-red-600">Username is already taken</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            We'll send you a verification email to confirm your address.
          </p>
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acceptTerms"
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              {...register('acceptTerms')}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="font-medium text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </a>
            </label>
            {errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isCheckingUsername || isUsernameAvailable === false}
            className="w-full justify-center"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
      
      <div className="text-center text-sm text-gray-500">
        <p>Already have an account?{' '}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

// Add step metadata
WelcomeStep.stepName = 'Welcome' as const;
WelcomeStep.stepTitle = 'Welcome to GameDin';
WelcomeStep.stepDescription = 'Set up your account to get started';
WelcomeStep.stepNumber = 1;
