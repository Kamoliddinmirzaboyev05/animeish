import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(
      (u: any) => u.email === data.email && u.password === data.password
    );

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/home');
    } else {
      setError('Invalid email or password');
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
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Animeish
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-center mb-8">Welcome Back</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-dark-lighter rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-dark rounded-lg font-semibold transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-light">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
