import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Product, categories } from '@/data/products';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Minus,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  Save,
  X,
  Filter
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const InventoryPage: React.FC = () => {
  const { products, updateProduct, updateStock, addProduct, deleteProduct, currentUser, login } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockAdjust, setStockAdjust] = useState<{ product: Product; amount: string } | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Beverages',
    price: 0,
    unit: 'pcs',
    stock: 0,
    barcode: '',
    image: '',
    lowStockThreshold: 10,
  });
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner' || currentUser?.role === 'developer';
  const isCashier = currentUser?.role === 'cashier';
  // State for admin PIN confirmation
  const [showAdminPinDialog, setShowAdminPinDialog] = useState(false);
  const [pendingEditProduct, setPendingEditProduct] = useState<Product | null>(null);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery);
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesLowStock = !showLowStock || product.stock <= product.lowStockThreshold;
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, showLowStock]);
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;
  // Handle stock adjustment
  const handleStockAdjust = () => {
    if (stockAdjust && stockAdjust.amount) {
      const amount = parseFloat(stockAdjust.amount);
      if (!isNaN(amount)) {
        updateStock(stockAdjust.product.id, amount);
        setStockAdjust(null);
      }
    }
  };
  // Helper to check if price changed
  const priceChanged = (original: Product, edited: Product) => original.price !== edited.price;
  const handleSaveEdit = () => {
    if (editProduct) {
      // If cashier and price changed, require admin PIN
      if (isCashier && pendingEditProduct && priceChanged(pendingEditProduct, editProduct)) {
        setShowAdminPinDialog(true);
        return;
      }
      updateProduct(editProduct.id, editProduct);
      setEditProduct(null);
      setPendingEditProduct(null);
    }
  };
  // When opening edit modal, store original product for price comparison
  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setPendingEditProduct(product);
  };
  // Handle admin PIN confirmation
  const handleAdminPinConfirm = async () => {
    if (!adminPin) return setAdminPinError('Enter admin PIN');
    const success = await login(adminPin);
    if (success && (currentUser?.role === 'admin' || currentUser?.role === 'owner' || currentUser?.role === 'developer')) {
      if (editProduct) {
        updateProduct(editProduct.id, editProduct);
        setEditProduct(null);
        setPendingEditProduct(null);
      }
      setShowAdminPinDialog(false);
      setAdminPin('');
      setAdminPinError('');
    } else {
      setAdminPinError('Invalid admin PIN');
    }
  };
  // Handle add product
  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      addProduct(newProduct as Omit<Product, 'id'>);
      setShowAddModal(false);
      setNewProduct({
        name: '',
        category: 'Beverages',
        price: 0,
        unit: 'pcs',
        stock: 0,
        barcode: '',
        image: '',
        lowStockThreshold: 10,
      });
    }
  };
  const totalProducts = products.length;
  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            {products.length} products • {lowStockCount} low stock
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory || 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showLowStock ? "default" : "outline"}
            onClick={() => setShowLowStock(!showLowStock)}
            className="gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock ({lowStockCount})
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <span className="text-2xl">{product.image}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.barcode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    KES {product.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock} {product.unit}
                  </TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : product.stock <= product.lowStockThreshold ? (
                      <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Low Stock</Badge>
                    ) : (
                      <Badge className="bg-success/10 text-success hover:bg-success/20">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStockAdjust({ product, amount: '' })}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Adjust
                      </Button>
                      {(isAdmin || isCashier) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            disabled={isCashier && !isAdmin}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Stock Adjustment Modal */}
      <Dialog open={!!stockAdjust} onOpenChange={(open) => !open && setStockAdjust(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{stockAdjust?.product.image}</span>
              Adjust Stock: {stockAdjust?.product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Current stock: {stockAdjust?.product.stock} {stockAdjust?.product.unit}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setStockAdjust(prev => prev ? { ...prev, amount: String(parseFloat(prev.amount || '0') - 1) } : null)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={stockAdjust?.amount || ''}
                onChange={(e) => setStockAdjust(prev => prev ? { ...prev, amount: e.target.value } : null)}
                placeholder="Enter amount (+/-)"
                className="text-center text-xl"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setStockAdjust(prev => prev ? { ...prev, amount: String(parseFloat(prev.amount || '0') + 1) } : null)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use positive numbers to add stock, negative to remove
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockAdjust(null)}>Cancel</Button>
            <Button onClick={handleStockAdjust}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (KES)</label>
                  <Input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                    disabled={isCashier}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={editProduct.category} onValueChange={(v) => setEditProduct({ ...editProduct, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Barcode</label>
                  <Input
                    value={editProduct.barcode}
                    onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Low Stock Threshold</label>
                  <Input
                    type="number"
                    value={editProduct.lowStockThreshold}
                    onChange={(e) => setEditProduct({ ...editProduct, lowStockThreshold: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Admin PIN Confirmation Dialog (moved outside Edit Product Dialog) */}
      <Dialog open={showAdminPinDialog} onOpenChange={setShowAdminPinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Confirmation Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">Enter admin PIN to confirm price change.</p>
            <Input
              type="password"
              value={adminPin}
              onChange={e => setAdminPin(e.target.value)}
              placeholder="Admin PIN"
              maxLength={4}
            />
            {adminPinError && <p className="text-destructive text-sm">{adminPinError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminPinDialog(false)}>Cancel</Button>
            <Button onClick={handleAdminPinConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price (KES)</label>
                <Input
                  type="number"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Select value={newProduct.unit} onValueChange={(v: any) => setNewProduct({ ...newProduct, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="g">Grams</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="sachets">Sachets</SelectItem>
                    <SelectItem value="trays">Trays</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Initial Stock</label>
                <Input
                  type="number"
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Barcode</label>
              <Input
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                placeholder="Scan or enter barcode"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
};
