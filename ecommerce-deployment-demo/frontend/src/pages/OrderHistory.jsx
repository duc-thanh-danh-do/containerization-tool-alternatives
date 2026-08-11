import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaHome,
} from "react-icons/fa";
import { getOrders } from "../services/orderService";
import { Button } from "@/components/ui/button";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getOrders();
      console.log("Orders API Response:", data);
      console.log("Orders Count:", Array.isArray(data) ? data.length : 0);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your orders. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const normalizedStatus = (s) => String(s || "").toLowerCase();

  const filteredOrders = useMemo(() => {
    if (filteredStatus === "all") return orders;
    return orders.filter(
      (o) => normalizedStatus(o.status) === normalizedStatus(filteredStatus)
    );
  }, [orders, filteredStatus]);

  console.log("OrderHistory State:", {
    totalOrders: orders.length,
    filteredOrders: filteredOrders.length,
    currentFilter: filteredStatus,
    loading,
    error,
  });

  const statusBadgeClasses = (status) => {
    switch (normalizedStatus(status)) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "processing":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
          <h3 className="mb-1 text-base font-semibold">Error loading orders</h3>
          <p className="mb-3">{error}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              Try Again
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/" className="inline-flex items-center gap-2">
                <FaHome className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <FaBoxOpen className="mb-3 text-5xl text-muted-foreground" />
        <h2 className="mb-1 text-xl font-semibold text-foreground">
          You have no orders yet
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          When you place orders, they&apos;ll show up here.
        </p>
        <Button asChild>
          <Link to="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  const statuses = ["all", "pending", "processing", "delivered", "cancelled"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Your Orders</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your recent orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => {
            const active = filteredStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilteredStatus(status)}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-border px-4 py-3 text-sm md:flex-row md:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Order{" "}
                  <span className="font-mono text-foreground">#{order.id}</span>
                </span>

                <span
                  className={
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " +
                    statusBadgeClasses(order.status)
                  }
                >
                  {order.status || "Unknown"}
                </span>

                {normalizedStatus(order.status) === "delivered" && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <FaCheckCircle className="mr-1" /> Delivered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FaCalendarAlt className="h-3 w-3" />
                {formatDate(order.createdAt || order.date)}
              </div>
            </div>

            <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-foreground">
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </span>{" "}
                  in this order
                </div>
                <div>
                  Total:{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border">
              {order.items?.map((item, idx) => (
                <div
                  key={item.productId ?? `${order.id}-${idx}`}
                  className="flex flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
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
                      <div className="truncate font-medium text-foreground">
                        {item.productTitle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Qty: {item.quantity} · {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1 text-right text-xs">
                    <div className="font-semibold text-foreground">
                      {formatCurrency((item.price || 0) * (item.quantity || 0))}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                      <FaBoxOpen className="mr-1 h-3 w-3" />
                      {order.status || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-between gap-2 border-t border-border bg-card px-4 py-3 text-xs sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-2"
                  >
                    <FaSearch className="h-3 w-3" />
                    View Details
                  </Link>
                </Button>

                <Button variant="outline" size="sm" disabled>
                  Track Order
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button variant="outline" size="sm" disabled>
                  Buy Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  disabled
                >
                  Return Items
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
