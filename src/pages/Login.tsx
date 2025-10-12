import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { loginUser, storeAuthData, sendOTP, type ApiError } from '../services/api';

const loginSchema = z.object({
  username: z.string().min(1, 'Email manzil kiritilishi shart').email('Noto\'g\'ri email manzil'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await loginUser(data);
      storeAuthData(response);
      toast.success('Muvaffaqiyatli tizimga kirdingiz!');
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      
      // Check if error is related to email verification
      if (apiError.message?.includes('verify') || apiError.message?.includes('confirm')) {
        try {
          // Send OTP for email verification
          await sendOTP({ email: data.username });
          navigate('/verify-otp', { state: { email: data.username } });
          return;
        } catch (otpError) {
          const errorMessage = 'Email tasdiqlash kodini yuborishda xatolik';
          setError(errorMessage);
          toast.error(errorMessage);
          return;
        }
      }
      
      let errorMessage = 'Noto\'g\'ri email yoki parol';
      
      if (apiError.errors) {
        const errorMessages = Object.entries(apiError.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        errorMessage = errorMessages;
        setError(errorMessages);
      } else {
        errorMessage = apiError.message || 'Noto\'g\'ri email yoki parol';
        setError(errorMessage);
      }
      
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

          <h2 className="text-2xl font-bold text-center mb-8">Xush Kelibsiz</h2>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6"
            >
              <p className="text-green-400 text-sm text-center">{successMessage}</p>
            </motion.div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-6">
              <div className="whitespace-pre-line text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('username')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="sizning@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Parol</label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-dark rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kirmoqda...
                </>
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" className="text-primary hover:text-primary-light">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
