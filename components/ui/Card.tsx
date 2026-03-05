interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = true,
}: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 sm:p-8 shadow-card border border-sand/30 ${
        hover ? "hover:shadow-lg hover:border-lagoon/20 transition-all duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
