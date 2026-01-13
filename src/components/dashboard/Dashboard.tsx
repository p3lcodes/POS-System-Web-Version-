import React from 'react';
import { motion } from 'framer-motion';
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
  const { currentUser } = useStore();

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here’s your supermarket dashboard overview.
          </p>
        </div>
      </div>

      {/* Linear Graph (Placeholder) */}
      <Card className="mb-6 p-4 flex flex-col items-center animate-fade-in">
        <h2 className="text-lg font-semibold mb-2">Sales Overview</h2>
        <div className="w-full h-32 flex items-center justify-center">
          {/* Replace with real chart later */}
          <div className="w-5/6 h-24 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 rounded-lg animate-pulse"></div>
        </div>
      </Card>

      {/* Low Stock Card */}
      <Card className="mb-6 p-4 flex flex-col items-center border-l-4 border-warning animate-fade-in">
        <h2 className="text-lg font-semibold mb-2 text-warning">Low Stock</h2>
        <div className="text-sm text-muted-foreground mb-2">No low stock products right now.</div>
        <Button variant="destructive" size="sm" className="animate-bounce">View Details</Button>
      </Card>

      {/* Action Buttons with Framer Motion */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.08, rotate: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Button
            variant="default"
            className="flex flex-col items-center py-4 rounded-lg shadow-lg"
            onClick={() => onNavigate('add-product')}
          >
            <Package className="w-6 h-6 mb-1" />
            <span className="font-medium text-sm">Add Products</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.08, rotate: 2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Button
            variant="secondary"
            className="flex flex-col items-center py-4 rounded-lg shadow-lg"
            onClick={() => onNavigate('rescan-product')}
          >
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="font-medium text-sm">Rescan a Product</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.08, rotate: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Button
            variant="outline"
            className="flex flex-col items-center py-4 rounded-lg shadow-lg"
            onClick={() => onNavigate('supplies')}
          >
            <ShoppingCart className="w-6 h-6 mb-1" />
            <span className="font-medium text-sm">Supplies</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.08, rotate: 2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Button
            variant="default"
            className="flex flex-col items-center py-4 rounded-lg shadow-lg"
            onClick={() => onNavigate('orders')}
          >
            <DollarSign className="w-6 h-6 mb-1" />
            <span className="font-medium text-sm">Orders</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
