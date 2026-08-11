import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Plus } from "lucide-react";

const SellerStore = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      if (!token) {
        setError("You must be logged in to view your store.");
        setLoading(false);
        return;
      }

      try {
        // First, get current user to obtain their ID
        const userRes = await axios.get(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = userRes.data;
        if (!user || !user.id) {
          throw new Error("User information is missing.");
        }

        // Then, fetch the store for this user
        const storeRes = await axios.get(`${baseUrl}/stores/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentStore = storeRes.data;
        setStore(currentStore);

        // Fetch all internal products and filter by this seller (store owner)
        const productsRes = await axios.get(`${baseUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allProducts = productsRes.data || [];
        const sellerProducts = allProducts.filter(
          (p) => p.storeId === currentStore.id
        );
        setProducts(sellerProducts);
      } catch (err) {
        console.error("Error fetching store:", err);
        
        // If 404, user doesn't have a store yet - not an error, just no store
        if (err.response?.status === 404) {
          setStore(null);
          setLoading(false);
          return;
        }
        
        const message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load store information.";
        setError(typeof message === "string" ? message : "Failed to load store information.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [baseUrl, token]);

  const getStatusBadgeClasses = (status) => {
    if (!status) return "";
    const normalized = status.toString();
    
    if (normalized === "ACTIVE") return "bg-emerald-500/20 text-emerald-700 border-emerald-400/40";
    if (normalized === "PENDING") return "bg-amber-500/20 text-amber-700 border-amber-400/40";
    if (normalized === "SUSPENDED") return "bg-red-500/20 text-red-700 border-red-400/40";
    return "bg-zinc-500/20 text-zinc-700 border-zinc-400/40";
  };

  const formatStatus = (status) => {
    if (!status) return "";
    const normalized = status.toString();
    return normalized.charAt(0) + normalized.slice(1).toLowerCase();
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !store) return;
    
    setUploading(true);
    setError("");
    
    try {
      // Upload to Cloudinary via server endpoint
      const formData = new FormData();
      formData.append("file", file);
      
      const endpoint = type === 'avatar' 
        ? `${baseUrl}/stores/${store.id}/avatar`
        : `${baseUrl}/stores/${store.id}/cover`;
      
      const res = await axios.post(endpoint, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      setStore(res.data);
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setError(`Failed to upload ${type}: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-700">
          No store found for your account.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 flex items-center text-xl font-bold text-foreground">
        My Store
        {store.status && (
          <span className={`ml-2 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(store.status)}`}>
            {formatStatus(store.status)}
          </span>
        )}
      </h2>

      <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Cover Image */}
        <div 
          className="relative h-48 cursor-pointer group"
          style={{
            background: store.cover 
              ? `url(${store.cover}) center/cover no-repeat`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          onClick={() => coverInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white flex items-center gap-2">
              <ImagePlus className="h-5 w-5" />
              <span className="text-sm font-medium">Change Cover</span>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0], 'cover')}
          />
          
          {/* Avatar */}
          <div 
            className="absolute -bottom-12 left-6 h-24 w-24 rounded-full border-4 border-card cursor-pointer group/avatar overflow-hidden"
            style={{
              background: store.avatar 
                ? `url(${store.avatar}) center/cover no-repeat`
                : '#374151'
            }}
            onClick={(e) => {
              e.stopPropagation();
              avatarInputRef.current?.click();
            }}
          >
            {!store.avatar && (
              <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-zinc-400">
                {store.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files?.[0], 'avatar')}
            />
          </div>
        </div>

        <div className="p-4 pt-16">
          <div className="mb-3 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-1 text-lg font-bold text-foreground">{store.name}</h4>
              <div className="text-sm text-muted-foreground">Store ID: {store.id}</div>
            </div>
            <div className="md:text-right">
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-semibold text-foreground">{store.phoneNumber || "Not provided"}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-1 text-sm text-muted-foreground">Address</div>
            <div className="text-foreground">{store.address || "Not provided"}</div>
          </div>

          <div>
            <div className="mb-1 text-sm text-muted-foreground">Description</div>
            <div className="text-foreground">{store.description || "No description provided."}</div>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-lg font-bold text-foreground">Products in this Store</h4>
        <Button
          onClick={() => navigate("/sell")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 px-6 py-8 text-center">
          <Plus className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Products Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start selling by adding your first product
          </p>
          <Button onClick={() => navigate("/sell")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerStore;
