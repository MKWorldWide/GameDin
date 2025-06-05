/**
 * Form Hook
 * 
 * This hook provides form state management with Zod schema validation.
 * It handles form values, errors, submission, and validation.
 */

import { useState, useCallback, useEffect, FormEvent } from 'react';
import { z } from 'zod';
import { validateSchema, validateFormAsync, ValidationResult } from '../utils/validation';

interface UseFormOptions<T extends Record<string, any>> {
  /** Initial form values */
  initialValues: T;
  
  /** Zod schema for validation */
  schema: z.ZodType<T>;
  
  /** Async validators to run after schema validation */
  asyncValidators?: Array<(data: T) => Promise<ValidationResult<T>>>;
  
  /** Submit handler */
  onSubmit: (values: T) => void | Promise<void>;
  
  /** Validate on blur */
  validateOnBlur?: boolean;
  
  /** Validate on change */
  validateOnChange?: boolean;
  
  /** Debounce validation (in ms) */
  validationDebounce?: number;
}

/**
 * Custom hook for form state management and validation
 */
export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const {
    initialValues,
    schema,
    asyncValidators,
    onSubmit,
    validateOnBlur = true,
    validateOnChange = false,
    validationDebounce = 300
  } = options;
  
  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // Debounce timer for validation
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Set form values programmatically
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);
  
  // Handle field change
  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    
    // Handle different input types
    let fieldValue: any = value;
    
    if (type === 'checkbox') {
      fieldValue = (event.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      fieldValue = value === '' ? '' : Number(value);
    }
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validate on change if enabled
    if (validateOnChange) {
      // Clear previous debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Set new debounce timer
      const timer = setTimeout(() => {
        validateField(name, fieldValue);
      }, validationDebounce);
      
      setDebounceTimer(timer);
    }
  }, [touched, validateOnChange, debounceTimer, validationDebounce]);
  
  // Handle custom field change (for components not using standard events)
  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validate on change if enabled
    if (validateOnChange) {
      // Clear previous debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Set new debounce timer
      const timer = setTimeout(() => {
        validateField(name, value);
      }, validationDebounce);
      
      setDebounceTimer(timer);
    }
  }, [touched, validateOnChange, debounceTimer, validationDebounce]);
  
  // Handle field blur
  const handleBlur = useCallback((
    event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      validateField(name, value);
    }
  }, [touched, validateOnBlur]);
  
  // Validate a single field
  const validateField = useCallback(async (name: string, value: any) => {
    try {
      // Create a subset of the schema for the field
      const fieldSchema = schema.pick({ [name]: true });
      
      // Validate just this field
      const result = validateSchema(fieldSchema, { [name]: value });
      
      if (!result.success) {
        // Set field error
        setErrors(prev => ({
          ...prev,
          [name]: result.errors?.[name] || `Invalid ${name}`
        }));
        return false;
      }
      
      // Clear field error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      console.error(`Error validating field ${name}:`, error);
      return false;
    }
  }, [schema]);
  
  // Validate all fields
  const validateForm = useCallback(async (): Promise<ValidationResult<T>> => {
    setIsValidating(true);
    
    try {
      // Validate with schema
      const result = asyncValidators
        ? await validateFormAsync(schema, values, asyncValidators)
        : validateSchema(schema, values);
      
      if (!result.success) {
        // Update errors
        setErrors(result.errors || {});
      } else {
        // Clear errors
        setErrors({});
      }
      
      return result;
    } catch (error) {
      console.error('Form validation error:', error);
      setErrors({
        form: error instanceof Error ? error.message : 'Unknown validation error'
      });
      
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown validation error'
      };
    } finally {
      setIsValidating(false);
    }
  }, [schema, values, asyncValidators]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (event?: FormEvent) => {
    // Prevent default form submission
    if (event) {
      event.preventDefault();
    }
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    setSubmitCount(prev => prev + 1);
    
    // Validate form
    setIsSubmitting(true);
    const validationResult = await validateForm();
    
    if (validationResult.success && validationResult.data) {
      try {
        // Call onSubmit with validated data
        await onSubmit(validationResult.data);
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({
          form: error instanceof Error ? error.message : 'Form submission failed'
        });
      }
    }
    
    setIsSubmitting(false);
  }, [values, validateForm, onSubmit]);
  
  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);
  
  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    submitCount,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFormValues,
    resetForm,
    validateForm,
    validateField,
    
    // Helper for rendering forms
    getFieldProps: (name: string) => ({
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined,
      'aria-invalid': touched[name] && errors[name] ? 'true' : 'false',
      'aria-describedby': touched[name] && errors[name] ? `${name}-error` : undefined
    }),
    
    // Helper for determining if the form is valid
    isValid: Object.keys(errors).length === 0
  };
}

export default useForm; 