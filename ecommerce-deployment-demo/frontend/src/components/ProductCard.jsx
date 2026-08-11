import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Star, AlertTriangle } from "lucide-react";
import { getAverageRating } from "../api/reviews";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await getAverageRating(product.id);
        setRating(data);
      } catch {
        // Silently fail - rating is optional
      }
    };
    if (product.id) {
      fetchRating();
    }
  }, [product.id]);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <div
      onClick={handleCardClick}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md ${
        isOutOfStock ? 'border-red-500/30 opacity-75' : 'border-border hover:border-ring'
      }`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.title}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale' : ''
          }`}
          loading="lazy"
        />
        {/* Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
              <AlertTriangle className="h-3 w-3" />
              Only {stock} left
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {product.title}
        </h3>
        
        {/* Rating */}
        {rating && rating.totalReviews > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(rating.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-transparent text-zinc-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({rating.totalReviews})
            </span>
          </div>
        )}
        
        {(product.storeName || product.seller_name) && (
          <p className="text-xs text-muted-foreground">
            Sold by:{" "}
            <span className="font-medium text-primary">
              {product.storeName || product.seller_name}
            </span>
          </p>
        )}
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {product.description.length > 80
            ? `${product.description.substring(0, 80)}...`
            : product.description}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-base font-semibold text-foreground">
            ${product.price.toFixed(2)}
          </p>
          {!isOutOfStock && !isLowStock && stock <= 10 && (
            <span className="text-xs text-muted-foreground">
              {stock} in stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
