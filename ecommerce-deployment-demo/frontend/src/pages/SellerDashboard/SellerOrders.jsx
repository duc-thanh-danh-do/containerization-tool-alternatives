import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Eye, 
  Clock, 
  CheckCircle, 
  Truck, 
  PackageCheck,
  XCircle,
  ArrowUpDown,
  Filter,
  X,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSellerOrders, updateOrderStatus } from "../../services/orderService";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getSellerOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching seller orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: PackageCheck };
      case "shipped":
        return { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Truck };
      case "processing":
        return { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: RefreshCw };
      case "confirmed":
        return { color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", icon: CheckCircle };
      case "cancelled":
        return { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle };
      case "pending":
      default:
        return { color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: Clock };
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "N/A";
    }
  };

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    // Set default to first available forward status
    const available = getAvailableStatusesForOrder(order);
    setNewStatus(available.length > 0 ? available[0].value : order.status);
    setShowStatusModal(true);
  };

  const getAvailableStatusesForOrder = (order) => {
    const allStatuses = [
      { value: "PENDING", label: "Pending", order: 0 },
      { value: "CONFIRMED", label: "Confirmed", order: 1 },
      { value: "PROCESSING", label: "Processing", order: 2 },
      { value: "SHIPPED", label: "Shipped", order: 3 },
      { value: "DELIVERED", label: "Delivered", order: 4 },
    ];

    const currentStatus = order?.status?.toUpperCase();
    const currentIndex = allStatuses.findIndex((s) => s.value === currentStatus);

    if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") {
      return [];
    }

    const forwardStatuses = allStatuses.filter((s) => s.order > currentIndex);
    forwardStatuses.push({ value: "CANCELLED", label: "Cancelled", order: 99 });

    return forwardStatuses;
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdating(true);
      await updateOrderStatus(selectedOrder.id, newStatus);
      setShowStatusModal(false);
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = statusFilter === "all"
      ? [...orders]
      : orders.filter(
          (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
        );
    
    // Sort based on selected option
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "amount-high":
        filtered.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        break;
      case "amount-low":
        filtered.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [orders, statusFilter, sortBy]);

  // Stats
  const orderStats = useMemo(() => {
    const pending = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
    const processing = orders.filter(o => ['confirmed', 'processing'].includes(o.status?.toLowerCase())).length;
    const shipped = orders.filter(o => o.status?.toLowerCase() === 'shipped').length;
    const delivered = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
    return { pending, processing, shipped, delivered, total: orders.length };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-2 border-zinc-600 border-t-transparent mb-3" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Orders</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchOrders}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Customer Orders</h1>
        <p className="text-muted-foreground">Manage and track orders from your customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orderStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <RefreshCw className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orderStats.processing}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orderStats.shipped}</p>
              <p className="text-xs text-muted-foreground">Shipped</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <PackageCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orderStats.delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount-high">Amount: High to Low</SelectItem>
              <SelectItem value="amount-low">Amount: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(statusFilter !== "all" || sortBy !== "newest") && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => { setStatusFilter("all"); setSortBy("newest"); }}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredAndSortedOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Found</h3>
          <p className="text-muted-foreground">
            {statusFilter === "all"
              ? "You haven't received any orders yet."
              : `No orders with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div 
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-ring transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        #{order.id?.slice(-8)}
                      </code>
                      <button
                        onClick={() => handleStatusClick(order)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color} hover:opacity-80 transition-opacity`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {order.status}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer: </span>
                        <span className="font-medium text-foreground">
                          {order.shippingAddress?.fullName || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date: </span>
                        <span className="text-foreground">{formatDate(order.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Items: </span>
                        <span className="text-foreground">{order.items?.length || 0} item(s)</span>
                      </div>
                    </div>

                    {order.items?.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground truncate">
                        {order.items.slice(0, 3).map((item) => item.productTitle).join(", ")}
                        {order.items.length > 3 && ` +${order.items.length - 3} more`}
                      </p>
                    )}
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                    <div className="text-xl font-bold text-foreground">
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </div>
                    <Link to={`/seller/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?.id?.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer</span>
                <p className="font-medium text-foreground">{selectedOrder?.shippingAddress?.fullName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Status</span>
                <p className="font-medium text-foreground">{selectedOrder?.status}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStatusesForOrder(selectedOrder).map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Status can only be moved forward, not backward.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerOrders;
