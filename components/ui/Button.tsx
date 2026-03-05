import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  type?: never;
  onClick?: never;
  disabled?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-lagoon px-6 py-3 text-sm font-medium text-white shadow-md hover:bg-lagoon-dark transition-all hover:shadow-lg",
  secondary:
    "inline-flex items-center justify-center rounded-full bg-sand-dark px-6 py-3 text-sm font-medium text-foreground hover:bg-sand transition-all",
  outline:
    "inline-flex items-center justify-center rounded-full border-2 border-lagoon px-6 py-3 text-sm font-medium text-lagoon hover:bg-lagoon hover:text-white transition-all",
  ghost:
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-lagoon hover:bg-sand-light transition-colors",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = variantStyles[variant];
  const combinedClassName = `${baseStyles} ${className}`.trim();

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={combinedClassName}
    >
      {children}
    </button>
  );
}
