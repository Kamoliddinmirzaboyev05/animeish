import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { requestPasswordReset, confirmPasswordReset } from '../services/api';

const resetSchema = z.object({
  code: z.string().length(6, 'Kod 6 raqamdan iborat bo\'lishi kerak'),
  new_password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Parollar mos kelmaydi",
  path: ['confirm_password'],
});

type ResetFormData = z.infer<typeof resetSchema>;

const ForgotPasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const initialMessage = location.state?.message || '';
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(initialMessage);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  // Auto focus first OTP input when component mounts
  useEffect(() => {
    const firstInput = document.getElementById('otp-0');
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Update form value
    setValue('code', newOtp.join(''));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await confirmPasswordReset({
        email,
        code: data.code,
        new_password: data.new_password,
      });

      setSuccess('Parol muvaffaqiyatli o\'zgartirildi!');
      toast.success('Parol muvaffaqiyatli o\'zgartirildi!');

      // Navigate to login after success
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Parol muvaffaqiyatli o\'zgartirildi. Yangi parol bilan kiring.'
          }
        });
      }, 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // Handle specific error cases
      let errorMessage = 'Parolni tiklashda xatolik yuz berdi';
      
      if (err.message?.includes('code') || err.message?.includes('kod')) {
        errorMessage = 'Noto\'g\'ri yoki muddati o\'tgan tasdiqlash kodi';
      } else if (err.message?.includes('password') || err.message?.includes('parol')) {
        errorMessage = 'Parol talablarga mos kelmaydi';
      } else if (err.message?.includes('404') || err.message?.includes('topilmadi')) {
        errorMessage = 'Foydalanuvchi topilmadi';
      } else if (err.message?.includes('429') || err.message?.includes('ko\'p urinish')) {
        errorMessage = 'Juda ko\'p urinish. Iltimos, biroz kuting';
      } else {
        errorMessage = err.message || 'Parolni tiklashda xatolik yuz berdi';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await requestPasswordReset({ email });

      setSuccess('Yangi tasdiqlash kodi yuborildi');
      toast.success('Yangi tasdiqlash kodi yuborildi');
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
      setValue('code', ''); // Clear form value
      setResendCooldown(60); // Set 60 second cooldown
      
      // Focus first input after resend
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    } catch (error: any) {
      console.error('Resend code error:', error);
      
      let errorMessage = 'Kodni qayta yuborishda xatolik';
      
      if (error.message?.includes('429') || error.message?.includes('ko\'p so\'rov')) {
        errorMessage = 'Juda ko\'p so\'rov yuborildi. Iltimos, biroz kuting';
      } else {
        errorMessage = error.message || 'Kodni qayta yuborishda xatolik';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
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
              <div className="w-12 h-1 bg-primary"></div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                2
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Yangi Parol O'rnating</h2>
            <p className="text-gray-400 text-sm">
              <span className="text-primary font-medium">{email}</span> manziliga 
              yuborilgan kodni kiriting va yangi parol o'rnating
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
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
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium mb-3">Tasdiqlash Kodi</label>
              <div className="flex gap-3 justify-center mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-dark border border-dark-lighter rounded-lg focus:border-primary focus:ring-1 focus:ring-primary text-white"
                    disabled={isLoading}
                  />
                ))}
              </div>
              {errors.code && (
                <p className="text-sm text-red-500 text-center">{errors.code.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Yangi Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('new_password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-500">{errors.new_password.message}</p>
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
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-3 bg-primary hover:bg-primary-dark rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Parol o'zgartirilmoqda...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Parolni O'zgartirish
                </>
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                Kod kelmadimi?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading || resendCooldown > 0}
                className="text-primary hover:text-primary-light font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Qayta yuborish (${resendCooldown}s)` : 'Qayta yuborish'}
              </button>
            </div>
          </form>

          {/* Back Button */}
          <div className="mt-6 pt-6 border-t border-dark-lighter">
            <button
              onClick={() => navigate('/forgot-password')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga qaytish
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordReset;