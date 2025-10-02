import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { registerUser, loginUser, storeAuthData, type ApiError } from '../services/api';

const registerSchema = z.object({
  first_name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  email: z.string().email('Noto\'g\'ri email manzil'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Parollar mos kelmaydi",
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Register user
      await registerUser(data);
      setSuccess('Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Tizimga kirmoqda...');
      
      // Automatically login after successful registration
      const loginResponse = await loginUser({
        username: data.email,
        password: data.password,
      });

      // Store auth data
      storeAuthData(loginResponse);

      // Navigate to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      const apiError = err as ApiError;
      
      if (apiError.errors) {
        // Handle field-specific errors
        const errorMessages = Object.entries(apiError.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError(apiError.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
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
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="sizning@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
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
                  Ro'yxatdan o'tmoqda...
                </>
              ) : (
                'Hisob Yaratish'
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
