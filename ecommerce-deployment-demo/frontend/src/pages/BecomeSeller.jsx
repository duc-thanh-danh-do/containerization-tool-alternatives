import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Store,
  Users,
  Zap,
  Shield,
  Headphones,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const BecomeSeller = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleBecomeSeller = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/become-seller' } });
      return;
    }

    setIsSubmitting(true);
    try {
      navigate('/seller/kyc');
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Become a Seller</h2>
          <p className="text-zinc-400 mb-8">
            Sign in to your account or create a new one to start selling on EcomSphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login', { state: { from: '/become-seller' } })}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register', { state: { from: '/become-seller' } })}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.isASeller) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Welcome Back, Seller!</h2>
          <p className="text-zinc-400 mb-8">
            You're already a seller on EcomSphere. Head to your dashboard to manage your store.
          </p>
          <button
            onClick={() => navigate('/seller')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const benefits = [
    {
      icon: Users,
      title: 'Reach Millions',
      description: 'Access our growing customer base actively looking for products like yours.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Easy Setup',
      description: 'Get your store up and running in minutes with our simple onboarding.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Receive payments directly to your bank with our secure payment system.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Analytics and insights to help you understand and grow your sales.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated seller support team ready to help you succeed.',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Sparkles,
      title: 'Zero Listing Fees',
      description: 'List unlimited products with no upfront costs to get started.',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  const requirements = [
    'Valid government-issued ID',
    'Bank account for payments',
    'Business details (optional)',
    'Tax information',
  ];

  return (
    <div className="fixed inset-0 top-[64px] bg-zinc-950 overflow-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
              <Store className="h-4 w-4" />
              Start Your Selling Journey
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100 mb-6">
              Sell on{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                EcomSphere
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join thousands of sellers growing their business. Reach millions of customers and turn your passion into profit.
            </p>
            
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg max-w-md mx-auto">
                {error}
              </div>
            )}

            <button
              onClick={handleBecomeSeller}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  Start Selling Today
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">Why Sell With Us?</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Everything you need to build and grow a successful online business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">{benefit.title}</h3>
              <p className="text-zinc-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-zinc-400 mb-6">
                The registration process is quick and easy. Here's what you'll need to complete your seller profile.
              </p>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-6 md:p-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-zinc-100 mb-2">0%</div>
                <div className="text-zinc-400 mb-4">Commission to start</div>
                <div className="text-sm text-zinc-500 mb-6">
                  No hidden fees. Pay only when you make a sale.
                </div>
                <button
                  onClick={handleBecomeSeller}
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Start Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4">
            Join Our Growing Community of Sellers
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Start your journey today and become part of the EcomSphere marketplace.
          </p>
          <button
            onClick={handleBecomeSeller}
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
          >
            {isSubmitting ? 'Processing...' : 'Become a Seller'}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
