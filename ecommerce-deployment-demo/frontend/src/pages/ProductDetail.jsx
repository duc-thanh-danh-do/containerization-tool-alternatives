import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  MessageSquare, 
  Share2, 
  Copy, 
  Check, 
  Store, 
  ShoppingCart, 
  Package, 
  Minus, 
  Plus,
  ChevronLeft,
  Star,
  Pencil,
  Send,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCart } from "../contexts/CartContext";

import api from "../utils/api";
import { checkReviewEligibility, getReviewsByProduct, updateReview } from "../api/reviews";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";

export default function ProductDetail({ products = [] }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [userStoreId, setUserStoreId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  
  // Edit review state
  const [userReview, setUserReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || product?.name || 'Check out this product',
          text: product?.description?.slice(0, 100) || 'Check out this product on EcomSphere',
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleReviewSubmitted = () => {
    setReviewRefresh((prev) => prev + 1);
    // Refresh eligibility after submitting a review
    if (isLoggedIn && productId) {
      checkReviewEligibility(productId)
        .then(setReviewEligibility)
        .catch(() => setReviewEligibility(null));
    }
  };

  const handleStartEditReview = () => {
    if (userReview) {
      setEditRating(userReview.rating);
      setEditText(userReview.reviewText);
      setIsEditingReview(true);
    }
  };

  const handleCancelEditReview = () => {
    setIsEditingReview(false);
    setEditRating(0);
    setEditText('');
    setEditHoverRating(0);
  };

  const handleSaveEditReview = async () => {
    if (!userReview || editRating === 0 || !editText.trim()) return;
    
    setIsUpdatingReview(true);
    try {
      await updateReview(userReview.id, editRating, editText);
      setIsEditingReview(false);
      setReviewRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating review:", err);
    } finally {
      setIsUpdatingReview(false);
    }
  };

  // Check review eligibility and fetch user's review when logged in
  useEffect(() => {
    const fetchEligibilityAndReview = async () => {
      if (!isLoggedIn || !productId) {
        setReviewEligibility(null);
        setUserReview(null);
        return;
      }
      setEligibilityLoading(true);
      try {
        const eligibility = await checkReviewEligibility(productId);
        setReviewEligibility(eligibility);
        
        // If user has already reviewed, fetch their review
        if (eligibility.hasReviewed && currentUserId) {
          const reviews = await getReviewsByProduct(productId);
          const myReview = reviews.find(r => r.userId === currentUserId);
          setUserReview(myReview || null);
        } else {
          setUserReview(null);
        }
      } catch (err) {
        console.error("Error checking review eligibility:", err);
        setReviewEligibility(null);
        setUserReview(null);
      } finally {
        setEligibilityLoading(false);
      }
    };
    fetchEligibilityAndReview();
  }, [isLoggedIn, productId, reviewRefresh, currentUserId]);

  useEffect(() => {
    const fetchUserStore = async () => {
      if (!isLoggedIn) {
        setUserStoreId(null);
        return;
      }
      try {
        const res = await api.get("/stores/my-store");
        setUserStoreId(res.data?.id || null);
      } catch (err) {
        setUserStoreId(null);
      }
    };
    fetchUserStore();
  }, [isLoggedIn]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      const fromExternal = products.find(
        (p) => String(p.id) === String(productId)
      );

      if (fromExternal) {
        setProduct(fromExternal);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product by id:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, products]);

  const maxStock = useMemo(() => {
    const s = product?.stock ?? product?.stock_quantity ?? 0;
    return Number.isFinite(Number(s)) ? Number(s) : 0;
  }, [product]);

  const mainImage = product?.images?.[0] || product?.image || "/images/placeholder.jpg";

  const handleAddToCart = () => {
    if (!product) return;
    if (quantity < 1 || quantity > maxStock) return;

    addToCart(product, quantity);
    alert(`${quantity} ${quantity === 1 ? "item" : "items"} added to cart!`);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setQuantity(Math.max(1, Math.min(maxStock || 1, value)));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={mainImage}
                alt={product.title || product.name}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpg";
                }}
              />
              {maxStock <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            
            {/* Image thumbnails placeholder for future */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.slice(0, 4).map((img, idx) => (
                  <div 
                    key={idx}
                    className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted cursor-pointer hover:border-primary transition-colors"
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {product.title || product.name}
                </h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0 rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </DropdownMenuItem>
                    {typeof navigator !== 'undefined' && navigator.share && (
                      <DropdownMenuItem onClick={handleShareNative} className="cursor-pointer">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share...
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Store Link */}
              {product.storeName && product.storeId && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => navigate(`/store/${product.storeId}`)}
                >
                  <Store className="h-4 w-4" />
                  <span>{product.storeName}</span>
                </button>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-foreground">
                ${Number(product.price || 0).toFixed(2)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  maxStock > 10 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : maxStock > 0 
                    ? 'bg-amber-500/10 text-amber-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  <Package className="h-3.5 w-3.5" />
                  {maxStock > 0 ? `${maxStock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quantity</h3>
              <div className="inline-flex items-center rounded-lg border border-border bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-l-lg rounded-r-none"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <input
                  id="quantity"
                  type="number"
                  className="h-10 w-16 border-x border-border bg-transparent text-center text-sm font-medium text-foreground outline-none"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={maxStock || 1}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-r-lg rounded-l-none"
                  onClick={() => setQuantity((prev) => Math.min(maxStock || 1, prev + 1))}
                  disabled={maxStock > 0 ? quantity >= maxStock : true}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={maxStock <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/cart")}
                >
                  View Cart
                </Button>
              </div>

              {product.storeId && isLoggedIn && product.storeId !== userStoreId && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/messages?storeId=${product.storeId}&productId=${productId}`)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Seller
                </Button>
              )}

              {product.storeId && !isLoggedIn && (
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Log in
                  </Link>{" "}
                  to contact the seller
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Customer Reviews</h2>
          </div>

          {/* Review Form Section */}
          {!isLoggedIn ? (
            <div className="mb-8 rounded-xl border border-border bg-muted/30 p-6 text-center">
              <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>{" "}
                to write a review
              </p>
            </div>
          ) : eligibilityLoading ? (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 text-center">
              <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
            </div>
          ) : reviewEligibility?.canReview ? (
            <div className="mb-8 rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Write a Review</h3>
              <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
            </div>
          ) : reviewEligibility?.hasReviewed ? (
            <div className={`mb-8 rounded-xl border p-6 ${isEditingReview ? 'border-primary bg-card' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
              {isEditingReview ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Edit Your Review</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleCancelEditReview}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Edit Rating */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => setEditHoverRating(star)}
                          onMouseLeave={() => setEditHoverRating(0)}
                          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= (editHoverRating || editRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-transparent text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                      {(editHoverRating || editRating) > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          {ratingLabels[editHoverRating || editRating]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Edit Text */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Review</label>
                    <textarea
                      rows={4}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                    />
                  </div>
                  
                  {/* Edit Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEditReview}
                      disabled={isUpdatingReview}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEditReview}
                      disabled={isUpdatingReview || editRating === 0 || !editText.trim()}
                    >
                      {isUpdatingReview ? (
                        <>
                          <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3 w-3" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode - Already Reviewed */
                <div className="text-center">
                  <Star className="mx-auto h-8 w-8 text-emerald-500 fill-emerald-500 mb-2" />
                  <p className="text-sm font-medium text-emerald-500">You've already reviewed this product</p>
                  <p className="text-xs text-muted-foreground mt-1">Thank you for sharing your feedback!</p>
                  {userReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={handleStartEditReview}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Edit Your Review
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : !reviewEligibility?.hasPurchased ? (
            <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <Package className="mx-auto h-8 w-8 text-amber-500 mb-2" />
              <p className="text-sm font-medium text-amber-500">Purchase required to review</p>
              <p className="text-xs text-muted-foreground mt-1">
                You can only review products after your order has been delivered
              </p>
            </div>
          ) : (
            <div className="mb-8 rounded-xl border border-border bg-muted/30 p-6 text-center">
              <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Unable to check review eligibility</p>
            </div>
          )}

          <ReviewList productId={productId} refreshTrigger={reviewRefresh} />
        </div>
      </div>
    </div>
  );
}
