import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  User, 
  ShoppingBag, 
  Store, 
  ClipboardList, 
  LayoutDashboard, 
  Settings, 
  FileText,
  Menu,
  X
} from "lucide-react";

export default function SellerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
      isActive
        ? "bg-primary text-primary-foreground font-semibold"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    ].join(" ");

  const navItems = [
    { to: "/profile", label: "Profile", icon: User },
    { to: "/orders", label: "My Orders", icon: ShoppingBag },
    { to: "/seller/store", label: "My Store", icon: Store },
    { to: "/seller/orders", label: "Customer Orders", icon: ClipboardList },
    { to: "/seller", label: "Seller Hub", icon: LayoutDashboard, end: true },
    { to: "/seller/kyc", label: "Store Setup", icon: FileText },
    { to: "/settings", label: "Account Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-4 left-0 z-50 lg:z-0
        h-screen lg:h-[calc(100vh-96px)]
        w-64 lg:w-56 xl:w-64
        bg-card border-r lg:border border-border lg:rounded-xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:ml-4 lg:my-4
        flex flex-col
        shadow-lg lg:shadow-sm
      `}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <h2 className="font-semibold text-foreground">Menu</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Store Management
          </h5>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                end={item.end}
                className={linkClasses}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Seller Dashboard
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 p-4 bg-background/95 backdrop-blur border-b border-border lg:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-foreground">Seller Dashboard</h1>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
