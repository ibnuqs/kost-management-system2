// pages/Auth/hooks/useAuthForm.ts
// Custom hook for form state management with validation

import { useState, useCallback } from 'react';
import { FormState, FormErrors, FormHookOptions } from '../types';

export function useAuthForm<T extends Record<string, unknown>>({
  initialValues,
  validationRules,
  onSubmit,
  enableReinitialize = false
}: FormHookOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {} as FormErrors<T>,
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    submitCount: 0
  });

  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());

  // Handle field changes
  const handleChange = useCallback((name: keyof T, value: unknown) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const newErrors = { ...prev.errors };
      
      // Clear error for this field when user types
      if (newErrors[name]) {
        delete newErrors[name];
      }

      // Only validate field if it has been touched (blurred) or form was submitted
      const shouldValidate = touchedFields.has(name) || prev.submitCount > 0;
      
      if (shouldValidate && validationRules?.[name]?.validator) {
        const error = validationRules[name]!.validator!(value);
        if (error) {
          newErrors[name] = error;
        }
      }

      const hasErrors = Object.keys(newErrors).length > 0;

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid: !hasErrors,
        isSubmitting: false,
        isDirty: true
      };
    });
  }, [validationRules, touchedFields]);

  // Handle input change events
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      handleChange(name as keyof T, checked);
    } else {
      handleChange(name as keyof T, value);
    }
  }, [handleChange]);

  // Handle input blur events (mark field as touched)
  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouchedFields(prev => new Set(prev).add(name as keyof T));
    
    // Trigger validation for this field after blur
    const value = state.values[name as keyof T];
    if (validationRules?.[name as keyof T]?.validator) {
      const error = validationRules[name as keyof T]!.validator!(value);
      if (error) {
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [name]: error }
        }));
      }
    }
  }, [state.values, validationRules]);

  // Validate all fields
  const validateForm = useCallback((): FormErrors<T> => {
    const errors: FormErrors<T> = {} as FormErrors<T>;

    if (validationRules) {
      Object.keys(validationRules).forEach((key) => {
        const fieldKey = key as keyof T;
        const rule = validationRules[fieldKey];
        const value = state.values[fieldKey];

        // Check required
        if (rule?.required && (!value || (typeof value === 'string' && !value.trim()))) {
          errors[fieldKey] = `${String(fieldKey)} is required`;
          return;
        }

        // Custom validator
        if (rule?.validator && value) {
          const error = rule.validator(value);
          if (error) {
            errors[fieldKey] = error;
          }
        }
      });
    }

    return errors;
  }, [state.values, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setState(prev => ({ 
      ...prev, 
      submitCount: prev.submitCount + 1,
      isSubmitting: true 
    }));

    // Validate form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setState(prev => ({
        ...prev,
        errors,
        isValid: false,
        isSubmitting: false
      }));
      return;
    }

    try {
      await onSubmit(state.values);
    } catch (error: unknown) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({
        ...prev,
        isSubmitting: false
      }));
    }
  }, [state.values, validateForm, onSubmit]);

  // Reset form
  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {} as FormErrors<T>,
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      submitCount: 0
    });
  }, [initialValues]);

  // Set form errors (useful for server-side validation errors)
  const setErrors = useCallback((errors: FormErrors<T>) => {
    setState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0
    }));
  }, []);

  // Set form values
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
      isDirty: true
    }));
  }, []);

  // Set single field value
  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    handleChange(name, value);
  }, [handleChange]);

  // Set single field error
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false
    }));
  }, []);

  // Clear single field error
  const clearFieldError = useCallback((name: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  // Get field props for easy input binding
  const getFieldProps = useCallback((name: keyof T) => ({
    name: String(name),
    value: state.values[name] || '',
    onChange: handleInputChange,
    error: state.errors[name]
  }), [state.values, state.errors, handleInputChange]);

  // Reinitialize form if initialValues change (useful for edit forms)
  if (enableReinitialize && JSON.stringify(initialValues) !== JSON.stringify(state.values) && !state.isDirty) {
    setState(prev => ({
      ...prev,
      values: initialValues
    }));
  }

  return {
    // State
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    isDirty: state.isDirty,
    submitCount: state.submitCount,

    // Actions
    handleChange,
    handleInputChange,
    handleInputBlur,
    handleSubmit,
    resetForm,
    setErrors,
    setValues,
    setFieldValue,
    setFieldError,
    clearFieldError,
    validateForm,

    // Helpers
    getFieldProps
  };
}