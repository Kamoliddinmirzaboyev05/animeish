import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';
import { registerUser, loginUser, storeAuthData, sendOTP } from '../services/api';

const registerSchema = z.object({
  first_name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  email: z.string().min(1, 'Email manzil kiritilishi shart').email('Noto\'g\'ri email manzil'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Parollar mos kelmaydi",
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState(location.state?.email || '');
  const [isEmailVerified] = useState(location.state?.verified || false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleEmailSubmit = async (email: string) => {
    setIsLoading(true);
    setError('');

    try {
      await sendOTP({ email });
      setVerifiedEmail(email);
      navigate('/verify-otp', { state: { email } });
    } catch (err: any) {
      console.error('Send OTP error:', err);
      
      // Handle specific error messages from API
      let errorMessage = 'Email yuborishda xatolik yuz berdi';
      
      // Check different error formats
      if (err.message) {
        errorMessage = err.message;
      } else if (err.errors) {
        // Handle { "error": "message" } format
        if (typeof err.errors === 'object' && err.errors.error) {
          errorMessage = err.errors.error;
        }
        // Handle { "email": ["error message"] } format
        else if (typeof err.errors === 'object' && err.errors.email) {
          errorMessage = Array.isArray(err.errors.email) ? err.errors.email[0] : err.errors.email;
        }
        // Handle other field errors
        else if (typeof err.errors === 'object') {
          const firstError = Object.values(err.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError as string;
        }
        else if (typeof err.errors === 'string') {
          errorMessage = err.errors;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    // If email is not verified, send OTP first
    if (!isEmailVerified) {
      await handleEmailSubmit(data.email);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Register user with verified email
      await registerUser({
        ...data,
        email: verifiedEmail || data.email
      });
      setSuccess('Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Tizimga kirmoqda...');
      toast.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
      
      // Automatically login after successful registration
      const loginResponse = await loginUser({
        username: verifiedEmail || data.email,
        password: data.password,
      });

      // Store auth data
      storeAuthData(loginResponse);

      // Navigate to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
      
      // Handle different error formats
      if (err.message) {
        errorMessage = err.message;
      } else if (err.errors) {
        // Handle { "error": "message" } format
        if (typeof err.errors === 'object' && err.errors.error) {
          errorMessage = err.errors.error;
        }
        // Handle field-specific errors like { "email": ["Bu email allaqachon mavjud"] }
        else if (typeof err.errors === 'object') {
          const errorEntries = Object.entries(err.errors);
          if (errorEntries.length > 0) {
            const [field, messages] = errorEntries[0];
            const message = Array.isArray(messages) ? messages[0] : messages;
            errorMessage = `${field}: ${message}`;
          }
        }
        else if (typeof err.errors === 'string') {
          errorMessage = err.errors;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-auto"
      >
        <div className="bg-dark-light border border-dark-lighter rounded-2xl p-4 sm:p-8 shadow-2xl">
          <Link to="/" className="block text-center mb-8">
            <div className="flex items-center gap-3 justify-center">
              <img src="/logo.svg" alt="Aniki" className="w-8 h-8" />
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Aniki
              </div>
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-center mb-8">Hisob Yaratish</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-6">
              <div className="whitespace-pre-line text-sm">{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-3 mb-6">
              <div className="text-sm">{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Ism</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('first_name')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="Sizning ismingiz"
                  disabled={isLoading}
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                {isEmailVerified ? (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                ) : null}
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-10 ${isEmailVerified ? 'pr-10' : 'pr-4'} py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors ${isEmailVerified ? 'border-green-500/50 bg-green-500/5' : ''}`}
                  placeholder="sizning@email.com"
                  disabled={isLoading || isEmailVerified}
                  defaultValue={verifiedEmail}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
              {isEmailVerified && (
                <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Email tasdiqlandi
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parolni Tasdiqlash</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirm_password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-dark rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isEmailVerified ? 'Ro\'yxatdan o\'tmoqda...' : 'Email tasdiqlash kodi yuborilmoqda...'}
                </>
              ) : (
                isEmailVerified ? 'Hisob Yaratish' : 'Email Tasdiqlash'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Hisobingiz bormi?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light">
              Kirish
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
