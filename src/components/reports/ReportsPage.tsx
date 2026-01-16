import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { API_BASE_URL } from '@/config/api';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  ArrowRight,
  Smartphone, // for MPesa
  Banknote,    // for Cash
  AlertTriangle,
  RefreshCw,
  Clock,
  List,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from "@/components/ui/progress"
import { AuditLogs } from './AuditLogs';

export const ReportsPage: React.FC = () => {
  const { currentUser, products, updateStock, fetchProducts, shifts, currentShift } = useStore();
  const [range, setRange] = useState('today');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showSoldItems, setShowSoldItems] = useState(false);
  const [showStockList, setShowStockList] = useState(false);
  const [showMpesaList, setShowMpesaList] = useState(false);
  const [showShiftList, setShowShiftList] = useState(false);
  const [showCashList, setShowCashList] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [soldItemsList, setSoldItemsList] = useState<any[]>([]);
  const [mpesaTransactions, setMpesaTransactions] = useState<any[]>([]);
  const [cashTransactions, setCashTransactions] = useState<any[]>([]);

  // Fetch Dashboard Stats from Backend
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/stats?range=${range}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Detailed Sales for Lists
  const fetchDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales`); // Get all sales
      const allSales = await res.json();
      
      // Filter client-side for simplicity on modals for now
      // (Ideally backend would filter these too)
      
      // Flatten for "Sold Items"
      const items: any[] = [];
      const mpesaTxns: any[] = [];
      const cashTxns: any[] = [];

      allSales.forEach((sale: any) => {
        // M-Pesa
        if (sale.paymentMethod === 'mpesa') {
          mpesaTxns.push({
            id: sale.id,
            ref: sale.mpesaRef || 'N/A',
            phone: sale.mpesaPhone || 'N/A', // Assuming we save this
            amount: sale.total,
            cashier: sale.cashierName,
            time: sale.timestamp,
            mode: sale.mpesaRef ? 'Prompt' : 'Manual' 
          });
        }
        
        // Cash
        if (sale.paymentMethod === 'cash') {
          cashTxns.push({
            id: sale.id,
            amount: sale.total,
            cashier: sale.cashierName,
            time: sale.timestamp,
            cashGiven: sale.cashGiven || 0,
            change: sale.change || 0
          });
        }
        
        // Items
        sale.items.forEach((item: any) => {
          items.push({
            ...item,
            saleId: sale.id,
            time: sale.timestamp,
            cashier: sale.cashierName
          });
        });
      });
      
      // Sort detailed lists by time desc
      setSoldItemsList(items.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
      setMpesaTransactions(mpesaTxns.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
      setCashTransactions(cashTxns.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()));

    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
    fetchDetails(); // Pre-fetch for modals
  }, [range]);

  const stockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6 bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Reports</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Cashier: {currentUser?.name || 'Admin'}</span>
            <span className="text-slate-300">|</span>
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2 bg-white" onClick={() => setShowAuditLogs(true)}>
            <List className="w-4 h-4" />
            Audit Logs
          </Button>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px] bg-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchStats} className={cn(loading && "animate-spin")}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg relative overflow-hidden">
           <div className="relative z-10">
             <div className="text-blue-100 text-sm font-medium mb-1">Total Sales ({range})</div>
             <div className="text-3xl font-bold flex items-baseline">
               KES {(stats?.totalRevenue || 0).toLocaleString()}
             </div>
             <div className="mt-4 flex items-center text-sm text-blue-100">
               <TrendingUp className="w-4 h-4 mr-1" />
               {(stats?.totalCount || 0)} Transactions
             </div>
           </div>
           <DollarSign className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10 rotate-12" />
        </Card>

        {/* Goods Sold */}
        <Card 
          className="p-4 bg-white hover:bg-slate-50 cursor-pointer transition-all border-l-4 border-l-purple-500 shadow-sm"
          onClick={() => setShowSoldItems(true)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-muted-foreground text-sm font-medium mb-1">Goods Sold</div>
              <div className="text-2xl font-bold text-purple-700">
                {soldItemsList.length.toLocaleString()} <span className="text-base font-normal text-muted-foreground">items</span>
              </div>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground flex items-center group-hover:text-purple-600 transition-colors">
            View Item List <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </Card>

        {/* Stock Status */}
        <Card 
          className="p-4 bg-white hover:bg-slate-50 cursor-pointer transition-all border-l-4 border-l-orange-500 shadow-sm"
          onClick={() => setShowStockList(true)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-muted-foreground text-sm font-medium mb-1">Stock Status</div>
              <div className="flex items-center gap-2">
                 {lowStockProducts.length > 0 ? (
                    <Badge variant="destructive" className="animate-pulse">Low Space!</Badge>
                 ) : (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Healthy</Badge>
                 )}
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-700">
                {totalStockCount.toLocaleString()} <span className="text-base font-normal text-muted-foreground">units</span>
              </div>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground flex items-center group-hover:text-orange-600 transition-colors">
            {lowStockProducts.length} items low <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </Card>

        {/* Shifts */}
        <Card 
          className="p-4 bg-white hover:bg-slate-50 cursor-pointer transition-all border-l-4 border-l-blue-400 shadow-sm"
          onClick={() => setShowShiftList(true)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-muted-foreground text-sm font-medium mb-1">Active Shift</div>
                {currentShift ? (
                  <div>
                    <div className="text-lg font-bold text-slate-800 truncate max-w-[120px]">
                      {currentShift.cashierName}
                    </div>
                    <div className="text-xs text-green-600 font-medium flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(currentShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 font-medium">No Active Shift</div>
                )}
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground flex items-center group-hover:text-blue-600 transition-colors">
             Shift History <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </Card>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Methods Breakdown */}
        <Card className="col-span-1 lg:col-span-2 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" /> Payment Methods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* MPESA Card */}
             <div 
               className="bg-green-50 rounded-xl p-4 border border-green-100 cursor-pointer hover:shadow-md transition-all group"
               onClick={() => setShowMpesaList(true)}
             >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <Smartphone className="w-6 h-6 text-green-600" /> 
                  </div>
                  <Badge className="bg-green-200 text-green-800 hover:bg-green-300">Detailed View</Badge>
                </div>
                <div className="text-sm text-green-800 font-medium">M-Pesa Transfers</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                   KES {(stats?.payments?.find((p:any) => p.paymentMethod === 'mpesa')?.total || 0).toLocaleString()}
                </div>
                <div className="text-xs text-green-600 mt-2 flex items-center group-hover:underline">
                  View {stats?.payments?.find((p:any) => p.paymentMethod === 'mpesa')?.count || 0} Transactions <ArrowRight className="w-3 h-3 ml-1" />
                </div>
             </div>

             {/* Cash Card */}
             <div 
                className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:shadow-md transition-all group"
                onClick={() => setShowCashList(true)}
             >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-slate-500/10 p-2 rounded-full">
                    <Banknote className="w-6 h-6 text-slate-600" /> 
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center group-hover:text-slate-600 transition-colors">
                     View {stats?.payments?.find((p:any) => p.paymentMethod === 'cash')?.count || 0} Transactions <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 font-medium">Cash Payments</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                   KES {(stats?.payments?.find((p:any) => p.paymentMethod === 'cash')?.total || 0).toLocaleString()}
                </div>
             </div>
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card className="p-6 shadow-sm">
           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-orange-500" /> Top Selling
           </h3>
           <ScrollArea className="h-[300px] pr-4">
             {stats?.topProducts?.map((item: any, i: number) => (
                <div key={i} className="mb-4 last:mb-0 group">
                   <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium group-hover:text-primary transition-colors">{item.productName}</span>
                     <span className="text-muted-foreground">{item.sold} sold</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", 
                          i === 0 ? "bg-orange-500" : 
                          i === 1 ? "bg-orange-400" : 
                          i === 2 ? "bg-orange-300" : "bg-slate-300"
                        )}
                        style={{ width: `${(item.sold / (stats?.topProducts[0]?.sold || 1)) * 100}%` }}
                      ></div>
                   </div>
                   <div className="text-xs text-muted-foreground mt-1 text-right">
                     Rev: KES {item.revenue.toLocaleString()}
                   </div>
                </div>
             ))}
             {!stats?.topProducts?.length && (
               <div className="text-center text-muted-foreground py-8">No sales yet</div>
             )}
           </ScrollArea>
        </Card>
      </div>

      {/* --- MODALS --- */}

      {/* 1. M-Pesa Detailed List */}
      <Dialog open={showMpesaList} onOpenChange={setShowMpesaList}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" /> M-Pesa Transactions
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Code (Ref)</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Cashier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mpesaTransactions.map((txn, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">
                       {new Date(txn.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{txn.ref}</TableCell>
                    <TableCell>{txn.phone}</TableCell>
                    <TableCell className="font-bold">KES {txn.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={txn.mode === 'Prompt' ? 'default' : 'secondary'}>{txn.mode}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{txn.cashier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Goods Sold List */}
      <Dialog open={showSoldItems} onOpenChange={setShowSoldItems}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" /> Goods Sold List
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Cashier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soldItemsList.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">
                       {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                    </TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right text-xs">KES {item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-purple-700">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{item.cashier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Shift History List */}
      <Dialog open={showShiftList} onOpenChange={setShowShiftList}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Shift History
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Active Shift First */}
                {currentShift && (
                  <TableRow className="bg-green-50">
                    <TableCell className="font-bold">{currentShift.cashierName} (Active)</TableCell>
                    <TableCell>{new Date(currentShift.startTime).toLocaleString()}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="animate-pulse">Ongoing...</TableCell>
                  </TableRow>
                )}
                {shifts.map((shift, i) => (
                  <TableRow key={i}>
                    <TableCell>{shift.cashierName}</TableCell>
                    <TableCell>{new Date(shift.startTime).toLocaleString()}</TableCell>
                    <TableCell>{shift.endTime ? new Date(shift.endTime).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>
                      {shift.endTime 
                        ? ((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60)).toFixed(2) + ' hrs'
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 3. Global Stock List */}
      <Dialog open={showStockList} onOpenChange={setShowStockList}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" /> Full Stock Inventory
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                   <TableHead>Product Name</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead className="text-right">Stock Level</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.sort((a,b) => a.stock - b.stock).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-right font-mono text-lg">{p.stock} <span className="text-xs text-muted-foreground">{p.unit}</span></TableCell>
                    <TableCell>
                       {p.stock === 0 ? <Badge variant="destructive">Empty</Badge> : 
                        p.stock <= p.lowStockThreshold ? <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Low</Badge> :
                        <Badge variant="outline" className="text-green-600 border-green-200">OK</Badge>
                       }
                    </TableCell>
                    <TableCell className="text-right">
                       <Button size="sm" variant="outline" onClick={() => updateStock(p.id, 10)}>
                         + Restock
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. Cash Transactions List */}
      <Dialog open={showCashList} onOpenChange={setShowCashList}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-slate-600" /> Cash Transactions
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Cash Given</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Cashier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashTransactions.map((txn, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">
                       {new Date(txn.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell className="font-bold">KES {txn.amount.toLocaleString()}</TableCell>
                    <TableCell>KES {(txn.cashGiven || txn.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 font-medium">KES {(txn.change || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{txn.cashier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      {/* Audit Logs Modal */}
      <Dialog open={showAuditLogs} onOpenChange={setShowAuditLogs}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <AuditLogs />
        </DialogContent>
      </Dialog>
    </div>
  );
};
