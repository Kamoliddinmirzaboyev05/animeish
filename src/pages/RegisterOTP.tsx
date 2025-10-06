import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { sendOTP } from '../services/api';

const RegisterOTP = () => {
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

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

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

        // Navigate to final registration step with email and OTP
        navigate('/register/details', {
            state: {
                email,
                code: otpCode,
                step: 'details'
            }
        });
    };

    const handleResendOTP = async () => {
        if (!email) return;

        setIsLoading(true);
        try {
            await sendOTP({ email });
            setError('');
            setOtp(['', '', '', '', '', '']); // Clear OTP inputs
            // Focus first input after resend
            setTimeout(() => {
                const firstInput = document.getElementById('otp-0');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            setError(error.message || 'Kodni qayta yuborishda xatolik');
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
                            <div className="w-8 h-1 bg-primary"></div>
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                2
                            </div>
                            <div className="w-8 h-1 bg-gray-600"></div>
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-semibold">
                                3
                            </div>
                        </div>
                    </div>

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

                        {/* Continue Button */}
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
                                <>
                                    Davom Etish
                                    <ArrowRight className="w-5 h-5" />
                                </>
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
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterOTP;