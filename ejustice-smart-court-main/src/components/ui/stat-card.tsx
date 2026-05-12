import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'accent';
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  className,
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className={cn(
      "stat-card relative overflow-hidden",
      variant === 'primary' && "bg-primary text-primary-foreground",
      variant === 'accent' && "bg-gold text-foreground",
      className
    )}>
      {/* Background Pattern */}
      {variant !== 'default' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-current" />
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-current" />
        </div>
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn(
              "text-sm font-medium",
              variant === 'default' ? "text-muted-foreground" : "opacity-80"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-3xl font-bold mt-1 font-serif",
              variant === 'default' && "text-foreground"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-xs mt-1",
                variant === 'default' ? "text-muted-foreground" : "opacity-70"
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <p className={cn(
                "text-xs mt-2 font-medium",
                trend.positive ? "text-green-600" : "text-red-600"
              )}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-3 rounded-xl",
              variant === 'default' ? "bg-muted" : "bg-white/20"
            )}>
              <Icon className={cn(
                "h-6 w-6",
                variant === 'default' ? "text-primary" : "text-current"
              )} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
