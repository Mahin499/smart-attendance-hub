import { useTheme } from "next-themes";
import { Toaster as BaseToaster, toast } from "sonner";

// expose a properly named wrapper so App can render <Sonner />
type SonnerProps = React.ComponentProps<typeof BaseToaster>;

const Sonner = ({ ...props }: SonnerProps) => {
  const { theme = "system" } = useTheme();

  return (
    <BaseToaster
      theme={theme as SonnerProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Sonner, toast };
