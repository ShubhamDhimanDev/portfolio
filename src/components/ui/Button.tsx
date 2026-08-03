import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { IconComponent } from "@/types/common";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: IconComponent;
  iconPosition?: "left" | "right";
}

type AnchorProps = BaseProps &
  Omit<HTMLMotionProps<"a">, "className" | "children"> & { href: string };

type NativeButtonProps = BaseProps &
  Omit<HTMLMotionProps<"button">, "className" | "children"> & { href?: undefined };

export type ButtonProps = AnchorProps | NativeButtonProps;

const variantClasses: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-accent-soft",
  secondary: "border border-border-strong bg-transparent text-foreground hover:border-accent-soft/60 hover:bg-surface-2",
  ghost: "bg-transparent text-muted hover:text-foreground",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2.5 px-6 text-[15px]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  iconPosition = "right",
  ...props
}: ButtonProps) {
  const classes = cn(
    "group inline-flex items-center justify-center rounded-full font-medium tracking-tight transition-colors duration-300 ease-out",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon className="size-4" />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && (
        <Icon className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (props.href) {
    const { href, ...rest } = props as AnchorProps;
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={classes}
        {...rest}
      >
        {content}
      </motion.a>
    );
  }

  const rest = props as NativeButtonProps;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={classes}
      {...rest}
    >
      {content}
    </motion.button>
  );
}
