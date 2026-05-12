import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Search,
  Calendar,
  Gavel,
  Users,
  Settings,
  FileCheck,
  ClipboardList,
  Scale,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const citizenItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/citizen/dashboard' },
  { label: 'File New Case', icon: FileText, path: '/citizen/file-case' },
  { label: 'My Cases', icon: FolderOpen, path: '/citizen/my-cases' },
  { label: 'My Vault', icon: FileCheck, path: '/citizen/vault' },
  { label: 'Settings', icon: Settings, path: '/citizen/settings' },
];

const lawyerItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/lawyer/dashboard' },
  { label: 'Case Discovery', icon: Search, path: '/lawyer/case-discovery' },
  { label: 'My Cases', icon: FolderOpen, path: '/lawyer/my-cases' },
  { label: 'File New Case', icon: FileText, path: '/lawyer/file-case' },
  { label: 'Settings', icon: Settings, path: '/lawyer/settings' },
];

const judgeItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/judge/dashboard' },
  { label: 'Case Review', icon: FileCheck, path: '/judge/case-review' },
  { label: 'Hearings', icon: Calendar, path: '/judge/hearings' },
  { label: 'Verdict', icon: Gavel, path: '/judge/verdict' },
];

const adminItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'User Verification', icon: Users, path: '/admin/verification' },
  { label: 'System Logs', icon: ClipboardList, path: '/admin/logs' },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const items = user.role === 'citizen' ? citizenItems
    : user.role === 'lawyer' ? lawyerItems
      : user.role === 'judge' ? judgeItems
        : adminItems;

  const roleLabel = user.role === 'citizen' ? 'Citizen Portal'
    : user.role === 'lawyer' ? 'Lawyer Portal'
      : user.role === 'judge' ? 'Judicial Portal'
        : 'Admin Portal';

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Scale className="h-7 w-7 text-sidebar-primary" />
              <span className="font-serif text-lg font-semibold">eJustice</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/60 mt-1">{roleLabel}</p>
        )}
      </div>

      {/* User Info */}
      <div className={cn("p-4 border-b border-sidebar-border", collapsed && "px-2")}>
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-sidebar-primary flex-shrink-0"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/"
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
