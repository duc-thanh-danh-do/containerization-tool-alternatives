import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import { getOrderById, cancelOrder } from "../services/orderService";
import { sendMessage } from "../services/messageService"; 

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrderById(orderId);
      setOrder(response.data);
    } catch (err) {
      console.error("Error loading order:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load the order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      amount || 0
    );

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
  };

  const subtotal = useMemo(() => {
    return (
      order?.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0
    );
  }, [order]);

  const canCancel =
    String(order?.status || "").toUpperCase() === "PENDING";

  const handleContactSeller = (sellerId) => {
    navigate(`/messages?receiverId=${sellerId}&orderId=${orderId}`);
  };

  const handleCancelOrder = async () => {
    if (!canCancel) return;

    const ok = window.confirm("Are you sure you want to cancel this order?");
    if (!ok) return;

    try {
      setCancelling(true);
      await cancelOrder(orderId);
      await loadOrder();
      alert("Order cancelled successfully.");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to cancel order. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error || "Order not found."}
        </div>

        <Button asChild variant="outline">
          <Link to="/orders" className="inline-flex items-center gap-2">
            <FaArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Order #{order.id}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <FaCalendarAlt className="h-3 w-3" />
            {formatDate(order.createdAt || order.date)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </Button>
          )}

          <Button asChild variant="outline" size="sm">
            <Link to="/orders" className="inline-flex items-center gap-2">
              <FaArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-3 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-base font-semibold text-foreground">
            {order.status || "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="text-base font-semibold text-foreground">
            {order.items?.length || 0}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground">Total Amount</p>
          <p className="text-base font-semibold text-foreground">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
          Items in this order
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Subtotal</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={item.productId ?? idx} className="border-t border-border">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/placeholder.jpg";
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="line-clamp-1 font-medium text-foreground">
                          {item.productTitle}
                        </div>
                        {item.productId && (
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            View product
                          </Link>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">
                    {formatCurrency((item.price || 0) * (item.quantity || 0))}
                  </td>
                  <td className="px-4 py-2">
                    {item.sellerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactSeller(item.sellerId)}
                        className="inline-flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Contact Seller
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 text-sm">
        <div className="flex w-full max-w-xs justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex w-full max-w-xs justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{formatCurrency(order.shippingAmount || 0)}</span>
        </div>

        <div className="flex w-full max-w-xs justify-between text-muted-foreground">
          <span>Tax</span>
          <span>{formatCurrency(order.taxAmount || 0)}</span>
        </div>

        <div className="flex w-full max-w-xs justify-between font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
