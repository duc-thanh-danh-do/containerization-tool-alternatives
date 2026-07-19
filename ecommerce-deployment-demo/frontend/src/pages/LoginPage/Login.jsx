import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { handleApiError } from "../../utils/api";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  Shield,
  Zap
} from "lucide-react";

const Login = () => {
  const [step, setStep] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailStep = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await axios.get(`${baseUrl}/auth/check-email/${formData.email}`, {
      });

      if (response.data.exists) {
        setStep("login");
      } else {
        setStep("register");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginStep = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await axios.post(`${baseUrl}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.userId) {
          localStorage.setItem("userId", response.data.userId);
        }
        navigate("/");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStep = async () => {
    try {
      setError("");
      setIsLoading(true);

      await axios.post(`${baseUrl}/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
      });

      // Registration successful, now auto-login
      const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (loginResponse.data.token) {
        localStorage.setItem("token", loginResponse.data.token);
        if (loginResponse.data.userId) {
          localStorage.setItem("userId", loginResponse.data.userId);
        }
        navigate("/");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === "email") {
      await handleEmailStep();
    } else if (step === "login") {
      await handleLoginStep();
    } else {
      await handleRegisterStep();
    }
  };

  const renderTitle = () => {
    if (step === "email") return "Welcome to EcomSphere";
    if (step === "login") return "Welcome back!";
    return "Create your account";
  };

  const renderSubtitle = () => {
    if (step === "email") return "Enter your email to get started";
    if (step === "login") return "Sign in to continue shopping";
    return "Join thousands of happy shoppers";
  };

  const features = [
    { icon: ShoppingBag, text: "Shop millions of products" },
    { icon: Shield, text: "Secure checkout" },
    { icon: Zap, text: "Fast delivery" },
  ];

  return (
    <div className="fixed inset-0 top-[64px] bg-zinc-950 overflow-auto">
      <div className="min-h-full flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-zinc-950 p-8 xl:p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">EcomSphere</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Your one-stop shop for everything
            </h1>
            <p className="text-zinc-400 text-lg mb-8">
              Discover amazing products from sellers around the world. Join our community of millions of happy customers.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-zinc-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-zinc-500 text-sm">
            © 2024 EcomSphere. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 xl:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">EcomSphere</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {renderTitle()}
              </h2>
              <p className="text-zinc-400">{renderSubtitle()}</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <div className="flex items-start justify-between gap-2">
                  <span>{error}</span>
                  <button
                    type="button"
                    className="text-red-400/80 hover:text-red-400"
                    onClick={() => setError("")}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading || step !== "email"}
                  />
                </div>
              </div>

              {/* Password Field */}
              {step !== "email" && (
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Registration Fields */}
              {step === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-zinc-300">
                        First name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                        <input
                          id="firstName"
                          type="text"
                          name="firstName"
                          placeholder="John"
                          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-zinc-300">
                        Last name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                        <input
                          id="lastName"
                          type="text"
                          name="lastName"
                          placeholder="Doe"
                          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium text-zinc-300">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        placeholder="123 Main St, City, Country"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {step === "email" ? "Checking..." : step === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {step === "email" && "Continue"}
                    {step === "login" && "Sign in"}
                    {step === "register" && "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Change Email Link */}
            {step !== "email" && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setStep("email")}
                  disabled={isLoading}
                >
                  ← Use a different email
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-zinc-500">
              By continuing, you agree to our{" "}
              <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
