import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nameForm, setNameForm] = useState({
    firstName: "",
    lastName: "",
  });

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    cardLastFour: "",
    cardExpiry: "",
    cardType: "",
  });

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Failed to load profile data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate, baseUrl]);

  const fullName = useMemo(() => {
    if (userData?.firstName || userData?.lastName) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    return null;
  }, [userData]);

  const initials = useMemo(() => {
    const s = fullName || userData?.email || "U";
    return s.trim().charAt(0).toUpperCase();
  }, [fullName, userData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openNameModal = () => {
    setNameForm({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
    });
    setShowNameModal(true);
  };

  const handleSaveName = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await axios.put(
        `${baseUrl}/users/profile`,
        { firstName: nameForm.firstName, lastName: nameForm.lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(res.data);
      setShowNameModal(false);
    } catch (err) {
      console.error("Error saving name:", err);
      setError(err.response?.data?.message || "Failed to save name.");
    } finally {
      setSaving(false);
    }
  };

  const openShippingModal = () => {
    const saved = userData?.savedShippingAddress;
    setShippingForm({
      fullName: saved?.fullName || fullName || "",
      addressLine1: saved?.addressLine1 || "",
      city: saved?.city || "",
      postalCode: saved?.postalCode || "",
      country: saved?.country || "",
    });
    setShowShippingModal(true);
  };

  const openPaymentModal = () => {
    const saved = userData?.savedPaymentMethod;
    setPaymentForm({
      cardLastFour: saved?.cardLastFour || "",
      cardExpiry: saved?.cardExpiry || "",
      cardType: saved?.cardType || "",
    });
    setShowPaymentModal(true);
  };

  const handleSaveShipping = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await axios.put(
        `${baseUrl}/users/checkout-info`,
        { shippingAddress: shippingForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(res.data);
      setShowShippingModal(false);
    } catch (err) {
      console.error("Error saving shipping address:", err);
      setError(err.response?.data?.message || "Failed to save shipping address.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await axios.put(
        `${baseUrl}/users/checkout-info`,
        { paymentMethod: paymentForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(res.data);
      setShowPaymentModal(false);
    } catch (err) {
      console.error("Error saving payment method:", err);
      setError(err.response?.data?.message || "Failed to save payment method.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6 text-center text-sm text-muted-foreground">
        {error || "User not found."}
      </div>
    );
  }

  const shippingValid =
    shippingForm.fullName &&
    shippingForm.addressLine1 &&
    shippingForm.city &&
    shippingForm.postalCode &&
    shippingForm.country;

  const paymentValid = paymentForm.cardLastFour && paymentForm.cardExpiry;

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">My Profile</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <h3 className="text-lg font-semibold text-foreground">
                {fullName || "Unnamed User"}
              </h3>
              <p className="text-sm text-muted-foreground">{userData.email}</p>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {userData.isASeller && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700">
                    Seller
                  </span>
                )}
                <span
                  className={[
                    "rounded-full px-2 py-0.5 font-medium",
                    userData.emailConfirm
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-amber-500/10 text-amber-700",
                  ].join(" ")}
                >
                  {userData.emailConfirm ? "Email Verified" : "Email Not Verified"}
                </span>
              </div>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-primary">
              {initials}
            </div>
          </div>

          <div className="mb-6">
            <h5 className="mb-2 text-sm font-semibold text-foreground">
              Account Information
            </h5>
            <div className="h-px w-full bg-border" />

            <div className="mt-3 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Name</p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={openNameModal}>
                    Edit
                  </Button>
                </div>
                <p className="text-foreground">{fullName || "Not provided"}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{userData.email}</p>
              </div>

              {userData.phone && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Phone</p>
                  <p className="text-foreground">{userData.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-sm font-semibold text-foreground">
                Saved Shipping Address
              </h5>
              <Button variant="outline" size="sm" onClick={openShippingModal}>
                {userData.savedShippingAddress ? "Edit" : "Add"}
              </Button>
            </div>

            <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              {userData.savedShippingAddress ? (
                <div className="text-foreground">
                  <p className="font-medium">{userData.savedShippingAddress.fullName}</p>
                  <p className="text-muted-foreground">{userData.savedShippingAddress.addressLine1}</p>
                  <p className="text-muted-foreground">
                    {userData.savedShippingAddress.city},{" "}
                    {userData.savedShippingAddress.postalCode}
                  </p>
                  <p className="text-muted-foreground">{userData.savedShippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No saved shipping address.</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-sm font-semibold text-foreground">
                Saved Payment Method
              </h5>
              <Button variant="outline" size="sm" onClick={openPaymentModal}>
                {userData.savedPaymentMethod ? "Edit" : "Add"}
              </Button>
            </div>

            <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              {userData.savedPaymentMethod ? (
                <div className="text-foreground">
                  <p className="font-medium">
                    {userData.savedPaymentMethod.cardType || "Card"} ending in{" "}
                    {userData.savedPaymentMethod.cardLastFour}
                  </p>
                  <p className="text-muted-foreground">
                    Expires: {userData.savedPaymentMethod.cardExpiry}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No saved payment method.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-sm" onClick={() => navigate("/orders")}>
              View Orders
            </Button>
            <Button variant="outline" className="text-sm" onClick={() => navigate("/seller")}>
              Seller Hub
            </Button>
            <Button
              variant="outline"
              className="ml-auto text-sm text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showShippingModal} onOpenChange={setShowShippingModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {userData.savedShippingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
            </DialogTitle>
            <DialogDescription>
              This will be used for faster checkout next time.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={shippingForm.fullName}
                onChange={(e) => setShippingForm((p) => ({ ...p, fullName: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Address</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={shippingForm.addressLine1}
                onChange={(e) => setShippingForm((p) => ({ ...p, addressLine1: e.target.value }))}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">City</label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  value={shippingForm.city}
                  onChange={(e) => setShippingForm((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Postal Code</label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  value={shippingForm.postalCode}
                  onChange={(e) => setShippingForm((p) => ({ ...p, postalCode: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Country</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={shippingForm.country}
                onChange={(e) => setShippingForm((p) => ({ ...p, country: e.target.value }))}
                placeholder="Finland"
              />
              <p className="text-xs text-muted-foreground">
                (You can change this to a Select later.)
              </p>
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setShowShippingModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveShipping} disabled={saving || !shippingValid}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {userData.savedPaymentMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              For security, store only last 4 digits.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Card Type</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={paymentForm.cardType}
                onChange={(e) => setPaymentForm((p) => ({ ...p, cardType: e.target.value }))}
                placeholder="Visa"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Last 4 Digits</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={paymentForm.cardLastFour}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    cardLastFour: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
                maxLength={4}
                placeholder="1234"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Expiry (MM/YY)</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={paymentForm.cardExpiry}
                onChange={(e) => setPaymentForm((p) => ({ ...p, cardExpiry: e.target.value }))}
                placeholder="12/27"
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment} disabled={saving || !paymentValid}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>
              Update your first and last name.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">First Name</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={nameForm.firstName}
                onChange={(e) => setNameForm((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="John"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Last Name</label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={nameForm.lastName}
                onChange={(e) => setNameForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setShowNameModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveName} 
              disabled={saving || (!nameForm.firstName.trim() && !nameForm.lastName.trim())}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
