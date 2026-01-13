import React, { useState, useMemo } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { stkPush, mpesaConfig } from '@/lib/mpesaDaraja';
import { useStore } from '@/store/useStore';
import { Product } from '@/data/products';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Barcode,
  Receipt,
  Plus,
  X,
  FileX,
  Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    removeFromCart,
    clearCart,
    getCartTotal,
    completeSale,
    isShiftActive,
    cartTabs,
    activeTabId,
    addCartTab,
    switchCartTab,
    removeCartTab
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showCameraScan, setShowCameraScan] = useState(false);

  // Not found modal state
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  // Camera error state
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Last scanned barcode to prevent rapid duplicate processing
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // Handle camera barcode scan
  const handleCameraScan = (err: any, result: any) => {
    if (result?.text) {
      const code = result.text;
      
      // Prevent processing the same code multiple times in a short window
      if (code === lastScannedCode) return;
      
      const product = products.find(p => p.barcode === code);
      if (product) {
        addToCart(product, 1);
        setLastScannedCode(code);
        // Optional: Play a beep sound here
        setShowCameraScan(false);
      } else {
        // If product not found, don't close the camera immediately.
        // Just show an error message so the user can try again.
        setLastScannedCode(code);
        setCameraError(`Product not found: ${code}`);
        
        // Allow scanning the same (or different) code again after a delay
        setTimeout(() => {
            setLastScannedCode(null);
            setCameraError(null);
        }, 3000);
      }
    }
    
    // Ignore benign scanning errors
    if (err) {
      console.log("Scanner Error:", err); // Log to console
      // Show exact error on screen for mobile debugging
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
         setCameraError('Camera permission denied.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
         setCameraError('No camera found.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
         setCameraError('Camera is in use by another app.');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
         setCameraError('Camera constraints failed.');
      } else if (err.name === 'StreamApiNotSupportedError') {
         setCameraError('Browser not supported.');
      } else {
         // Show unknown errors so we can debug
         setCameraError(`Camera Error: ${err.name} - ${err.message}`);
      }
    }
  };

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showMpesaPrompt, setShowMpesaPrompt] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaError, setMpesaError] = useState('');
  const [quantityModal, setQuantityModal] = useState<{ product: Product; show: boolean } | null>(null);
  const [tempQuantity, setTempQuantity] = useState('1');
  // Cash payment modal state
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [cashError, setCashError] = useState('');

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
      } else {
        setNotFoundBarcode(barcodeInput);
        setBarcodeInput('');
      }
    }
  };
      {/* Not Found Modal */}
      <Dialog open={!!notFoundBarcode} onOpenChange={open => !open && setNotFoundBarcode(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Product Not Found</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="mb-2">No product found with barcode:</p>
            <div className="font-mono text-lg mb-4">{notFoundBarcode}</div>
            <p className="mb-4">Would you like to add this product to inventory?</p>
            <Button onClick={() => {
              // Redirect to inventory page or open add product modal (customize as needed)
              window.location.href = '/inventory';
            }}>Add Product</Button>
            <Button variant="outline" className="ml-2" onClick={() => setNotFoundBarcode(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

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
    if (method === 'mpesa') {
      setShowMpesaPrompt(true);
      return;
    }
    // Open cash modal for input
    setShowCashModal(true);
    setCashGiven('');
    setCashError('');
  };

  const handleCashConfirm = () => {
    const total = cartTotal;
    const given = parseFloat(cashGiven);
    if (isNaN(given) || given < total) {
      setCashError('Cash given must be at least the total amount.');
      return;
    }
    const sale = completeSale('cash');
    if (sale) {
      setLastSale({ ...sale, cashGiven: given, change: given - total });
      setShowCashModal(false);
      setShowPayment(false);
      setShowReceipt(true);
      clearCart();
    }
  };

  const handleMpesaPay = async () => {
    setMpesaLoading(true);
    setMpesaError('');
    try {
      // Call Daraja STK Push (stub)
      await stkPush(mpesaConfig, mpesaPhone, getCartTotal(), 'POS', 'POS Payment');
      setShowMpesaPrompt(false);
      setShowPayment(false);
      setMpesaPhone('');
      clearCart();
      setShowReceipt(true);
    } catch (err: any) {
      console.error("M-Pesa Error:", err);
      setMpesaError(err.message || 'Failed to initiate payment.');
    } finally {
      setMpesaLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row h-[calc(100vh-9rem)] bg-background overflow-hidden">
      {/* Watermark Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center z-50 pointer-events-none transition-all duration-700",
        cart.length > 0 
          ? "opacity-[0.05] scale-90 blur-[0px]" 
          : "opacity-100 scale-100"
      )}>
        <img 
          src="/rosemarylogo-.png" 
          alt="" 
          className="w-[300px] h-auto object-contain drop-shadow-md" 
        />
      </div>

      {/* Shift Block Overlay */}
      {!isShiftActive && (
        <div className="absolute inset-0 z-[60] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
          <Lock className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Shift is Inactive</h2>
          <p className="text-muted-foreground max-w-md">
            You must start a shift to access the POS system. Please click "Start Shift" in the top header.
          </p>
        </div>
      )}

      {/* Product Scan/Search - Left Side (Flexible width) */}
      <div className="flex-1 bg-card border-r border-border flex flex-col p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scan or Search Product</h2>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={clearCart}
            disabled={cart.length === 0}
            className="gap-2"
          >
            <FileX className="w-4 h-4" />
            End Sale (Clear)
          </Button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <div className="relative mb-4">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Scan barcode..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeScan}
            className="pl-10 h-12 text-lg"
          />
          <Button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 text-xs"
            onClick={() => setShowCameraScan(true)}
          >
            Camera Scan
          </Button>
        </div>

        {/* Camera Scan Modal */}
        <Dialog open={showCameraScan} onOpenChange={(open) => {
          setShowCameraScan(open);
          if (!open) {
            setCameraError(null);
            setLastScannedCode(null);
          }
        }}>
          <DialogContent className="max-w-full w-[95vw] sm:w-[400px] p-2 sm:p-6">
            <DialogHeader>
              <DialogTitle>Scan Barcode with Camera</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2 sm:py-4">
              
              {/* Show error if permissions are denied, but keep scanner mounted */}
              {cameraError && (
                 <div className="text-white bg-red-600 px-3 py-1 rounded text-center text-sm mb-2 w-full">
                   {cameraError}
                 </div>
              )}

              {/* Show last scanned success message overlay */}
              {lastScannedCode && !cameraError && (
                 <div className="text-white bg-green-600 px-3 py-1 rounded text-center text-sm mb-2 w-full">
                   Scanned: {lastScannedCode}
                 </div>
              )}

              <div className="overflow-hidden rounded-lg border bg-black">
                <BarcodeScannerComponent
                  width={window.innerWidth < 500 ? window.innerWidth * 0.9 : 320}
                  height={window.innerWidth < 500 ? window.innerWidth * 0.9 : 320}
                  onUpdate={handleCameraScan}
                  delay={500} // Reduce CPU usage, scan every 500ms
                />
              </div>

              <Button variant="outline" onClick={() => setShowCameraScan(false)}>
                Close Camera
              </Button>
              <div className="text-xs text-muted-foreground text-center">Tip: For best results, hold your phone steady and ensure the barcode is well-lit and in focus.</div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Product List (search results) - only show if user is typing */}
        {(searchQuery.trim() !== '' || barcodeInput.trim() !== '') && (
          <ScrollArea className="flex-1 bg-background/50 rounded-md border p-2 mt-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No products found</div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredProducts.map(product => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between py-3 px-3 cursor-pointer hover:bg-accent rounded-lg transition-colors border-b last:border-0"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{product.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{product.barcode}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">KES {product.price.toLocaleString()}</div>
                      <span className="text-xs text-muted-foreground">{product.stock} {product.unit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        )}
      </div>

      {/* Receipt - Right Side */}
      <div className="w-full lg:w-[32rem] bg-card flex flex-col h-full border-l border-border shadow-lg z-10">
        <div className="p-4 border-b border-border text-center">
          {/* Supermarket Receipt Header - Printed Style */}
          <div className="flex flex-col items-center mb-2" style={{ fontFamily: 'monospace' }}>
            <span className="font-bold text-lg">FRESH FITY SUPERMARKET</span>
            <span className="text-xs">Ruiru</span>
            <span className="text-xs">Tel: 0712 345678</span>
            <span className="text-xs">Receipt #: {Math.floor(Math.random()*1000000)}</span>
            <hr className="w-2/3 my-2 border-dashed border-border" />
            <span className="text-xs">Thank you for shopping with us!</span>
          </div>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
          <hr className="my-2 border-dashed border-border" />
        </div>
        {/* Receipt Items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No items scanned</p>
              <p className="text-sm">Scan or search products to add</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-card border border-border rounded shadow p-4 mx-auto max-w-md receipt-container transition-colors" style={{ fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.01em' }}>
              <table className="w-full mb-2 text-foreground">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-bold pb-1 text-foreground">Item</th>
                    <th className="text-center font-bold pb-1 text-foreground">Qty</th>
                    <th className="text-right font-bold pb-1 text-foreground">Price</th>
                    <th className="text-right font-bold pb-1 text-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.product.id} className={
                      `border-b border-dashed border-border${idx === cart.length - 1 ? ' last-product-row' : ''}`
                    }>
                      <td className="text-left py-1 text-foreground">{item.product.name}</td>
                      <td className="text-center py-1 text-foreground">{item.quantity}</td>
                      <td className="text-right py-1 text-foreground">{item.product.price.toLocaleString()}</td>
                      <td className="text-right py-1 text-foreground">{(item.product.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                  {/* Add extra space after last product row */}
                  <tr><td colSpan={4} style={{ height: '18px' }}></td></tr>
                </tbody>
              </table>
              <hr className="my-2 border-dashed border-border" />
              {/* Subtotal, Tax, Total */}
              <div className="flex flex-col gap-1 mb-2 text-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (0%)</span>
                  <span>KES 0</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>KES {cartTotal.toLocaleString()}</span>
                </div>
              </div>
              <hr className="my-2 border-dashed border-border" />
              {/* Payment Method */}
              <div className="flex justify-between text-sm mb-1 text-foreground">
                <span>Payment</span>
                <span>{lastSale?.method ? lastSale.method.toUpperCase() : 'Pending'}</span>
              </div>
              {lastSale?.ref && (
                <div className="flex justify-between text-xs mb-1 text-foreground">
                  <span>Txn Ref</span>
                  <span>{lastSale.ref}</span>
                </div>
              )}
              <div className="text-center text-xs text-muted-foreground mt-2">Thank you for shopping with us!</div>
            </div>
          )}
        </ScrollArea>

        {/* Total & Payment - Under Receipt */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold text-primary">
              KES {cartTotal.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handlePayment('cash')} size="lg" disabled={cart.length === 0}>
              Cash Payment
            </Button>
            <Button onClick={() => handlePayment('mpesa')} size="lg" variant="secondary" disabled={cart.length === 0}>
              M-Pesa
            </Button>
          </div>
              {/* Cash Payment Modal */}
              <Dialog open={showCashModal} onOpenChange={setShowCashModal}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Cash Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">Enter cash given by customer.</p>
                    <Input
                      type="number"
                      placeholder="Enter cash given"
                      value={cashGiven}
                      onChange={e => setCashGiven(e.target.value)}
                      autoFocus
                    />
                    {cashGiven && !isNaN(Number(cashGiven)) && Number(cashGiven) >= cartTotal && (
                      <div className="bg-green-100 border border-green-400 text-green-800 rounded px-2 py-1 text-sm font-semibold">
                        Give the Customer balance of KES {(Number(cashGiven) - cartTotal).toLocaleString()}
                      </div>
                    )}
                    {cashError && <p className="text-red-500 text-sm">{cashError}</p>}
                    <Button onClick={handleCashConfirm} className="w-full">
                      Confirm Payment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
        </div>

        {/* Cart Tabs */}
        <div className="border-t border-border bg-muted/50 p-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {cartTabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => switchCartTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors border select-none shrink-0",
                  activeTabId === tab.id 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                {cartTabs.length > 1 && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCartTab(tab.id);
                    }}
                    className="p-0.5 hover:bg-black/20 rounded ml-1"
                  >
                   <X className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addCartTab}
              className="h-9 w-9 flex items-center justify-center rounded-md bg-background border border-dashed border-muted-foreground/30 cursor-pointer hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Add Customer Tab"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Modal */}
      <Dialog open={!!quantityModal?.show} onOpenChange={(open) => !open && setQuantityModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Quantity</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <Input
              type="number"
              value={tempQuantity}
              onChange={(e) => setTempQuantity(e.target.value)}
              autoFocus
            />
            <span className="text-sm text-muted-foreground">{quantityModal?.product.unit}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setQuantityModal(null)}>Cancel</Button>
            <Button onClick={handleQuantityConfirm}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* M-Pesa Prompt Modal */}
      <Dialog open={showMpesaPrompt} onOpenChange={setShowMpesaPrompt}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>M-Pesa Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Enter customer phone number to send STK push.</p>
            <Input
              placeholder="Phone Number (e.g., 2547...)"
              value={mpesaPhone}
              onChange={e => setMpesaPhone(e.target.value)}
            />
            {mpesaError && <p className="text-red-500 text-sm">{mpesaError}</p>}
            <Button onClick={handleMpesaPay} disabled={mpesaLoading} className="w-full">
              {mpesaLoading ? 'Processing...' : 'Send STK Push'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal (Success) */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md print:max-w-full print:p-0 dark:border-border">
          <div
            className="thermal-receipt mx-auto dark:bg-card dark:text-foreground"
            style={{
              fontFamily: 'monospace',
              width: '58mm',
              minHeight: '120mm',
              // background: 'white', // Handled by class
              // color: 'black',      // Handled by class
              padding: '12px 0',
              border: '1px solid var(--border)',
              boxShadow: '0 0 0.5mm #ccc',
              margin: '0 auto',
              fontSize: '12px',
              letterSpacing: '0.01em',
              position: 'relative',
            }}
          >
            <div className="text-center mb-2">
              <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>FRESH FITY SUPERMARKET</div>
              <div>Ruiru</div>
              <div>Tel: 0712 345678</div>
              <div>Receipt #: {lastSale?.id || Math.floor(Math.random()*1000000)}</div>
              <div>{new Date().toLocaleString()}</div>
              <div style={{ borderTop: '1px dashed #222', margin: '6px 0' }}></div>
            </div>
            <table style={{ width: '100%', marginBottom: 6 }}>
              <thead>
                <tr style={{ borderBottom: '1px dashed #222' }}>
                  <th style={{ textAlign: 'left' }}>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {lastSale?.items?.map((item: any) => (
                  <tr key={item.product.id}>
                    <td style={{ textAlign: 'left', padding: '2px 0' }}>{item.product.name}</td>
                    <td style={{ textAlign: 'center', padding: '2px 0' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{item.product.price.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{(item.product.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderTop: '1px dashed #222', margin: '6px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>Subtotal</span>
              <span>KES {lastSale?.total?.toLocaleString() ?? cartTotal.toLocaleString()}</span>
            </div>
            {lastSale?.cashGiven !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>Cash Given</span>
                <span>KES {lastSale.cashGiven.toLocaleString()}</span>
              </div>
            )}
            {lastSale?.change !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontWeight: 'bold' }}>
                <span>Change</span>
                <span>KES {lastSale.change.toLocaleString()}</span>
              </div>
            )}
            {lastSale?.method && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>Payment</span>
                <span>{lastSale.method.toUpperCase()}</span>
              </div>
            )}
            {lastSale?.ref && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>Txn Ref</span>
                <span>{lastSale.ref}</span>
              </div>
            )}
            <div className="text-center" style={{ marginTop: 8 }}>Thank you for shopping with us!</div>
            {/* Extra blank space for paper tear */}
            <div style={{ height: '40mm' }}></div>
            <div className="flex justify-center gap-2 pt-4 print:hidden">
              <Button variant="outline" onClick={() => setShowReceipt(false)}>Close</Button>
              <Button onClick={() => window.print()}>Print Receipt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};
