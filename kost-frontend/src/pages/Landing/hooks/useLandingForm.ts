// src/pages/Landing/hooks/useLandingForm.ts - FIXED
import { useState, useCallback, useMemo } from 'react';

interface FormErrors {
  [key: string]: string;
}

// ✅ FIX: Simplified validator function type
type ValidatorFunction = (value: any) => string | null;

// ✅ FIX: Simplified validators interface
interface FormValidators {
  [key: string]: ValidatorFunction;
}

export const useLandingForm = <T extends Record<string, any>>(
  initialValues: T,
  validators: FormValidators = {}
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ FIX: Memoize validators to prevent re-creation on every render
  const memoizedValidators = useMemo(() => {
    // Create a stable reference by stringifying and parsing the validators
    return Object.keys(validators).reduce((acc, key) => {
      acc[key] = validators[key];
      return acc;
    }, {} as FormValidators);
  }, []); // Empty dependency - validators should be stable from parent

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name as string]) {
        const { [name as string]: removedError, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []); // ✅ FIX: No dependencies needed

  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    // ✅ FIX: Use memoized validators
    const validator = memoizedValidators[name as string];
    if (validator) {
      return validator(value);
    }
    return null;
  }, [memoizedValidators]);

  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);

    return isValid;
  }, [values, validateField]);

  const handleChange = useCallback((name: keyof T) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.type === 'checkbox' 
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
      
      setValue(name, value);
    };
  }, [setValue]);

  const handleBlur = useCallback((name: keyof T) => {
    return () => {
      setFieldTouched(name, true);
      
      // ✅ FIX: Get current value from state properly
      setValues(currentValues => {
        const error = validateField(name, currentValues[name]);
        if (error) {
          setErrors(prev => ({ ...prev, [name as string]: error }));
        }
        return currentValues; // Return unchanged values
      });
    };
  }, [setFieldTouched, validateField]);

  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    if (!validateAll()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback((name: keyof T) => {
    return {
      name: name as string,
      value: values[name] || '',
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      error: touched[name] ? errors[name as string] : undefined
    };
  }, [values, touched, errors, handleChange, handleBlur]);

  const isFieldValid = useCallback((name: keyof T): boolean => {
    return !errors[name as string];
  }, [errors]);

  // ✅ FIX: Memoize computed values
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
  const isFormValid = useMemo(() => 
    Object.keys(values).every(key => isFieldValid(key as keyof T)), 
    [values, isFieldValid]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    hasErrors,
    isFormValid,
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    isFieldValid
  };
};