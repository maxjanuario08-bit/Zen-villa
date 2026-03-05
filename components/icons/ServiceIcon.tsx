import { Icons, type IconName } from "./ServiceIcons";

interface ServiceIconProps {
  name: IconName;
  className?: string;
}

export default function ServiceIcon({ name, className = "" }: ServiceIconProps) {
  const Icon = Icons[name];
  if (!Icon) return null;
  return (
    <div className={`inline-flex items-center justify-center mb-3 ${className}`}>
      <Icon />
    </div>
  );
}
