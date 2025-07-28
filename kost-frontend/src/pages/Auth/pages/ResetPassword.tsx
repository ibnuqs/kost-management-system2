// pages/Auth/pages/ResetPassword.tsx
// Reset password page with token validation

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth, useAuthForm } from '../hooks';
import { AuthButton, ErrorAlert, PasswordInput } from '../components/ui';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validatePassword, validateConfirmPassword, AUTH_ROUTES } from '../utils';
import { ResetPasswordFormData } from '../types';

const ResetPassword: React.FC = () => {
  const { resetPassword, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      navigate(AUTH_ROUTES.FORGOT_PASSWORD, { replace: true });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, navigate]);

  const { 
    values, 
    errors, 
    isSubmitting, 
    handleInputChange, 
    handleSubmit,
    setFieldError 
  } = useAuthForm({
    initialValues: {
      token: token || '',
      password: '',
      password_confirmation: ''
    } as ResetPasswordFormData,
    onSubmit: async (formData) => {
      clearError();
      
      if (formData.password !== formData.password_confirmation) {
        setFieldError('password_confirmation', 'Passwords do not match');
        return;
      }

      if (!token) {
        setFieldError('token', 'Invalid reset token');
        return;
      }

      const result = await resetPassword(token, formData.password, formData.password_confirmation);

      if (result.success) {
        setIsSuccess(true);
      }
    },
    validationRules: {
      password: {
        required: true,
        validator: validatePassword
      },
      password_confirmation: {
        required: true,
        validator: (value) => validateConfirmPassword(values.password, value)
      }
    }
  });

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-apple-text-primary mb-2">
              Password reset successful
            </CardTitle>
            <CardDescription className="text-sm font-medium text-apple-text-secondary">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>

              <div className="text-left bg-green-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Security tips:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Use a unique password for your account</li>
                  <li>• Consider using a password manager</li>
                  <li>• Keep your password confidential</li>
                  <li>• Update it regularly for better security</li>
                </ul>
              </div>

              <AuthButton
                variant="primary"
                fullWidth
                onClick={() => navigate(AUTH_ROUTES.LOGIN)}
              >
                Continue to sign in
              </AuthButton>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-600">
            You can now sign in with your new password
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-apple-text-primary mb-2">
              Invalid reset link
            </CardTitle>
            <CardDescription className="text-sm font-medium text-apple-text-secondary">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The password reset link you clicked is either invalid or has expired.
                </p>
                <p className="text-sm text-gray-600">
                  Please request a new password reset link to continue.
                </p>
              </div>

              <AuthButton
                variant="primary"
                fullWidth
                onClick={() => navigate(AUTH_ROUTES.FORGOT_PASSWORD)}
              >
                Request new reset link
              </AuthButton>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-600">
            <Link
              to={AUTH_ROUTES.FORGOT_PASSWORD}
              className="inline-flex items-center text-apple-accent hover:text-blue-500 transition-colors"
            >
              Request a new reset link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-apple-text-primary mb-2">
            Set New Password
          </CardTitle>
          <CardDescription className="text-sm font-medium text-apple-text-secondary">
            Enter your new password below to reset your account access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Password Fields */}
            <div className="space-y-6">
              <PasswordInput
                id="password"
                name="password"
                label="New Password"
                placeholder="Enter your new password"
                value={values.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
                autoComplete="new-password"
                error={errors.password}
                showStrength
                showRequirements
              />

              <PasswordInput
                id="password_confirmation"
                name="password_confirmation"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={values.password_confirmation}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
                autoComplete="new-password"
                error={errors.password_confirmation}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <ErrorAlert
                message={error}
                onClose={clearError}
              />
            )}

            {/* Submit Button */}
            <AuthButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
              fullWidth
            >
              Update password
            </AuthButton>

            {/* Security Info */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Password requirements</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-blue-50 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">For your security:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use at least 8 characters</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Add numbers for extra security</li>
                    <li>• Make it unique to this account</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-gray-600">
          <Link
            to={AUTH_ROUTES.LOGIN}
            className="inline-flex items-center text-apple-accent hover:text-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;

// End of file.