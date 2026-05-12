import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Urgency badges
        "urgency-high": "border-red-200 bg-red-100 text-red-700",
        "urgency-medium": "border-amber-200 bg-amber-100 text-amber-700",
        "urgency-low": "border-green-200 bg-green-100 text-green-700",
        // Status badges
        "status-pending": "border-amber-200 bg-amber-50 text-amber-700",
        "status-active": "border-blue-200 bg-blue-50 text-blue-700",
        "status-closed": "border-slate-200 bg-slate-100 text-slate-600",
        "status-verified": "border-green-200 bg-green-50 text-green-700",
        "status-unverified": "border-red-200 bg-red-50 text-red-700",
        // Role badges
        "role-citizen": "border-blue-200 bg-blue-50 text-blue-700",
        "role-lawyer": "border-purple-200 bg-purple-50 text-purple-700",
        "role-judge": "border-slate-300 bg-slate-100 text-slate-700",
        "role-admin": "border-amber-300 bg-amber-50 text-amber-700",
        // Custom
        gold: "border-amber-300 bg-amber-50 text-amber-700",
        navy: "border-slate-300 bg-slate-100 text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
