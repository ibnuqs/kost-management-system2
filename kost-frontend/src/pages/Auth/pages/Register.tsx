// pages/Auth/pages/Register.tsx
// Registration page for new tenants

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone } from 'lucide-react';
import { useAuth, useAuthForm } from '../hooks';
import { AuthInput, AuthButton, ErrorAlert, PasswordInput } from '../components/ui';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  validateEmail, 
  validateName, 
  validatePhone, 
  validatePassword,
  validateConfirmPassword,
  AUTH_ROUTES, 
  REDIRECT_ROUTES 
} from '../utils';
import { RegisterFormData } from '../types';

const Register: React.FC = () => {
  const { register, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();

  const { 
    values, 
    errors, 
    isSubmitting, 
    handleInputChange, 
    handleSubmit,
    setFieldError 
  } = useAuthForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
      terms: false
    } as RegisterFormData,
    onSubmit: async (formData) => {
      clearError();
      
      // Additional validation
      if (formData.password !== formData.password_confirmation) {
        setFieldError('password_confirmation', 'Passwords do not match');
        return;
      }

      if (!formData.terms) {
        setFieldError('terms', 'You must accept the terms and conditions');
        return;
      }

      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone || undefined
      });

      if (result.success && result.user) {
        // Redirect to tenant dashboard for new registrations
        navigate(REDIRECT_ROUTES.TENANT, { replace: true });
      }
    },
    validationRules: {
      name: {
        required: true,
        validator: validateName
      },
      email: {
        required: true,
        validator: validateEmail
      },
      password: {
        required: true,
        validator: validatePassword
      },
      password_confirmation: {
        required: true,
        validator: (value) => validateConfirmPassword(values.password, value)
      },
      phone: {
        required: false,
        validator: (value) => validatePhone(value || undefined)
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-apple-text-primary">
            Potuna Kost
          </CardTitle>
          <CardDescription className="text-sm font-medium text-apple-text-secondary">
            Create Your Account: Join us and manage your kost with ease!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm mb-4">
            Already have an account?{' '}
            <Link
              to={AUTH_ROUTES.LOGIN}
              className="font-medium text-apple-accent hover:text-blue-500 transition-colors"
            >
              Sign in instead
            </Link>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <ErrorAlert
                message={error}
                onClose={clearError}
              />
            )}
            {/* Name Field */}
            <AuthInput
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={values.name}
              onChange={handleInputChange}
              disabled={isSubmitting || isLoading}
              required
              autoComplete="name"
              error={errors.name}
              icon={<User />}
              variant="floating"
            />

            {/* Email Field */}
            <AuthInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={values.email}
              onChange={handleInputChange}
              disabled={isSubmitting || isLoading}
              required
              autoComplete="email"
              error={errors.email}
              icon={<Mail />}
              helperText="We'll use this email for important account notifications"
              variant="floating"
            />

            {/* Phone Field */}
            <AuthInput
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              placeholder="Enter your phone number (optional)"
              value={values.phone}
              onChange={handleInputChange}
              disabled={isSubmitting || isLoading}
              autoComplete="tel"
              error={errors.phone}
              icon={<Phone />}
              helperText="Optional - for emergency contact purposes"
              variant="floating"
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <PasswordInput
                id="password"
                name="password"
                label="Password"
                placeholder="Create a password"
                value={values.password}
                onChange={handleInputChange}
                disabled={isSubmitting || isLoading}
                required
                autoComplete="new-password"
                error={errors.password}
                showStrength
                showRequirements
                variant="floating"
              />

              <PasswordInput
                id="password_confirmation"
                name="password_confirmation"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={values.password_confirmation}
                onChange={handleInputChange}
                disabled={isSubmitting || isLoading}
                required
                autoComplete="new-password"
                error={errors.password_confirmation}
                variant="floating"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <ErrorAlert
                message={error}
                onClose={clearError}
              />
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 ease-in-out"
                checked={values.terms}
                onChange={handleInputChange}
                disabled={isSubmitting || isLoading}
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 cursor-pointer">
                I agree to the{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 ease-in-out">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 ease-in-out">
                  Privacy Policy
                </a>
                <span className="text-red-500 ml-1">*</span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-red-600 text-xs">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <AuthButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || isLoading}
              loading={isSubmitting || isLoading}
              fullWidth
            >
              Create your account
            </AuthButton>
          </form>

          {/* Additional Info */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">What happens next?</span>
              </div>
            </div>

            <div className="mt-6">
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="h-1.5 w-1.5 bg-primary-500 rounded-full mr-3" />
                  Your account will be created instantly
                </li>
                <li className="flex items-center">
                  <div className="h-1.5 w-1.5 bg-primary-500 rounded-full mr-3" />
                  You'll receive a welcome email with next steps
                </li>
                <li className="flex items-center">
                  <div className="h-1.5 w-1.5 bg-primary-500 rounded-full mr-3" />
                  Start exploring your tenant dashboard
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-apple-accent hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-apple-accent hover:text-blue-500">
            Privacy Policy
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;

// End of file.