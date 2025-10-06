import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Loader2, CheckCircle } from 'lucide-react';
import { storeAuthData, type ApiError } from '../services/api';

const detailsSchema = z.object({
  first_name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Parollar mos kelmaydi",
  path: ['confirm_password'],
});

type DetailsFormData = z.infer<typeof detailsSchema>;

const RegisterDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const code = location.state?.code || '';
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
  });

  // Redirect if no email or code
  useEffect(() => {
    if (!email || !code) {
      navigate('/register');
    }
  }, [email, code, navigate]);

  const onSubmit = async (data: DetailsFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the verify-otp endpoint with all registration data
      const response = await fetch('https://animeish.pythonanywhere.com/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: parseInt(code),
          first_name: data.first_name,
          password: data.password,
          confirm_password: data.confirm_password,
        }),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw {
          message: response.status === 500 ? 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.' : 'Noto\'g\'ri javob formati',
          errors: {},
        } as ApiError;
      }

      console.log('Registration response:', { status: response.status, data: responseData });

      if (!response.ok) {
        throw {
          message: responseData.message || responseData.error || 'Ro\'yxatdan o\'tishda xatolik',
          errors: responseData,
        } as ApiError;
      }

      setSuccess('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');

      // If token is returned, store it and redirect to home
      if (responseData.access) {
        storeAuthData(responseData);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // If no token, something went wrong
        setError('Ro\'yxatdan o\'tish muvaffaqiyatli, lekin tizimga kirishda xatolik');
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Registration error:', err);
      
      if (apiError.errors) {
        // Handle field-specific errors
        const errorMessages = Object.entries(apiError.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(apiError.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !code) {
    return null;
  }

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
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-dark-light border border-dark-lighter rounded-2xl p-8 shadow-2xl">
          <Link to="/" className="block text-center mb-8">
            <div className="flex items-center gap-3 justify-center">
              <img src="/logo.svg" alt="Aniki" className="w-8 h-8" />
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Aniki
              </div>
            </div>
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                ✓
              </div>
              <div className="w-8 h-1 bg-primary"></div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                ✓
              </div>
              <div className="w-8 h-1 bg-primary"></div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                3
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Ma'lumotlarni To'ldiring</h2>
            <p className="text-gray-400 text-sm">
              Hisobingizni yaratish uchun qolgan ma'lumotlarni kiriting
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6"
            >
              <div className="whitespace-pre-line text-sm text-red-400 text-center">{error}</div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6"
            >
              <div className="text-sm text-green-400 text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Display */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-dark border border-green-500/50 rounded-lg text-white"
                />
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Ism</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('first_name')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-400"
                  placeholder="Sizning ismingiz"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Parolni Tasdiqlash</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirm_password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-400"
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
              className="w-full py-3 bg-primary hover:bg-primary-dark rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Hisob yaratilmoqda...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Hisob Yaratish
                </>
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

export default RegisterDetails;