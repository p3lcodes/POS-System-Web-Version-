import React, { useState, useMemo } from 'react';
import { useStore, CartItem } from '@/store/useStore';
import { Product } from '@/data/products';
import { categories } from '@/data/products';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Barcode, 
  Minus, 
  Plus, 
  Trash2, 
  CreditCard,
  Banknote,
  Receipt,
  X,
  Check,
  Smartphone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const POSPage: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    getCartTotal,
    completeSale,
    currentUser
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [mpesaRef, setMpesaRef] = useState('');
  const [quantityModal, setQuantityModal] = useState<{ product: Product; show: boolean } | null>(null);
  const [tempQuantity, setTempQuantity] = useState('1');

  const cartTotal = getCartTotal();

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.barcode.includes(searchQuery);
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Handle barcode scan
  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput) {
      const product = products.find(p => p.barcode === barcodeInput);
      if (product) {
        addToCart(product, 1);
        setBarcodeInput('');
      }
    }
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    if (product.unit === 'kg' || product.unit === 'g') {
      setQuantityModal({ product, show: true });
      setTempQuantity('1');
    } else {
      addToCart(product, 1);
    }
  };

  // Handle quantity confirm
  const handleQuantityConfirm = () => {
    if (quantityModal) {
      const qty = parseFloat(tempQuantity) || 1;
      addToCart(quantityModal.product, qty);
      setQuantityModal(null);
    }
  };

  // Handle payment
  const handlePayment = (method: 'mpesa' | 'cash') => {
    const sale = completeSale(method, method === 'mpesa' ? mpesaRef : undefined);
    if (sale) {
      setLastSale(sale);
      setShowPayment(false);
      setShowReceipt(true);
      setMpesaRef('');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] pb-20 lg:pb-0">
      {/* Products Section */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Search & Barcode */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Scan barcode..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeScan}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="w-full whitespace-nowrap mb-4">
          <div className="flex gap-2 pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="shrink-0"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0"
              >
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Products Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pr-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                disabled={product.stock <= 0}
                className={cn(
                  "product-card text-left",
                  product.stock <= 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="text-3xl mb-2">{product.image}</div>
                <p className="font-medium text-sm line-clamp-2 mb-1">{product.name}</p>
                <p className="text-primary font-bold">KES {product.price}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {product.stock} {product.unit}
                  </span>
                  {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                    <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                      Low
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Sale</h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No items in cart</p>
              <p className="text-sm">Tap products or scan barcodes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="cart-item">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.product.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        KES {item.product.price} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-primary">
                      KES {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart Total & Checkout */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold text-primary">
              KES {cartTotal.toLocaleString()}
            </span>
          </div>
          <Button
            className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Checkout
          </Button>
        </div>
      </div>

      {/* Quantity Modal */}
      <Dialog open={quantityModal?.show} onOpenChange={(open) => !open && setQuantityModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{quantityModal?.product.image}</span>
              {quantityModal?.product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground">
                Quantity ({quantityModal?.product.unit})
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={tempQuantity}
                onChange={(e) => setTempQuantity(e.target.value)}
                className="mt-1 text-2xl h-14 text-center"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {['0.25', '0.5', '1', '2'].map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTempQuantity(q)}
                >
                  {q} {quantityModal?.product.unit}
                </Button>
              ))}
            </div>
            <Button className="w-full h-12" onClick={handleQuantityConfirm}>
              <Plus className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center p-6 bg-secondary/50 rounded-xl">
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="text-4xl font-bold text-primary mt-1">
                KES {cartTotal.toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full h-14 text-lg bg-success hover:bg-success/90"
                onClick={() => handlePayment('mpesa')}
              >
                <Smartphone className="w-6 h-6 mr-3" />
                M-Pesa Lipa na Till
              </Button>

              <div className="relative">
                <Input
                  placeholder="M-Pesa Reference (optional)"
                  value={mpesaRef}
                  onChange={(e) => setMpesaRef(e.target.value)}
                  className="mb-3"
                />
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-sm">or</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <Button
                variant="outline"
                className="w-full h-14 text-lg"
                onClick={() => handlePayment('cash')}
              >
                <Banknote className="w-6 h-6 mr-3" />
                Cash Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <div className="receipt">
            <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
              <h2 className="text-xl font-bold">FreshFity Supermarket</h2>
              <p className="text-xs text-gray-500">Nairobi, Kenya</p>
              <p className="text-xs text-gray-500">Till: 123456</p>
            </div>
            
            <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Date: {new Date(lastSale?.timestamp).toLocaleDateString('en-KE')}</span>
                <span>Time: {new Date(lastSale?.timestamp).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-gray-500">Cashier: {lastSale?.cashierName}</p>
              <p className="text-xs text-gray-500">Receipt #: {lastSale?.id?.slice(-8)}</p>
            </div>

            <div className="space-y-2 border-b border-dashed border-gray-300 pb-4 mb-4">
              {lastSale?.items.map((item: CartItem, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="flex-1">{item.product.name}</span>
                  <span className="w-12 text-center">x{item.quantity}</span>
                  <span className="w-20 text-right">{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span>
                <span>KES {lastSale?.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Payment</span>
                <span>{lastSale?.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash'}</span>
              </div>
              {lastSale?.mpesaRef && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Ref</span>
                  <span>{lastSale.mpesaRef}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-300">
              <p className="text-xs text-gray-500">Thank you for shopping with us!</p>
              <p className="text-xs text-gray-500">Please come again 🛒</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowReceipt(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button className="flex-1" onClick={() => window.print()}>
              <Receipt className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
