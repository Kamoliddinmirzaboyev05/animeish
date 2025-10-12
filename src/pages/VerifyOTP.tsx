import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { verifyOTP, sendOTP } from '../services/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto focus first input when component mounts
  useEffect(() => {
    const firstInput = document.getElementById('otp-0');
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Iltimos, 6 raqamli kodni to\'liq kiriting');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyOTP({
        email,
        code: otpCode
      });
      
      // If token is returned, user is already registered and logged in
      if (response.access) {
        // Navigate to home page as user is now logged in
        navigate('/');
      } else {
        // Navigate to complete registration if no token (new user)
        navigate('/register', { 
          state: { 
            email, 
            verified: true 
          } 
        });
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      let errorMessage = 'Tasdiqlash kodida xatolik. Iltimos, qayta urinib ko\'ring.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      await sendOTP({ email });
      setError('');
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
      toast.success('Tasdiqlash kodi qayta yuborildi!');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.message || 'Kodni qayta yuborishda xatolik';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-md mx-4 sm:mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-light rounded-2xl p-4 sm:p-8 border border-dark-lighter"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Emailni Tasdiqlang
              </h1>
              <p className="text-gray-400 text-sm">
                <span className="text-primary font-medium">{email}</span> manziliga 
                yuborilgan 6 raqamli kodni kiriting
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Input */}
              <div className="flex gap-3 justify-center">
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

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Tekshirilmoqda...
                  </>
                ) : (
                  'Tasdiqlash'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Kod kelmadimi?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-primary hover:text-primary-light font-medium text-sm disabled:opacity-50"
                >
                  Qayta yuborish
                </button>
              </div>
            </form>

            {/* Back Button */}
            <div className="mt-6 pt-6 border-t border-dark-lighter">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Orqaga qaytish
              </button>
            </div>
          </motion.div>


        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;