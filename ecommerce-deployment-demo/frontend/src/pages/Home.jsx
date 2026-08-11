import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import CategorySelect from "./CategorySellect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ChevronLeft, ChevronRight, Sparkles, Truck, Shield, Tag } from "lucide-react";
import { getAverageRating } from "../api/reviews";

export default function Home({ products = [], loading }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [productRatings, setProductRatings] = useState({});
  const [currentBanner, setCurrentBanner] = useState(0);

  const itemsPerPage = 15;

  // Banner data
  const banners = [
    {
      id: 1,
      title: "New Arrivals",
      subtitle: "Discover the latest products",
      description: "Shop the newest additions to our collection",
      gradient: "from-blue-600 to-purple-600",
      icon: Sparkles,
      action: () => setSortBy("newest"),
      buttonText: "Shop New",
    },
    {
      id: 2,
      title: "Free Shipping",
      subtitle: "On orders over $50",
      description: "Fast & reliable delivery to your doorstep",
      gradient: "from-emerald-600 to-teal-600",
      icon: Truck,
      action: () => navigate("/"),
      buttonText: "Learn More",
    },
    {
      id: 3,
      title: "Best Deals",
      subtitle: "Up to 50% off",
      description: "Don't miss out on amazing discounts",
      gradient: "from-orange-500 to-red-500",
      icon: Tag,
      action: () => setSortBy("price-low"),
      buttonText: "View Deals",
    },
  ];

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).filter(
      Boolean
    );
    return ["all", ...unique];
  }, [products]);

  // Fetch ratings for all products (for sorting by rating)
  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = {};
      await Promise.all(
        products.map(async (product) => {
          try {
            const data = await getAverageRating(product.id);
            ratings[product.id] = data.averageRating || 0;
          } catch {
            ratings[product.id] = 0;
          }
        })
      );
      setProductRatings(ratings);
    };
    if (products.length > 0) {
      fetchRatings();
    }
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory === "all"
      ? [...products]
      : products.filter((p) => p.category === selectedCategory);
    
    // Sort based on selected option
    switch (sortBy) {
      case "newest":
        // Assuming newer products have higher IDs or we sort by createdAt if available
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // Fallback: internal products (with storeId) first, then by id
          if (a.storeId && !b.storeId) return -1;
          if (!a.storeId && b.storeId) return 1;
          return (b.id || '').localeCompare(a.id || '');
        });
        break;
      case "rating":
        filtered.sort((a, b) => (productRatings[b.id] || 0) - (productRatings[a.id] || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [products, selectedCategory, sortBy, productRatings]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirst, indexOfLast);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Banner Carousel */}
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentBanner * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`min-w-full bg-gradient-to-r ${banner.gradient} p-6 sm:p-8 md:p-10`}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <banner.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-white/80 mb-1">{banner.subtitle}</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{banner.title}</h2>
                    <p className="text-sm md:text-base text-white/80">{banner.description}</p>
                  </div>
                </div>
                <Button
                  onClick={banner.action}
                  className="bg-white text-zinc-900 hover:bg-white/90 font-semibold px-6 py-2 rounded-xl shadow-lg"
                >
                  {banner.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevBanner}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentBanner ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feature Badges */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Truck className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Free Shipping</p>
            <p className="text-xs text-muted-foreground">Orders over $50</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Secure Payment</p>
            <p className="text-xs text-muted-foreground">100% Protected</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Tag className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Best Prices</p>
            <p className="text-xs text-muted-foreground">Guaranteed</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Quality Products</p>
            <p className="text-xs text-muted-foreground">Top Sellers</p>
          </div>
        </div>
      </div>

      <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
        Products
      </h2>

      {/* Filters Row */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <CategorySelect
          categories={categories}
          category={selectedCategory}
          setCategory={handleCategoryChange}
        />
        
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[160px] bg-background">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {currentProducts.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">
            No products found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-1 py-1 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="rounded-full px-3 text-xs sm:text-sm"
            >
              Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "ghost"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="rounded-full px-3 text-xs sm:text-sm"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="rounded-full px-3 text-xs sm:text-sm"
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
