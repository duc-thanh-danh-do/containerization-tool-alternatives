import { useCart } from "../contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag,
  Package,
  Truck,
  Shield,
  AlertTriangle
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    cartTotal,
    cartCount,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clear Cart Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-muted-foreground hover:text-destructive gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {/* Cart Items List */}
          {cart.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-ring transition-colors"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div 
                  className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted cursor-pointer"
                  onClick={() => navigate(`/products/${item.id}`)}
                >
                  <img
                    src={item.images}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <h3 
                      className="font-semibold text-foreground hover:text-primary cursor-pointer truncate"
                      onClick={() => navigate(`/products/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${item.price.toFixed(2)} each
                    </p>
                    {item.stock && item.stock <= 5 && (
                      <div className="flex items-center gap-1 mt-2 text-amber-500 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        Only {item.stock} left in stock
                      </div>
                    )}
                  </div>

                  {/* Mobile: Price & Remove */}
                  <div className="flex items-center justify-between mt-3 sm:hidden">
                    <span className="font-bold text-lg text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="hidden sm:flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center rounded-full border border-border bg-background">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <input
                      type="number"
                      className="h-9 w-12 bg-transparent text-center text-sm font-medium text-foreground outline-none"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value);
                        if (!isNaN(newQty) && newQty >= 1) {
                          const maxStock = item.stock || 999;
                          updateQuantity(item.id, Math.min(newQty, maxStock));
                        }
                      }}
                      min={1}
                      max={item.stock || 999}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock || 999)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.stock && item.quantity >= item.stock && (
                    <span className="text-xs text-amber-500">Max stock</span>
                  )}
                </div>

                {/* Price & Remove (Desktop) */}
                <div className="hidden sm:flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Mobile Quantity Controls */}
              <div className="flex items-center justify-center mt-4 sm:hidden">
                <div className="flex items-center rounded-full border border-border bg-background">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    className="h-10 w-14 bg-transparent text-center text-sm font-medium text-foreground outline-none"
                    value={item.quantity}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value);
                      if (!isNaN(newQty) && newQty >= 1) {
                        const maxStock = item.stock || 999;
                        updateQuantity(item.id, Math.min(newQty, maxStock));
                      }
                    }}
                    min={1}
                    max={item.stock || 999}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= (item.stock || 999)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <Button asChild variant="ghost" className="gap-2 mt-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                <span className="font-medium text-foreground">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-emerald-500">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">Calculated at checkout</span>
              </div>
            </div>

            <div className="my-4 border-t border-border" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-foreground">${cartTotal.toFixed(2)}</span>
            </div>

            <Button asChild className="w-full gap-2" size="lg">
              <Link to="/checkout">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <Truck className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                    <Package className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
