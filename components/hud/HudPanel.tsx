import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HudPanelProps {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const CLIP_PATHS = {
  sm: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)",
  md: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)",
  lg: "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)",
};

export default function HudPanel({
  children,
  className,
  accent = false,
  size = "md",
  style,
}: HudPanelProps) {
  return (
    <div
      className={cn(
        "relative bg-valo-panel border",
        accent ? "border-valo-accent/30" : "border-valo-border",
        accent && "shadow-glow-accent",
        className
      )}
      style={{
        clipPath: CLIP_PATHS[size],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
