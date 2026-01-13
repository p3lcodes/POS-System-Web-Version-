import React from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { 
    getTodaySales, 
    getSalesTotal, 
    getLowStockProducts, 
    products, 
    currentUser,
    sales 
  } = useStore();
  
  const todaySales = getTodaySales();
  const todayTotal = getSalesTotal(todaySales);
  const lowStockProducts = getLowStockProducts();
  
  // Calculate week sales
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSales = sales.filter(s => new Date(s.timestamp) >= weekAgo);
  const weekTotal = getSalesTotal(weekSales);
  
  // Get recent transactions
  const recentSales = sales.slice(0, 5);

  const stats = [
    {
      title: "Today's Sales",
      value: `KES ${todayTotal.toLocaleString()}`,
      subtext: `${todaySales.length} transactions`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Week Sales',
      value: `KES ${weekTotal.toLocaleString()}`,
      subtext: `${weekSales.length} transactions`,
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length.toString(),
      subtext: 'Need restock',
      icon: AlertTriangle,
      color: lowStockProducts.length > 0 ? 'text-warning' : 'text-muted-foreground',
      bgColor: lowStockProducts.length > 0 ? 'bg-warning/10' : 'bg-muted',
    },
    {
      title: 'Total Products',
      value: products.length.toString(),
      subtext: 'In inventory',
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {currentUser?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at FreshFity today
          </p>
        </div>
        <Button 
          onClick={() => onNavigate('pos')}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-soft-lg"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card">
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                <p className="text-xs text-muted-foreground/80">{stat.subtext}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Low Stock Alerts
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')}>
              View All
            </Button>
          </div>
          
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <span className="text-2xl">{product.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.stock} {product.unit} left
                    </p>
                  </div>
                  <span className="low-stock-badge">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Transactions
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('reports')}>
              View All
            </Button>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sales yet today</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => onNavigate('pos')}
              >
                Make First Sale
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div 
                  key={sale.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    sale.paymentMethod === 'mpesa' ? 'bg-success/10' : 'bg-info/10'
                  )}>
                    {sale.paymentMethod === 'mpesa' ? '📱' : '💵'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      KES {sale.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.items.length} items • {sale.cashierName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.timestamp).toLocaleTimeString('en-KE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <span className={cn(
                      "status-badge",
                      sale.synced ? "success" : "warning"
                    )}>
                      {sale.synced ? 'Synced' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => onNavigate('pos')}
          >
            <ShoppingCart className="w-6 h-6 text-primary" />
            <span>New Sale</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => onNavigate('inventory')}
          >
            <Package className="w-6 h-6 text-accent" />
            <span>Add Stock</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => onNavigate('reports')}
          >
            <TrendingUp className="w-6 h-6 text-success" />
            <span>View Reports</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => onNavigate('settings')}
          >
            <Users className="w-6 h-6 text-info" />
            <span>Manage Users</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
