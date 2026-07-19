import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import CategorySelect from "./CategorySellect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";
import { getAverageRating } from "../api/reviews";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [productRatings, setProductRatings] = useState({});
  const query = searchParams.get("q") || "";

  useEffect(() => {
    const fetchAndSearch = async () => {
      setIsLoading(true);

      if (!query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch products from API
        const [externalRes, internalRes] = await Promise.all([
          axios.get(`${baseUrl}/products/external`).catch(() => ({ data: [] })),
          axios.get(`${baseUrl}/products`).catch(() => ({ data: [] })),
        ]);

        const allProducts = [
          ...(internalRes.data || []),
          ...(externalRes.data || []),
        ];

        const searchLower = query.toLowerCase();
        const results = allProducts.filter((product) => {
          const productTitle = (product.title || product.name || "").toLowerCase();
          const productDesc = (product.description || "").toLowerCase();
          return (
            productTitle.includes(searchLower) ||
            productDesc.includes(searchLower)
          );
        });

        setSearchResults(results);
        
        // Fetch ratings for sorting
        const ratings = {};
        await Promise.all(
          results.map(async (product) => {
            try {
              const data = await getAverageRating(product.id);
              ratings[product.id] = data.averageRating || 0;
            } catch {
              ratings[product.id] = 0;
            }
          })
        );
        setProductRatings(ratings);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchAndSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset filters when query changes
  useEffect(() => {
    setSelectedCategory("all");
    setSortBy("relevance");
  }, [query]);

  // Get unique categories from search results
  const categories = useMemo(() => {
    const unique = Array.from(new Set(searchResults.map((p) => p.category))).filter(Boolean);
    return ["all", ...unique];
  }, [searchResults]);

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = selectedCategory === "all"
      ? [...searchResults]
      : searchResults.filter((p) => p.category === selectedCategory);
    
    switch (sortBy) {
      case "relevance":
        // Keep original search order
        break;
      case "newest":
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          if (a.storeId && !b.storeId) return -1;
          if (!a.storeId && b.storeId) return 1;
          return 0;
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
  }, [searchResults, selectedCategory, sortBy, productRatings]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-2 text-2xl font-semibold text-foreground text-center">
        Search Results
      </h2>
      <p className="mb-6 text-center text-muted-foreground">
        {searchResults.length > 0
          ? `Found ${searchResults.length} ${searchResults.length === 1 ? "result" : "results"} for "${query}"`
          : `No results found for "${query}"`}
      </p>

      {searchResults.length > 0 && (
        <>
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
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count after filtering */}
          {selectedCategory !== "all" && (
            <p className="mb-4 text-sm text-muted-foreground text-center">
              Showing {filteredAndSortedResults.length} {filteredAndSortedResults.length === 1 ? "product" : "products"} in "{selectedCategory}"
            </p>
          )}

          {filteredAndSortedResults.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {filteredAndSortedResults.map((product) => (
                <ProductCard key={product.id || product.product_id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No products in this category
              </h3>
              <p className="text-sm text-muted-foreground">
                Try selecting a different category or{" "}
                <button 
                  onClick={() => setSelectedCategory("all")}
                  className="font-medium text-primary underline"
                >
                  view all results
                </button>
              </p>
            </div>
          )}
        </>
      )}

      {searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Search className="mb-3 h-16 w-16 text-muted-foreground/30" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No products found
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Sorry, we couldn&apos;t find any products matching &quot;{query}&quot;.
            <br />
            Try different keywords or check out our{" "}
            <Link to="/" className="font-medium text-primary underline">
              homepage
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
