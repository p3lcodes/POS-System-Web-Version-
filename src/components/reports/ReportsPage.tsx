import React, { useState, useMemo } from 'react';
import { useStore, Sale } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  ShoppingCart,
  Users,
  Package
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Period = 'today' | 'week' | 'month' | 'all';

export const ReportsPage: React.FC = () => {
  const { sales, products, getSalesTotal } = useStore();
  const [period, setPeriod] = useState<Period>('today');

  // Filter sales by period
  const filteredSales = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }
    
    return sales.filter(s => new Date(s.timestamp) >= startDate);
  }, [sales, period]);

  const totalSales = getSalesTotal(filteredSales);
  const transactionCount = filteredSales.length;
  const avgTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

  // Payment method breakdown
  const mpesaSales = filteredSales.filter(s => s.paymentMethod === 'mpesa');
  const cashSales = filteredSales.filter(s => s.paymentMethod === 'cash');

  // Top products
  const productSales = useMemo(() => {
    const productMap = new Map<number, { product: any; quantity: number; revenue: number }>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.product.price * item.quantity;
        } else {
          productMap.set(item.product.id, {
            product: item.product,
            quantity: item.quantity,
            revenue: item.product.price * item.quantity,
          });
        }
      });
    });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'Receipt', 'Items', 'Total', 'Payment', 'Cashier'];
    const rows = filteredSales.map(sale => [
      new Date(sale.timestamp).toLocaleDateString(),
      new Date(sale.timestamp).toLocaleTimeString(),
      sale.id,
      sale.items.length,
      sale.total,
      sale.paymentMethod,
      sale.cashierName,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freshfity-sales-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const periodLabels = {
    today: "Today's",
    week: "This Week's",
    month: "This Month's",
    all: "All Time",
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          <p className="text-muted-foreground">
            {periodLabels[period]} performance overview
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-success/10">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl md:text-3xl font-bold">KES {totalSales.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Sales</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-info/10">
              <ShoppingCart className="w-5 h-5 text-info" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl md:text-3xl font-bold">{transactionCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Transactions</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl md:text-3xl font-bold">KES {Math.round(avgTransaction).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Avg. Transaction</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-accent/10">
              <Package className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl md:text-3xl font-bold">
              {filteredSales.reduce((sum, s) => sum + s.items.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Items Sold</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium">M-Pesa</p>
                  <p className="text-sm text-muted-foreground">{mpesaSales.length} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">KES {getSalesTotal(mpesaSales).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {totalSales > 0 ? Math.round((getSalesTotal(mpesaSales) / totalSales) * 100) : 0}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-info/5 rounded-lg border border-info/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-medium">Cash</p>
                  <p className="text-sm text-muted-foreground">{cashSales.length} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">KES {getSalesTotal(cashSales).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {totalSales > 0 ? Math.round((getSalesTotal(cashSales) / totalSales) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          {productSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No sales data for this period</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {productSales.map((item, index) => (
                  <div 
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-xl">{item.product.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.product.unit} sold
                      </p>
                    </div>
                    <p className="font-bold text-primary">
                      KES {item.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Receipt #</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {new Date(sale.timestamp).toLocaleDateString('en-KE')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.timestamp).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    #{sale.id.slice(-8)}
                  </TableCell>
                  <TableCell>{sale.items.length}</TableCell>
                  <TableCell>
                    <Badge variant={sale.paymentMethod === 'mpesa' ? 'default' : 'secondary'}>
                      {sale.paymentMethod === 'mpesa' ? '📱 M-Pesa' : '💵 Cash'}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.cashierName}</TableCell>
                  <TableCell className="text-right font-bold">
                    KES {sale.total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions for this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
};
