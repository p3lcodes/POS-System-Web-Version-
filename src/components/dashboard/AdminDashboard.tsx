import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { 
    AlertTriangle, 
    TrendingUp, 
    CreditCard, 
    Users, 
    AlertOctagon, 
    Clock, 
    ArrowRight,
    Package,
    Truck,
    Settings,
    Phone,
    MessageCircle,
    MessageSquare,
    Plus,
    List
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6'];

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard = ({ onNavigate }: AdminDashboardProps) => {
    const { currentUser, products, isShiftActive, currentShift, sales, notifications, suppliers, addSupplier } = useStore();
    const [timeRange, setTimeRange] = useState('today');
    const [showSuppliers, setShowSuppliers] = useState(false);
    const [showAddSupplier, setShowAddSupplier] = useState(false);
    
    // Supplier Form State
    const [newSupplierName, setNewSupplierName] = useState('');
    const [newSupplierPhone, setNewSupplierPhone] = useState('');
    const [newSupplierGoods, setNewSupplierGoods] = useState('');

    const [restockSupplier, setRestockSupplier] = useState<any | null>(null);
    const [restockItem, setRestockItem] = useState('');
    const [restockAmount, setRestockAmount] = useState('');
    const [customRestockItem, setCustomRestockItem] = useState('');


    // --- REAL DATA CALCULATIONS ---

    // 1. Low Stock
    const lowStockItems = products.filter(p => p.stock <= (p.lowStockThreshold || 5));

    // 2. Profit & Revenue (Yesterday vs Today)
    const todaySales = sales.filter(s => isToday(new Date(s.timestamp)));
    const yesterdaySales = sales.filter(s => isYesterday(new Date(s.timestamp)));
    
    // Simulating Profit (20% margin) as we don't have cost price yet
    const profitToday = todaySales.reduce((acc, s) => acc + s.total, 0) * 0.2;
    const profitYesterday = yesterdaySales.reduce((acc, s) => acc + s.total, 0) * 0.2;
    
    // Trend Calculation
    let profitTrend = 0;
    if (profitYesterday > 0) {
        profitTrend = ((profitToday - profitYesterday) / profitYesterday) * 100;
    }
    const trendLabel = profitYesterday === 0 ? "+100%" : `${profitTrend > 0 ? '+' : ''}${profitTrend.toFixed(1)}%`;


    // 3. Top Cashier Calculation
    const cashierPerformance: Record<string, number> = {};
    todaySales.forEach(sale => {
        const name = sale.cashierName || 'Unknown';
        cashierPerformance[name] = (cashierPerformance[name] || 0) + sale.total;
    });
    
    // Find top cashier
    let topCashierName = 'None';
    let topCashierAmount = 0;
    let topCashierCount = 0; // count of sales

    Object.entries(cashierPerformance).forEach(([name, total]) => {
        if (total > topCashierAmount) {
            topCashierAmount = total;
            topCashierName = name;
             // Get count
             topCashierCount = todaySales.filter(s => s.cashierName === name).length;
        }
    });

    // 4. Graph Data (Last 7 Days)
    // We would normally aggregate this properly. For now, let's just show mock daily format mixed with real today
    const graphData = [
      { name: 'Mon', revenue: 4000, profit: 800 },
      { name: 'Tue', revenue: 3000, profit: 600 },
      { name: 'Wed', revenue: 2000, profit: 400 },
      { name: 'Thu', revenue: 2780, profit: 556 },
      { name: 'Fri', revenue: 1890, profit: 378 },
      { name: 'Sat', revenue: 2390, profit: 478 }, // Mock
      { name: 'Today', revenue: profitToday / 0.2, profit: profitToday }, // Real-ish
    ];

    // 5. Payment Methods
    const cashTotal = todaySales.filter(s => s.paymentMethod === 'cash').reduce((acc,s) => acc + s.total, 0);
    const mpesaTotal = todaySales.filter(s => s.paymentMethod === 'mpesa').reduce((acc,s) => acc + s.total, 0);
    
    const paymentData = [
        { name: 'Cash', value: cashTotal > 0 ? cashTotal : 1 }, // Fallback for chart
        { name: 'M-Pesa', value: mpesaTotal > 0 ? mpesaTotal : 1 },
    ];

    // 6. Recent Activity (Replacing Suspicious)
    // Combine notifications, recent sales, shift changes
    const recentActivity = [
        ...notifications.slice(0, 3).map(n => ({
            id: n.id,
            time: format(new Date(n.timestamp), 'h:mm a'),
            title: n.title,
            details: n.message,
            type: n.type === 'low-stock' ? 'alert' : 'info'
        })),
        ...(isShiftActive && currentShift ? [{
            id: 'shift-start',
            time: format(new Date(currentShift.startTime), 'h:mm a'),
            title: 'Shift Started',
            details: `${currentShift.cashierName} opened the register`,
            type: 'success'
        }] : [])
    ];

    // Handlers
    const handleRequestStock = (method: 'whatsapp' | 'sms') => {
        if (!restockSupplier) return;
        
        const item = restockItem === 'Other' ? customRestockItem : restockItem;
        const message = `Hi ${restockSupplier.name}, please supply: ${item}, Quantity: ${restockAmount}. From FreshFity Supermarket.`;
        const encoded = encodeURIComponent(message);
        
        if (method === 'whatsapp') {
             window.open(`https://wa.me/${restockSupplier.phone}?text=${encoded}`, '_blank');
        } else {
             window.open(`sms:${restockSupplier.phone}?body=${encoded}`, '_target');
        }
        setRestockSupplier(null);
        setRestockItem('');
        setCustomRestockItem('');
        setRestockAmount('');
    };

    const handleAddSupplier = () => {
        if (!newSupplierName || !newSupplierPhone) return;
        
        const goodsArray = newSupplierGoods.split(',').map(g => g.trim()).filter(g => g.length > 0);
        
        addSupplier({
            name: newSupplierName,
            phone: newSupplierPhone,
            goods: goodsArray
        });
        
        setNewSupplierName('');
        setNewSupplierPhone('');
        setNewSupplierGoods('');
        setShowAddSupplier(false);
    };


    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Custom Dashboard Header */}
            <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rouned-full bg-blue-100 flex items-center justify-center rounded-full text-blue-600 font-bold">
                        {currentUser?.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Welcome, {currentUser?.name}</h1>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(), 'EEEE, d MMMM')}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                System Online
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     <Button variant="ghost" size="icon" onClick={() => onNavigate('settings')}>
                        <Settings className="w-5 h-5 text-slate-500"/>
                     </Button>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
                
                {/* Quick Shortcuts */}
                <div className="flex gap-4 mb-2 overflow-x-auto pb-2">
                    
                    {/* Manage Stock Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700">
                                <Package className="mr-2 h-4 w-4 text-blue-500"/> Manage Stock
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Stock Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onNavigate('inventory')} className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" /> Add New Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onNavigate('inventory')} className="cursor-pointer">
                                <List className="mr-2 h-4 w-4" /> View Inventory
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Suppliers Button */}
                    <Button 
                        variant="outline" 
                        onClick={() => setShowSuppliers(true)}
                        className="bg-white border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                    >
                        <Truck className="mr-2 h-4 w-4 text-orange-500"/> Suppliers
                    </Button>

                    <Button variant="outline" onClick={() => onNavigate('settings')} className="bg-white border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700">
                        <Users className="mr-2 h-4 w-4 text-green-500"/> Manage Staff
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Profit Card */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-100 uppercase tracking-wider">Yesterday's Profit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">KES {profitYesterday.toLocaleString()}</div>
                            <div className="text-xs text-indigo-200 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> {trendLabel} from day before
                            </div>
                        </CardContent>
                    </Card>

                    {/* Low Stock Alert */}
                    <Card className={`border-none shadow-md ${lowStockItems.length > 0 ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white'}`}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Attention Needed</CardTitle>
                            <AlertTriangle className={`w-5 h-5 ${lowStockItems.length > 0 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{lowStockItems.length}</div>
                            <div className="text-xs text-slate-500 mt-1">Items running low</div>
                            {lowStockItems.length > 0 && (
                                <Button variant="link" onClick={() => onNavigate('inventory')} className="p-0 h-auto text-xs text-red-600 mt-2">View Items &rarr;</Button>
                            )}
                        </CardContent>
                    </Card>

                     {/* Top Cashier */}
                     <Card className="bg-white border-none shadow-md">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Top Cashier</CardTitle>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">🏆 Today</Badge>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                                    {topCashierName !== 'None' ? '👩🏾‍🦱' : '⚪'}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{topCashierName}</div>
                                    <div className="text-xs text-muted-foreground">{topCashierCount} Sales • KES {topCashierAmount.toLocaleString()}</div>
                                </div>
                             </div>
                        </CardContent>
                    </Card>

                    {/* Current Shift */}
                    <Card className="bg-white border-none shadow-md">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Shift</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between">
                                 <div>
                                     {isShiftActive && currentShift ? (
                                        <>
                                            <div className="text-xl font-bold capitalize text-green-700">{currentShift.cashierName}</div>
                                            <div className="text-xs text-muted-foreground">On shift since {format(new Date(currentShift.startTime), 'h:mm a')}</div>
                                        </>
                                     ) : (
                                        <>
                                            <div className="text-xl font-bold capitalize text-slate-500">Shop Closed</div>
                                            <div className="text-xs text-muted-foreground">No active cashier</div>
                                        </>
                                     )}
                                     
                                 </div>
                                 <div className={`h-3 w-3 rounded-full ${isShiftActive ? 'bg-green-500 animate-pulse' : 'bg-red-300'}`}></div>
                             </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Revenue Graph (span 2 cols) */}
                    <Card className="col-span-1 lg:col-span-2 border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Income & Revenue</CardTitle>
                                <CardDescription>Realtime earnings overview</CardDescription>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['Today', 'Last Month'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range.toLowerCase())}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            timeRange === range.toLowerCase() 
                                            ? 'bg-white shadow text-slate-900' 
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `K${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} name="Revenue" />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} name="Profit" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-8 mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span className="text-sm font-medium text-slate-600">Total Sales</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                    <span className="text-sm font-medium text-slate-600">Actual Profit</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity (Renamed from Suspicious) */}
                     <Card className="col-span-1 border-none shadow-md bg-white border-slate-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Clock className="w-5 h-5 text-blue-500" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>System log & Alerts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-4">No recent activity</div>
                                )}
                                {recentActivity.map((log, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                                        <div className={`mt-1 p-1.5 rounded-full ${log.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {log.type === 'alert' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{log.title}</div>
                                            <div className="text-xs text-slate-600 mt-0.5">{log.details}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">{log.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                View Full Log
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Suppliers Dialog */}
                 <Dialog open={showSuppliers} onOpenChange={setShowSuppliers}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex justify-between items-center">
                                <span>Supplier Management</span>
                                {!showAddSupplier && (
                                    <Button size="sm" onClick={() => setShowAddSupplier(true)}>
                                        <Plus className="w-4 h-4 mr-1" /> Add Supplier
                                    </Button>
                                )}
                            </DialogTitle>
                            <DialogDescription>Contact suppliers and request restocks</DialogDescription>
                        </DialogHeader>

                        {showAddSupplier ? (
                            <div className="space-y-4 py-4 animate-in slide-in-from-right">
                                <div className="space-y-2">
                                    <Label>Business Name</Label>
                                    <Input value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} placeholder="e.g. Kenchic Ltd" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)} placeholder="2547..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Products (Comma separated)</Label>
                                    <Input value={newSupplierGoods} onChange={e => setNewSupplierGoods(e.target.value)} placeholder="Chicken, Eggs, Sausages" />
                                </div>
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button variant="ghost" onClick={() => setShowAddSupplier(false)}>Cancel</Button>
                                    <Button onClick={handleAddSupplier}>Save Supplier</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 py-4">
                                {suppliers.length === 0 && (
                                    <div className="text-center text-slate-500 py-8">No suppliers added yet.</div>
                                )}
                                {suppliers.map(supplier => (
                                    <div key={supplier.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 gap-4">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-lg">{supplier.name}</div>
                                            <div className="flex items-center text-sm text-slate-500 gap-2">
                                                <Phone className="w-3 h-3" /> {supplier.phone}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {supplier.goods.map(good => (
                                                    <Badge key={good} variant="secondary" className="text-xs">{good}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => window.open(`tel:${supplier.phone}`)}>
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setRestockSupplier(supplier)}>
                                                Request Restock
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Request Restock Dialog */}
                <Dialog open={!!restockSupplier} onOpenChange={(open) => !open && setRestockSupplier(null)}>
                    <DialogContent className="max-w-[95vw] sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Restock from {restockSupplier?.name}</DialogTitle>
                            <DialogDescription>Select which goods to order</DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Item</Label>
                                <div className="flex flex-wrap gap-2">
                                    {restockSupplier?.goods.map((good: string) => (
                                        <Badge 
                                            key={good} 
                                            variant={restockItem === good ? "default" : "outline"}
                                            className="cursor-pointer text-sm py-1 px-3"
                                            onClick={() => setRestockItem(good)}
                                        >
                                            {good}
                                        </Badge>
                                    ))}
                                    <Badge 
                                        variant={restockItem === 'Other' ? "default" : "outline"}
                                        className="cursor-pointer text-sm py-1 px-3"
                                        onClick={() => setRestockItem('Other')}
                                    >
                                        Other / Custom
                                    </Badge>
                                </div>
                                {restockItem === 'Other' && (
                                    <Input 
                                        placeholder="Enter custom item name" 
                                        value={customRestockItem}
                                        onChange={(e) => setCustomRestockItem(e.target.value)}
                                        className="mt-2"
                                    />
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Quantity / Amount</Label>
                                <Input 
                                    placeholder="e.g. 50 loaves, 10 crates" 
                                    value={restockAmount}
                                    onChange={(e) => setRestockAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                             <Button 
                                variant="outline" 
                                className="w-full sm:w-auto bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => handleRequestStock('whatsapp')}
                                disabled={(!restockItem || (restockItem === 'Other' && !customRestockItem)) || !restockAmount}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" /> Send WhatsApp
                             </Button>
                             <Button 
                                variant="outline" 
                                className="w-full sm:w-auto bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                onClick={() => handleRequestStock('sms')}
                                disabled={(!restockItem || (restockItem === 'Other' && !customRestockItem)) || !restockAmount}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" /> Send SMS
                             </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </main>
        </div>
    );
};
