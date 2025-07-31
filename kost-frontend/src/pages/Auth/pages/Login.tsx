import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Home } from 'lucide-react';
import { useAuth, useAuthForm } from '../hooks';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { validateEmail, validatePassword, AUTH_ROUTES, REDIRECT_ROUTES } from '../utils';
import { LoginFormData } from '../types';


const Login: React.FC = () => {
  const { login, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || REDIRECT_ROUTES.DEFAULT;

  const { 
    values, 
    errors, 
    isSubmitting, 
    handleInputChange, 
    handleInputBlur,
    handleSubmit 
  } = useAuthForm({
    initialValues: {
      email: '',
      password: '',
      remember: false
    } as LoginFormData,
    onSubmit: async (formData) => {
      clearError();
      
      const result = await login({
        email: formData.email,
        password: formData.password,
        remember: formData.remember
      });

      if (result.success && result.user) {
        const redirectPath = result.user.role === 'admin' 
          ? REDIRECT_ROUTES.ADMIN 
          : result.user.role === 'tenant' 
            ? REDIRECT_ROUTES.TENANT 
            : from;
        
        navigate(redirectPath, { replace: true });
      }
    },
    validationRules: {
      email: {
        required: true,
        validator: validateEmail
      },
      password: {
        required: true,
        validator: validatePassword
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239CA3AF%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Back to Landing Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:text-gray-900 hover:shadow-md transition-all duration-200 border border-gray-200/50"
        >
          <ArrowLeft size={16} />
          <span>Beranda</span>
        </Link>
      </div>

      {/* Login Container */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 scale-110"></div>
              <Home className="w-10 h-10 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Masuk ke <span className="text-blue-600 font-semibold">Potuna Kost</span>
            </p>
          </div>

          {/* Login Card */}
          <Card className="relative bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl"></div>
            
            <div className="relative z-10">
            <CardContent className="px-8 pt-8 pb-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                      <div className="ml-auto pl-3">
                        <button
                          type="button"
                          onClick={clearError}
                          className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                        >
                          <span className="sr-only">Dismiss</span>
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={values.email}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      disabled={isSubmitting || isLoading}
                      className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="nama@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={values.password}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      disabled={isSubmitting || isLoading}
                      className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Masukkan kata sandi Anda"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 mb-8">
                  {/* Remember Me */}
                  <label htmlFor="remember" className="flex items-center text-sm text-gray-700 cursor-pointer group">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 ease-in-out hover:border-blue-400"
                      checked={values.remember}
                      onChange={handleInputChange}
                      disabled={isSubmitting || isLoading}
                    />
                    <span className="ml-3 group-hover:text-gray-900 transition-colors font-medium">Ingat saya</span>
                  </label>

                  {/* Forgot Password */}
                  <Link
                    to={AUTH_ROUTES.FORGOT_PASSWORD}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 ease-in-out hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Masuk...
                    </>
                  ) : (
                    'Masuk ke Akun'
                  )}
                </button>
              </form>
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-6">
              <div className="w-full">
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-500 font-medium">atau</span>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link
                      to={AUTH_ROUTES.REGISTER}
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 ease-in-out hover:underline"
                    >
                      Daftar sekarang
                    </Link>
                  </p>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    Dengan masuk, Anda menyetujui{' '}
                    <a href="#" className="text-blue-600 hover:underline">Syarat & Ketentuan</a>
                    {' '}dan{' '}
                    <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
                    {' '}kami.
                  </p>
                </div>
              </div>
            </CardFooter>
            </div>
          </Card>

          {/* Additional Help */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Butuh bantuan?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                Hubungi dukungan
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;