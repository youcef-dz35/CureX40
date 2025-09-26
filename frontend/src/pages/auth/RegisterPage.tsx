import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { RegisterData } from '../../types';
import { cn } from '../../utils';

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    password_confirmation: z.string(),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRequirements = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[A-Z]/, text: 'One uppercase letter' },
  { regex: /[a-z]/, text: 'One lowercase letter' },
  { regex: /\d/, text: 'One number' },
];

export default function RegisterPage() {
  const { t } = useTranslation(['common', 'pharmacy']);
  const { register: authRegister, isLoading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      accept_terms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);

    try {
      const registerData: RegisterData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        accept_terms: data.accept_terms,
      };

      await authRegister(registerData);
      navigate('/', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setRegisterError(message);

      if (message.includes('email')) {
        setError('email', { message: 'This email is already registered' });
      }
    }
  };

  const getRequirementStatus = (regex: RegExp) => {
    return regex.test(password);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
              <span className="text-xl font-bold">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              CureX40
            </span>
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Global Error */}
            {registerError && (
              <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-error-400 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-error-800 dark:text-error-200">
                      {registerError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  {t('form.firstName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('first_name')}
                    type="text"
                    id="first_name"
                    className={cn(
                      'form-input pl-10',
                      errors.first_name && 'border-error-500 focus:border-error-500 focus:ring-error-500'
                    )}
                    placeholder="John"
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                {errors.first_name && (
                  <p className="form-error">{errors.first_name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  {t('form.lastName')}
                </label>
                <input
                  {...register('last_name')}
                  type="text"
                  id="last_name"
                  className={cn(
                    'form-input',
                    errors.last_name && 'border-error-500 focus:border-error-500 focus:ring-error-500'
                  )}
                  placeholder="Doe"
                  disabled={isSubmitting || isLoading}
                />
                {errors.last_name && (
                  <p className="form-error">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('form.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={cn(
                    'form-input pl-10',
                    errors.email && 'border-error-500 focus:border-error-500 focus:ring-error-500'
                  )}
                  placeholder={t('form.placeholder.email')}
                  disabled={isSubmitting || isLoading}
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                {t('form.phone')} <span className="text-gray-400 text-sm">({t('form.optional')})</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className={cn(
                    'form-input pl-10',
                    errors.phone && 'border-error-500 focus:border-error-500 focus:ring-error-500'
                  )}
                  placeholder={t('form.placeholder.phone')}
                  disabled={isSubmitting || isLoading}
                />
              </div>
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('form.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={cn(
                    'form-input pl-10 pr-10',
                    errors.password && 'border-error-500 focus:border-error-500 focus:ring-error-500'
                  )}
                  placeholder={t('form.placeholder.password')}
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password requirements:
                  </p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => {
                      const isValid = getRequirementStatus(req.regex);
                      return (
                        <div
                          key={index}
                          className={cn(
                            'flex items-center space-x-2 text-xs',
                            isValid ? 'text-success-600' : 'text-gray-500'
                          )}
                        >
                          <CheckCircle
                            className={cn(
                              'h-3 w-3',
                              isValid ? 'text-success-500' : 'text-gray-300'
                            )}
                          />
                          <span>{req.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="password_confirmation" className="form-label">
                {t('form.confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password_confirmation')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="password_confirmation"
                  className={cn(
                    'form-input pl-10 pr-10',
                    errors.password_confirmation && 'border-error-500 focus:border-error-500 focus:ring-error-500'
                  )}
                  placeholder="Confirm your password"
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting || isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="form-error">{errors.password_confirmation.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-group">
              <div className="flex items-start">
                <input
                  {...register('accept_terms')}
                  id="accept-terms"
                  type="checkbox"
                  className={cn(
                    'form-checkbox mt-1',
                    errors.accept_terms && 'border-error-500'
                  )}
                  disabled={isSubmitting || isLoading}
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.accept_terms && (
                <p className="form-error mt-2">{errors.accept_terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={cn(
                'btn btn-primary w-full flex items-center justify-center gap-2 py-3',
                (isSubmitting || isLoading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting || isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your personal information is protected with enterprise-grade security.
                  We use encrypted connections and follow HIPAA compliance standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{' '}
            <Link
              to="/support"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
