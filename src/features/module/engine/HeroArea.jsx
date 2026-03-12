import { cn } from "@/shared/libs/utils";

export default function HeroArea({ area, className, children }) {
  return (
    <div className={cn("min-w-0 min-h-0 w-full h-auto box-border",className)} style={{ gridArea: area }}>
      {children}
    </div>
  );
}