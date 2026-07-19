import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Store, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  ArrowRight,
  Sparkles,
  Shield,
  Clock
} from "lucide-react";

export default function KYCForm({ onComplete }) {
  const [formData, setFormData] = useState({
    storeName: "",
    phoneNumber: "",
    businessAddress: "",
    businessDescription: "",
  });

  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndStore = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        setLoadingUser(true);
        setError("");

        // Fetch user data
        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);

        // Try to fetch existing store for this user
        if (res.data?.id) {
          try {
            const storeRes = await axios.get(`${baseUrl}/stores/user/${res.data.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setStore(storeRes.data);
          } catch (storeErr) {
            // 404 means no store yet, which is fine
            if (storeErr.response?.status !== 404) {
              console.error("Error fetching store:", storeErr);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
            "Failed to load your profile. Please try again."
        );
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndStore();
  }, [baseUrl, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResendVerification = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await axios.post(`${baseUrl}/users/resend-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setSuccess("Verification email resent! Please check your inbox.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to resend verification email. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  const submitKYCForm = async () => {
    // This endpoint creates store with PENDING status and sends verification email
    // After user verifies email, store becomes ACTIVE and user becomes seller
    const payload = {
      name: formData.storeName,
      phoneNumber: formData.phoneNumber,
      address: formData.businessAddress,
      description: formData.businessDescription,
    };

    const res = await axios.post(`${baseUrl}/users/become-seller`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 200) {
      setSubmitted(true);
      setSuccess(
        "Your store has been created with pending status. Verification email sent! Please check your inbox and click the link to activate your store."
      );
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!user) return;

    // Validate required fields
    if (!formData.storeName.trim()) {
      setError("Please enter your store name.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!formData.businessAddress.trim()) {
      setError("Please enter your business address.");
      return;
    }

    try {
      setSubmitting(true);
      await submitKYCForm();
    } catch (err) {
      console.error("KYC error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-lg px-4 py-16">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Start Selling Today
            </h2>
            <p className="mt-2 text-muted-foreground">
              Log in to create your store and start reaching customers.
            </p>
            <Button className="mt-6" size="lg" onClick={() => navigate("/login")}>
              Log in to Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Set Up Your Store
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Create your online store in minutes and start selling to customers worldwide.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Benefits Grid */}
        {!store && !submitted && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-foreground">Easy Setup</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get your store running in just a few minutes
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground">Secure Platform</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your data and transactions are protected
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground">24/7 Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We're here to help you succeed
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          {/* Error/Success Messages */}
          {error && (
            <div className="border-b border-border bg-red-500/5 px-6 py-4">
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="border-b border-border bg-emerald-500/5 px-6 py-4">
              <div className="flex items-center gap-3 text-emerald-500">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

          <div className="p-6">
            {!user ? (
              <div className="py-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-muted-foreground">
                  Could not load user profile. Please try again.
                </p>
              </div>
            ) : (
              <>
                {/* User Info Header */}
                <div className="mb-6 flex items-center gap-4 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.isASeller ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active Seller
                        </span>
                      ) : (
                        "Ready to become a seller"
                      )}
                    </p>
                  </div>
                </div>

                {/* User already has a store */}
                {store ? (
                  <div className="space-y-6">
                    <div className={`rounded-xl p-6 ${store.status === "PENDING" ? "bg-amber-500/10 border border-amber-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${store.status === "PENDING" ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
                          <Store className={`h-6 w-6 ${store.status === "PENDING" ? "text-amber-500" : "text-emerald-500"}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{store.name}</h3>
                          <p className={`mt-1 text-sm ${store.status === "PENDING" ? "text-amber-600" : "text-emerald-600"}`}>
                            Status: {store.status === "PENDING" ? "Pending Verification" : "Active"}
                          </p>
                          {store.status === "PENDING" && (
                            <div className="mt-4 space-y-3">
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <p>Check your email and click the verification link to activate your store.</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResendVerification}
                                disabled={resending}
                              >
                                {resending ? "Sending..." : "Resend Verification Email"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {store.status === "ACTIVE" && (
                      <Button onClick={() => navigate("/seller/store")} className="w-full" size="lg">
                        Go to My Store
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : submitted ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                      <Mail className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Check Your Email</h3>
                    <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                      Your store has been created! We've sent a verification email to activate your store. Click the link in the email to get started.
                    </p>
                  </div>
                ) : (
                  /* Store Setup Form */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        Store Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        placeholder="e.g., John's Electronics"
                        className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="e.g., +1 234 567 8900"
                        className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Business Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        placeholder="e.g., 123 Main St, City, Country"
                        className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Business Description
                      </label>
                      <textarea
                        name="businessDescription"
                        rows={4}
                        value={formData.businessDescription}
                        onChange={handleChange}
                        placeholder="Tell customers about your store and what you sell..."
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={submitting} className="w-full" size="lg">
                        {submitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creating Your Store...
                          </>
                        ) : (
                          <>
                            Create Store
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <p className="mt-3 text-center text-xs text-muted-foreground">
                        By creating a store, you agree to our Terms of Service and Seller Guidelines.
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
