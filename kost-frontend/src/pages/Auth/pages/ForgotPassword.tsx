// pages/Auth/pages/ForgotPassword.tsx
// Forgot password page

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth, useAuthForm } from '../hooks';
import { AuthInput, AuthButton, ErrorAlert, SuccessAlert } from '../components/ui';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEmail, AUTH_ROUTES } from '../utils';
import { ForgotPasswordFormData } from '../types';

const ForgotPassword: React.FC = () => {
  const { forgotPassword, error, clearError } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { 
    values, 
    errors, 
    isSubmitting, 
    handleInputChange, 
    handleSubmit 
  } = useAuthForm({
    initialValues: {
      email: ''
    } as ForgotPasswordFormData,
    onSubmit: async (formData) => {
      clearError();
      
      const result = await forgotPassword(formData.email);

      if (result.success) {
        setSubmittedEmail(formData.email);
        setIsSuccess(true);
      }
    },
    validationRules: {
      email: {
        required: true,
        validator: validateEmail
      }
    }
  });

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-apple-text-primary mb-2">
              Check your email
            </CardTitle>
            <CardDescription className="text-sm font-medium text-apple-text-secondary">
              We've sent password reset instructions to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  We've sent a password reset link to:
                </p>
                <p className="text-sm font-medium text-gray-900 bg-gray-50 rounded-md py-2 px-3">
                  {submittedEmail}
                </p>
              </div>

              <div className="text-left bg-blue-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Next steps:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your email inbox</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create a new password</li>
                  <li>• Sign in with your new password</li>
                </ul>
              </div>

              <div className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="font-medium text-apple-accent hover:text-blue-500"
                >
                  try again
                </button>
              </div>

              <AuthButton
                variant="outline"
                fullWidth
                onClick={() => setIsSuccess(false)}
              >
                Send another email
              </AuthButton>
            </div>
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
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-apple-text-primary">
            Reset your password
          </CardTitle>
          <CardDescription className="text-sm font-medium text-apple-text-secondary">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <AuthInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={values.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
              autoComplete="email"
              error={errors.email}
              icon={<Mail />}
              helperText="Enter the email address associated with your account"
            />

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
              Send reset instructions
            </AuthButton>

            {/* Help Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Need help?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Can't access your email?{' '}
                  <a
                    href="mailto:support@kostmanager.com"
                    className="font-medium text-apple-accent hover:text-blue-500"
                  >
                    Contact support
                  </a>
                </p>
              </div>
            </div>

            {/* Additional Tips */}
            <div className="mt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  💡 Tips for password reset:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• The reset link expires in 60 minutes</li>
                  <li>• Make sure to use the same email you registered with</li>
                  <li>• Contact support if you still don't receive the email</li>
                </ul>
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

export default ForgotPassword;

// End of file.