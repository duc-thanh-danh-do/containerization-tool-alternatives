import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import ChatBubble from "./components/ChatBubble";
import Home from "./pages/Home";
import Login from "./pages/LoginPage/Login";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import StorePage from "./pages/StorePage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import SellerDashboard from "./pages/SellerDashboard/SellerDashboard";
import KYCForm from "./pages/SellerDashboard/KYCForm";
import SellerLayout from "./pages/SellerDashboard/SellerLayout";
import SellerStore from "./pages/SellerDashboard/SellerStore";
import SellerOrders from "./pages/SellerDashboard/SellerOrders";
import SellerOrderDetail from "./pages/SellerDashboard/SellerOrderDetail";
import BecomeSeller from "./pages/BecomeSeller";
import SellProduct from "./pages/SellProduct";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";
import ProtectedRoute from "./components/ProtectedRoute";
import { isTokenValid } from "./utils/auth";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const externalRes = await axios.get(`${baseUrl}/products/external`);
      const internalRes = await axios.get(`${baseUrl}/products`);

      const externalProducts = externalRes.data || [];
      const internalProducts = internalRes.data || [];

      const merged = [...internalProducts, ...externalProducts];
      setProducts(merged);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (!isTokenValid(token)) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <CartProvider>
      <NotificationProvider>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home products={products} loading={loading} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/seller/kyc" element={
              <ProtectedRoute>
                <KYCForm />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={<Cart />} />
            <Route path="/products/:productId" element={<ProductDetail products={products} />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/store/:storeId" element={<StorePage />} />
            
            {/* Protected Routes */}
            <Route path="/seller" element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/store" element={
              <ProtectedRoute>
                <SellerLayout>
                  <SellerStore />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute>
                <SellerLayout>
                  <SellerOrders />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/orders/:orderId" element={
              <ProtectedRoute>
                <SellerLayout>
                  <SellerOrderDetail />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/sell" element={
              <ProtectedRoute>
                <SellProduct />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-confirmation/:orderId" element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="/orders/:orderId" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            {/* 404 Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <ChatBubble />
      </NotificationProvider>
    </CartProvider>
  );
}