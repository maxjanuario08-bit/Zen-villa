import { Icons, type IconName } from "./ServiceIcons";

interface ServiceIconProps {
  name: IconName;
  className?: string;
  iconClassName?: string;
}

export default function ServiceIcon({ name, className = "", iconClassName }: ServiceIconProps) {
  const Icon = Icons[name];
  if (!Icon) return null;
  return (
    <div className={`inline-flex items-center justify-center mb-3 ${className}`}>
      <Icon className={iconClassName} />
    </div>
  );
}
