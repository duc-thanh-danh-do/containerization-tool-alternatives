import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../contexts/CartContext";
import SearchBar from "./SearchBar";
import { isTokenValid } from "../utils/auth";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Home,
  Store,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Package,
  MessageCircle,
  Bell,
  Check,
} from "lucide-react";

export default function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Use state for token to make it reactive
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isASeller, setIsASeller] = useState(null);
  const [userFullName, setUserFullName] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Compute loggedIn from token state
  const loggedIn = token && isTokenValid(token);

  // Sync token state with localStorage on route changes and other events
  useEffect(() => {
    const syncToken = () => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
        if (!currentToken) {
          // Clear all user-related state when token is removed
          setIsASeller(null);
          setUserFullName(null);
          setUnreadMessageCount(0);
          setNotifications([]);
          setUnreadNotificationCount(0);
        }
      }
    };

    // Sync immediately on mount and route change
    syncToken();

    // Listen for storage changes from other tabs
    window.addEventListener("storage", syncToken);
    
    // Check on window focus
    window.addEventListener("focus", syncToken);
    
    // Periodic check for same-tab changes (login/logout)
    const interval = setInterval(syncToken, 1000);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("focus", syncToken);
      clearInterval(interval);
    };
  }, [token, location.pathname]);

  useEffect(() => {
    const fetchSellerStatus = async () => {
      if (!loggedIn) {
        setIsASeller(null);
        setUserFullName(null);
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsASeller(!!res.data?.isASeller);
        if (res.data?.firstName || res.data?.lastName) {
          setUserFullName(`${res.data.firstName || ''} ${res.data.lastName || ''}`.trim());
        } else {
          setUserFullName(null);
        }
        // Store userId for review ownership checks
        if (res.data?.id) {
          localStorage.setItem("userId", res.data.id);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
        }
        setIsASeller(null);
        setUserFullName(null);
      }
    };

    fetchSellerStatus();
  }, [baseUrl, loggedIn, token]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!loggedIn) {
        setUnreadMessageCount(0);
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/api/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadMessageCount(res.data?.unreadCount || 0);
      } catch (err) {
        console.error("Error fetching unread count:", err);
        setUnreadMessageCount(0);
      }
    };

    fetchUnreadCount();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [baseUrl, loggedIn, token]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!loggedIn) {
        setNotifications([]);
        setUnreadNotificationCount(0);
        return;
      }

      try {
        const [notifRes, countRes] = await Promise.all([
          axios.get(`${baseUrl}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/notifications/unread/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setNotifications(notifRes.data?.slice(0, 10) || []);
        setUnreadNotificationCount(countRes.data?.count || 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
        setUnreadNotificationCount(0);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [baseUrl, loggedIn, token]);

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${baseUrl}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axios.put(`${baseUrl}/api/notifications/${notification.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }
    
    if (notification.relatedOrderId) {
      if (notification.type === "NEW_ORDER" && isASeller) {
        navigate(`/seller/orders/${notification.relatedOrderId}`);
      } else {
        navigate(`/orders/${notification.relatedOrderId}`);
      }
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const userName = useMemo(() => {
    if (userFullName) return userFullName;
    if (!token) return "Account";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "Account";
    } catch {
      return "Account";
    }
  }, [token, userFullName]);

  const handleLogout = () => {
    // Clear all state immediately
    setToken(null);
    setIsASeller(null);
    setUserFullName(null);
    setUnreadMessageCount(0);
    setNotifications([]);
    setUnreadNotificationCount(0);
    
    // Remove token and userId from storage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    [
      "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium",
      "text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/70 transition-colors",
      isActive && "bg-zinc-800 text-zinc-50",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-linear-to-b from-zinc-950 to-zinc-900/95 backdrop-blur">
      <div className="flex h-14 w-full items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="text-lg font-semibold tracking-tight text-zinc-50 hover:text-white"
        >
          EcomSphere
        </NavLink>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={navLinkClass}>
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </NavLink>

          {loggedIn && isASeller === true && (
            <NavLink to="/seller" className={navLinkClass}>
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Seller Hub</span>
            </NavLink>
          )}

          {loggedIn && isASeller === false && (
            <NavLink to="/become-seller" className={navLinkClass}>
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Become a Seller</span>
            </NavLink>
          )}

          <NavLink to="/cart" className={navLinkClass}>
            <div className="relative flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
          </NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 text-xs sm:text-sm text-zinc-200 cursor-pointer hover:bg-zinc-800/70 hover:text-zinc-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-zinc-700 bg-zinc-900 text-zinc-100"
            >
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loggedIn ? (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/orders")}
                    className="cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/messages")}
                    className="cursor-pointer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                    {unreadMessageCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-semibold text-white">
                        {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    className="cursor-pointer"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/register")}
                    className="cursor-pointer"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {loggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative inline-flex items-center rounded-full px-2 text-zinc-300 cursor-pointer hover:bg-zinc-800/70 hover:text-zinc-50 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 border-zinc-700 bg-zinc-900 text-zinc-100 max-h-96 overflow-y-auto"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-zinc-500 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`cursor-pointer flex flex-col items-start gap-1 px-3 py-2 ${
                        !notification.isRead ? "bg-zinc-800/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2 w-full">
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <div className={`flex-1 ${notification.isRead ? "ml-4" : ""}`}>
                          <p className="font-medium text-sm text-zinc-100">{notification.title}</p>
                          <p className="text-xs text-zinc-400 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 px-4 pb-3 pt-2 md:hidden">
        <SearchBar />
      </div>
    </nav>
  );
}
