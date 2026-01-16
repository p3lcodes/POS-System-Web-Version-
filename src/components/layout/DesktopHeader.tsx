import React from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Bell,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface DesktopHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  allowedTabs?: string[];
}


const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS / Sell', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];


export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ activeTab, onTabChange, allowedTabs }) => {
  const { currentUser, notifications, isOnline, isDarkMode, toggleDarkMode, logout, isShiftActive, startShift, endShift } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
      <div className="flex h-36 items-center px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-8">
          <div className="h-32 w-auto">
            <img 
              src={currentUser?.business?.logo || "/rosemarylogo-.png"} 
              alt={currentUser?.business?.name || "FreshFity Supermarket"} 
              className="h-full w-auto object-contain"
            />
          </div>
          
          {/* Shift Button */}
           <Button 
            variant={isShiftActive ? "destructive" : "default"}
            onClick={isShiftActive ? endShift : startShift}
            className="ml-4 font-semibold shadow-md"
          >
            {isShiftActive ? 'End Shift' : 'Start Shift'}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 flex-1 justify-end mr-4">
          {navItems.filter(item => !allowedTabs || allowedTabs.includes(item.id)).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Online Status */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
            isOnline ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          )}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 font-semibold border-b">Notifications</div>
              {notifications.slice(0, 5).map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">{notif.title}</span>
                  <span className="text-xs text-muted-foreground">{notif.message}</span>
                </DropdownMenuItem>
              ))}
              {notifications.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full pl-2 pr-4">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
                  {currentUser?.avatar}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{currentUser?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{currentUser?.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Only show Reports/Settings if allowed */}
              {(!allowedTabs || allowedTabs.includes('reports')) && (
                <DropdownMenuItem onClick={() => onTabChange('reports')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </DropdownMenuItem>
              )}
              {(!allowedTabs || allowedTabs.includes('settings')) && (
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
