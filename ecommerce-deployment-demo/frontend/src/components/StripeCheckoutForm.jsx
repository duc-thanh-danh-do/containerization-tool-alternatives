import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "10px 12px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

export default function StripeCheckoutForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
  loading: externalLoading,
  disabled,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || disabled || externalLoading) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      // Create payment intent on server
      const response = await fetch(
        `${baseUrl}/payments/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: amount,
            currency: "usd",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, paymentIntentId } = await response.json();
      setClientSecret(clientSecret);

      // Get card element
      const cardElement = elements.getElement(CardNumberElement);

      // For mock Stripe, we'll simulate a successful payment
      if (clientSecret.includes("mock")) {
        // Mock payment - use Promise to properly wait for delay
        await new Promise((resolve) => setTimeout(resolve, 3000));
        onPaymentSuccess({
          paymentIntentId,
          status: "succeeded",
        });
        setProcessing(false);
        return;
      }

      // Real Stripe payment confirmation
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        onPaymentError(stripeError.message);
        setProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        });
        setProcessing(false);
      }
    } catch (err) {
      const errorMessage = err.message || "Payment failed. Please try again.";
      setError(errorMessage);
      onPaymentError(errorMessage);
      setProcessing(false);
    }
  };

  const isLoading = processing || externalLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">
          Card Number
        </label>
        <div className="rounded-md border border-input bg-background px-3 py-2.5">
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">
            Expiration Date
          </label>
          <div className="rounded-md border border-input bg-background px-3 py-2.5">
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">CVC</label>
          <div className="rounded-md border border-input bg-background px-3 py-2.5">
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isLoading || disabled}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            Processing Payment...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {clientSecret?.includes("mock") ||
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.includes("mock")
          ? "Test mode: Use any card number (e.g., 4242 4242 4242 4242)"
          : "Your payment is secure and encrypted"}
      </p>
    </form>
  );
}
