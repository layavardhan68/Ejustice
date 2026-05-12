import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

interface DashboardLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
}

export function DashboardLayout({ children, breadcrumbs, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {title && (
            <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground mb-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
