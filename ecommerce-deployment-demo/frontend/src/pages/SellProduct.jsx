import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isTokenValid } from "../utils/auth";
import api from "../utils/api";

export default function SellProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 1,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [storeId, setStoreId] = useState("");
  const [isStoreLoading, setIsStoreLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initStore = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isTokenValid(token)) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      try {
        setIsStoreLoading(true);
        setError("");

        const userRes = await api.get("/users");
        const user = userRes.data;

        if (!user?.id) {
          throw new Error("User information is missing (id).");
        }

        const storeRes = await api.get(`/stores/user/${user.id}`);
        if (!storeRes.data?.id) {
          throw new Error("Store not found for this user.");
        }

        setStoreId(storeRes.data.id);
      } catch (err) {
        console.error("Error fetching store:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your store information. Please make sure you have an active store."
        );
      } finally {
        setIsStoreLoading(false);
      }
    };

    initStore();
  }, [navigate]);

  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required.";
    if (!formData.description.trim()) return "Product description is required.";
    if (!formData.price || Number(formData.price) <= 0)
      return "Please enter a valid price greater than 0.";
    if (!formData.category.trim()) return "Please choose a category.";
    if (!formData.stock || Number(formData.stock) < 1)
      return "Stock quantity must be at least 1.";
    if (!storeId) return "Could not determine your store. Please try again.";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "stock") {
      const v = parseInt(value, 10);
      setFormData((p) => ({ ...p, stock: Number.isFinite(v) ? v : 1 }));
      return;
    }

    if (name === "price") {
      setFormData((p) => ({ ...p, price: value }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: type === "number" ? Number(value) : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    setError("");

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!imageFile) {
      setError("Please upload a product image.");
      return;
    }

    try {
      setIsLoading(true);

      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("category", formData.category.trim());
      formDataToSend.append("price", parseFloat(formData.price).toString());
      formDataToSend.append("stock", Number(formData.stock).toString());
      formDataToSend.append("storeId", storeId);
      formDataToSend.append("image", imageFile);

      const res = await api.post("/products", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Product listed successfully!");

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: 1,
      });
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      console.error("Error submitting product:", err);
      setError(
        err.response?.data?.message || err.response?.data?.error || "Failed to list product. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-1 text-xl font-semibold text-foreground">Sell a Product</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Fill in the details below to list your product for sale.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Product Name
            </label>
            <input
              id="name"
              name="name"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              placeholder="Enter a clear product title"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading || isStoreLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              placeholder="Describe your product details, condition, etc."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading || isStoreLoading}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="price" className="text-sm font-medium text-foreground">
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                name="price"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                disabled={isLoading || isStoreLoading}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="stock" className="text-sm font-medium text-foreground">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                min="1"
                name="stock"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.stock}
                onChange={handleInputChange}
                disabled={isLoading || isStoreLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="category" className="text-sm font-medium text-foreground">
              Category
            </label>
            <input
              id="category"
              name="category"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              placeholder="e.g. Electronics, Fashion"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isLoading || isStoreLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="image" className="text-sm font-medium text-foreground">
              Product Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
              onChange={handleImageChange}
              disabled={isLoading || isStoreLoading}
            />
            <p className="text-xs text-muted-foreground">
              Required. Upload a clear photo of your product.
            </p>

            {imagePreview && (
              <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="flex w-full items-center justify-center gap-2"
              disabled={isLoading || isStoreLoading}
            >
              {isStoreLoading ? (
                "Loading your store..."
              ) : isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent" />
                  Listing...
                </>
              ) : (
                "List Product for Sale"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
