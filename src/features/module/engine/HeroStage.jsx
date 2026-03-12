import { cn } from "@/shared/libs/utils";

export default function HeroStage({ className, children }) {
  return (
    <section
      className={cn(
        "h-full min-h-0 w-full min-w-0 box-border flex items-center justify-center p-2 sm:p-4 md:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}