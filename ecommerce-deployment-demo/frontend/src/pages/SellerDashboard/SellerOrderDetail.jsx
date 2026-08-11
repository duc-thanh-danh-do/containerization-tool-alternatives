import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../services/orderService";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  MessageCircle,
  Check,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const SellerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      if (response.data) {
        setOrder(response.data);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const statusConfig = {
    PENDING: { color: "bg-yellow-500", icon: Clock, label: "Pending" },
    CONFIRMED: { color: "bg-blue-500", icon: Check, label: "Confirmed" },
    PROCESSING: { color: "bg-purple-500", icon: Package, label: "Processing" },
    SHIPPED: { color: "bg-indigo-500", icon: Truck, label: "Shipped" },
    DELIVERED: { color: "bg-green-500", icon: CheckCircle2, label: "Delivered" },
    CANCELLED: { color: "bg-red-500", icon: XCircle, label: "Cancelled" },
  };

  const getNextStatus = () => {
    const progression = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
    const currentStatus = order?.status?.toUpperCase();
    const currentIndex = progression.indexOf(currentStatus);
    
    if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") {
      return null;
    }
    
    if (currentIndex >= 0 && currentIndex < progression.length - 1) {
      return progression[currentIndex + 1];
    }
    return null;
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!order || updating) return;

    try {
      setUpdating(true);
      setError("");
      await updateOrderStatus(order.id, newStatus);
      setSuccessMessage(`Order status updated to ${newStatus}`);
      fetchOrder();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => navigate("/seller/orders")}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = order.status?.toUpperCase();
  const statusInfo = statusConfig[currentStatus] || statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;
  const nextStatus = getNextStatus();

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/seller/orders")}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </button>
        <span className="text-sm text-zinc-500">
          Order #{order.id?.slice(-8)}
        </span>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Status Card - Main Action Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">
                {statusInfo.label}
              </h2>
              <p className="text-sm text-zinc-500">
                Last updated: {formatDate(order.updatedAt || order.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {nextStatus && (
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : `Mark as ${statusConfig[nextStatus]?.label}`}
              </button>
            )}
            {currentStatus !== "DELIVERED" && currentStatus !== "CANCELLED" && (
              <button
                onClick={() => handleStatusUpdate("CANCELLED")}
                disabled={updating}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
            <button
              onClick={() => navigate(`/messages?receiverId=${order.userId}&orderId=${order.id}`)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Message Customer
            </button>
          </div>
        </div>

        {/* Status Progress */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((status, index) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const statusIndex = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(currentStatus);
              const isCompleted = index <= statusIndex && currentStatus !== "CANCELLED";
              const isCurrent = status === currentStatus;

              return (
                <React.Fragment key={status}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? config.color : "bg-zinc-800"
                      } ${isCurrent ? "ring-2 ring-offset-2 ring-offset-zinc-900 ring-blue-500" : ""}`}
                    >
                      <Icon className={`h-5 w-5 ${isCompleted ? "text-white" : "text-zinc-500"}`} />
                    </div>
                    <span className={`mt-2 text-xs ${isCompleted ? "text-zinc-300" : "text-zinc-600"}`}>
                      {config.label}
                    </span>
                  </div>
                  {index < 4 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${index < statusIndex ? "bg-green-500" : "bg-zinc-800"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Customer */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-zinc-500" />
            <h3 className="font-medium text-zinc-300">Customer</h3>
          </div>
          <p className="text-zinc-100 font-medium">{order.shippingAddress?.fullName || "N/A"}</p>
          <p className="text-sm text-zinc-500">{order.shippingAddress?.phoneNumber || "N/A"}</p>
        </div>

        {/* Shipping */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-zinc-500" />
            <h3 className="font-medium text-zinc-300">Shipping</h3>
          </div>
          <p className="text-sm text-zinc-400">
            {order.shippingAddress?.addressLine1}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
            {order.shippingAddress?.country}
          </p>
        </div>

        {/* Payment */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-zinc-500" />
            <h3 className="font-medium text-zinc-300">Payment</h3>
          </div>
          <p className="text-zinc-100 font-medium">{order.paymentMethod}</p>
          <p className="text-sm text-green-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-medium text-zinc-200 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Items ({order.items?.length || 0})
          </h3>
        </div>
        <div className="divide-y divide-zinc-800">
          {order.items?.map((item, index) => (
            <div key={index} className="p-4 flex items-center gap-4">
              <img
                src={item.productImage}
                alt={item.productTitle}
                className="w-16 h-16 object-cover rounded-lg bg-zinc-800"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23333' width='64' height='64'/%3E%3C/svg%3E";
                }}
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.productId}`}
                  className="text-zinc-100 font-medium hover:text-blue-400 transition-colors"
                >
                  {item.productTitle}
                </Link>
                <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-100 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-sm text-zinc-500">${item.price?.toFixed(2)} each</p>
              </div>
            </div>
          ))}
        </div>
        {/* Totals */}
        <div className="p-4 bg-zinc-800/50 space-y-2">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Subtotal</span>
            <span>${order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Shipping</span>
            <span>${order.shippingCost?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Tax</span>
            <span>${order.taxAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-zinc-100 pt-2 border-t border-zinc-700">
            <span>Total</span>
            <span>${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetail;
