import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MapPin, Phone, Package, MessageCircle, Store, ShoppingBag, Share2, Copy, Check } from 'lucide-react';

export default function StorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
          title: store?.name || 'Check out this store',
          text: store?.description?.slice(0, 100) || 'Check out this store on EcomSphere',
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      setError('');
      try {
        const storeRes = await api.get(`/stores/${storeId}`);
        setStore(storeRes.data);

        const productsRes = await api.get('/products');
        const storeProducts = productsRes.data.filter(
          (p) => p.storeId === storeId
        );
        setProducts(storeProducts);
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Failed to load store information.');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const handleContactSeller = () => {
    if (store?.owner) {
      navigate(`/messages?storeId=${storeId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-400">
          Store not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div 
          className="h-48 sm:h-64 md:h-80 w-full"
          style={{
            background: store.cover 
              ? `url(${store.cover}) center/cover no-repeat`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        {/* Store Info Card */}
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative -mt-20 sm:-mt-24 rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 -mt-16 sm:-mt-20 self-center sm:self-start">
                <div 
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-card shadow-lg overflow-hidden"
                  style={{
                    background: store.avatar 
                      ? `url(${store.avatar}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
                  }}
                >
                  {!store.avatar && (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-zinc-400">
                      {store.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Store Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                      <Store className="h-6 w-6 text-primary" />
                      {store.name}
                    </h1>
                    {store.description && (
                      <p className="mt-2 text-muted-foreground max-w-xl">
                        {store.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleContactSeller}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Seller
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
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
                </div>

                {/* Store Meta */}
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  {store.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{store.address}</span>
                    </div>
                  )}
                  {store.phoneNumber && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      <span>{store.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" />
                    <span>{products.length} {products.length === 1 ? 'Product' : 'Products'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Products</h2>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">This store has no products yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
