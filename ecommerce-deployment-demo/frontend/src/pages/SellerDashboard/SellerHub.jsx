import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SellerHub = () => {
  const navigate = useNavigate();
  const stats = {
    earnings: 12450.5,
    orders: 24,
    products: 3,
  };

  const recentOrders = [
    {
      id: "#ORD-001",
      product: "Wireless Headphones",
      date: "2025-11-01",
      amount: 129.99,
      status: "Shipped",
    },
    {
      id: "#ORD-002",
      product: "Bluetooth Speaker",
      date: "2025-11-03",
      amount: 89.99,
      status: "Processing",
    },
    {
      id: "#ORD-003",
      product: "Gaming Mouse",
      date: "2025-11-05",
      amount: 49.99,
      status: "Delivered",
    },
  ];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Seller Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Overview of your store performance.
          </p>
        </div>
        <Button onClick={() => navigate("/sell")}>Add New Product</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Earnings</span>
            <i className="bi bi-currency-dollar" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(stats.earnings)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>New Orders</span>
            <i className="bi bi-bag" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.orders}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Products</span>
            <i className="bi bi-box" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.products}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Sales Overview
          </h3>
          <span className="text-xs text-muted-foreground">Last 3 months</span>
        </div>
        <div className="flex h-40 items-end justify-between gap-4">
          {[60, 90, 120].map((h, idx) => (
            <div key={idx} className="flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t-md bg-primary/70"
                style={{ height: `${h}px` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Order ID</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono">{order.id}</td>
                  <td className="px-3 py-2">{order.product}</td>
                  <td className="px-3 py-2">{order.date}</td>
                  <td className="px-3 py-2">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerHub;
