import React, { useState, useCallback } from 'react';
import { useOnboarding } from '../OnboardingContainer';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import { CameraIcon, UserIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Form validation schema
const avatarFormSchema = z.object({
  avatar: z.union([
    z.string().url('Please provide a valid URL'),
    z.instanceof(File).refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      'File size should be less than 5MB'
    ).refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .png, and .webp formats are supported'
    ),
  ]).optional(),
});

type AvatarFormValues = z.infer<typeof avatarFormSchema>;

export const AvatarStep: React.FC = () => {
  const { completeStep, updateProfile, user } = useOnboarding();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(user?.avatar || null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarFormSchema),
  });
  
  // Handle file upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Set the file in the form
      setValue('avatar', file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setValue]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });
  
  // Handle form submission
  const onSubmit = async (data: AvatarFormValues) => {
    if (!data.avatar) {
      // Skip this step if no avatar is provided
      await completeStep({ skipped: true });
      return;
    }
    
    setIsUploading(true);
    
    try {
      let avatarUrl: string;
      
      if (typeof data.avatar === 'string') {
        // If it's a URL, use it directly
        avatarUrl = data.avatar;
      } else {
        // If it's a file, upload it
        const formData = new FormData();
        formData.append('file', data.avatar);
        
        const response = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }
        
        const result = await response.json();
        avatarUrl = result.url;
      }
      
      // Update user profile with the new avatar
      await updateProfile({ avatar: avatarUrl });
      
      // Mark the step as complete
      await completeStep({ avatar: avatarUrl });
      
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Skip this step
  const skipStep = async () => {
    await completeStep({ skipped: true });
  };
  
  // Use default avatar
  const useDefaultAvatar = async () => {
    try {
      // Generate a default avatar URL based on the user's name or username
      const name = user?.displayName || user?.username || 'User';
      const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=256`;
      
      // Update user profile with the default avatar
      await updateProfile({ avatar: defaultAvatarUrl });
      
      // Mark the step as complete
      await completeStep({ avatar: defaultAvatarUrl });
      
      toast.success('Default avatar selected!');
    } catch (error) {
      console.error('Error setting default avatar:', error);
      toast.error('Failed to set default avatar');
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Add a Profile Picture</h2>
        <p className="mt-2 text-lg text-gray-600">
          Upload a photo or use one of our default avatars.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-40 w-40 rounded-full bg-gray-200 overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <UserIcon className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>
            
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <CameraIcon className="h-5 w-5" />
              <span className="sr-only">Change photo</span>
            </button>
            
            <input
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue('avatar', file);
                  
                  const reader = new FileReader();
                  reader.onload = () => {
                    setPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>
        
        <div {...getRootProps()} className={`mt-6 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}>
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  {...getInputProps()}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
        
        {errors.avatar && (
          <p className="mt-2 text-sm text-red-600">{errors.avatar.message}</p>
        )}
        
        <div className="pt-4 space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isUploading || !preview}
            className="w-full justify-center"
          >
            {isUploading ? 'Uploading...' : 'Continue with this photo'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={useDefaultAvatar}
            className="w-full justify-center"
          >
            Use default avatar
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={skipStep}
            className="w-full justify-center text-gray-600"
          >
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
};

// Add step metadata
AvatarStep.stepName = 'Avatar' as const;
AvatarStep.stepTitle = 'Add a Profile Picture';
AvatarStep.stepDescription = 'Make your profile stand out with a photo';
AvatarStep.stepNumber = 2;
