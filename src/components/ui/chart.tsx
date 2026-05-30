// Minimal placeholder. The full shadcn chart wrapper is incompatible with recharts v3.
// We use recharts directly in pages; this file just re-exports a noop container.
import * as React from "react";

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));
ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = () => null;
export const ChartTooltipContent = () => null;
export const ChartLegend = () => null;
export const ChartLegendContent = () => null;
export const ChartStyle = () => null;
