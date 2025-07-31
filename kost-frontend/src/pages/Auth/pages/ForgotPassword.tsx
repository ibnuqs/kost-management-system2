import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth, useAuthForm } from '../hooks';
import { AuthInput, AuthButton, ErrorAlert } from '../components/ui';
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
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-apple-text-primary mb-2">
            Reset your password
          </CardTitle>
          <CardDescription className="text-sm font-medium text-apple-text-secondary">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorAlert message={error} />}
            
            <div className="space-y-4">
              <AuthInput
                name="email"
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={handleInputChange}
                error={errors.email}
                disabled={isSubmitting}
                icon={<Mail className="h-4 w-4 text-gray-400" />}
                autoComplete="email"
                autoFocus
              />
            </div>

            <AuthButton
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || !values.email}
              fullWidth
            >
              Send reset link
            </AuthButton>
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
