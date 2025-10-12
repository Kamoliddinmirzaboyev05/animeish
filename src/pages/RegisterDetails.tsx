import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { User, Lock, Loader2, CheckCircle } from 'lucide-react';
import { registerWithOTP } from '../services/api';

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
      // Call the registerWithOTP function
      const responseData = await registerWithOTP({
        email,
        code: parseInt(code),
        first_name: data.first_name,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      setSuccess('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
      toast.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');

      // If token is returned, redirect to home (token is already stored by the function)
      if (responseData.access) {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // If no token, something went wrong
        const errorMsg = 'Ro\'yxatdan o\'tish muvaffaqiyatli, lekin tizimga kirishda xatolik';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.errors) {
        // Handle field-specific errors
        if (typeof err.errors === 'object') {
          const errorEntries = Object.entries(err.errors);
          if (errorEntries.length > 0) {
            const [field, messages] = errorEntries[0];
            const message = Array.isArray(messages) ? messages[0] : messages;
            errorMessage = `${field}: ${message}`;
          }
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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
        className="relative z-10 w-full max-w-md mx-4 sm:mx-auto"
      >
        <div className="bg-dark-light border border-dark-lighter rounded-2xl p-4 sm:p-8 shadow-2xl">
          <Link to="/" className="block text-center mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 justify-center">
              <img src="/logo.svg" alt="Aniki" className="w-6 h-6 sm:w-8 sm:h-8" />
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Aniki
              </div>
            </div>
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                ✓
              </div>
              <div className="w-4 sm:w-8 h-1 bg-primary"></div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                ✓
              </div>
              <div className="w-4 sm:w-8 h-1 bg-primary"></div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                3
              </div>
            </div>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Ma'lumotlarni To'ldiring</h2>
            <p className="text-gray-400 text-xs sm:text-sm">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Email Display */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark border border-green-500/50 rounded-lg text-white text-sm sm:text-base"
                />
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Ism</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  {...register('first_name')}
                  type="text"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Sizning ismingiz"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Parolni Tasdiqlash</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  {...register('confirm_password')}
                  type="password"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 bg-primary hover:bg-primary-dark rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Hisob yaratilmoqda...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Hisob Yaratish
                </>
              )}
            </button>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm">
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