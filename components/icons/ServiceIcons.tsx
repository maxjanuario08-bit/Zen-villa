import { SVGProps } from "react";
import {
  KeyIcon,
  SparklesIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  PlayCircleIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  Car,
  Coffee,
  Shirt,
  Sailboat,
  Mountain,
  Anchor,
  Motorbike,
  ShoppingCart,
} from "lucide-react";
import { Icon } from "@iconify/react";

const iconClasses = "w-12 h-12 text-lagoon";

export const Icons = {
  "check-in": (props: SVGProps<SVGSVGElement>) => (
    <KeyIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  menage: (props: SVGProps<SVGSVGElement>) => (
    <SparklesIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  reservations: (props: SVGProps<SVGSVGElement>) => (
    <CalendarDaysIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  maintenance: (props: SVGProps<SVGSVGElement>) => (
    <WrenchScrewdriverIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  activites: (props: SVGProps<SVGSVGElement>) => (
    <PlayCircleIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  assistance: (props: SVGProps<SVGSVGElement>) => (
    <PhoneIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  temps: (props: SVGProps<SVGSVGElement>) => (
    <ClockIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  qualite: (props: SVGProps<SVGSVGElement>) => (
    <StarIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  mobile: (props: SVGProps<SVGSVGElement>) => (
    <DevicePhoneMobileIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  chart: (props: SVGProps<SVGSVGElement>) => (
    <ChartBarIcon className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  voiture: (props: SVGProps<SVGSVGElement>) => (
    <Car className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  "petit-dejeuner": (props: SVGProps<SVGSVGElement>) => (
    <Coffee className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  linge: (props: SVGProps<SVGSVGElement>) => (
    <Shirt className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  courses: (props: SVGProps<SVGSVGElement>) => (
    <ShoppingCart className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  nautique: (props: SVGProps<SVGSVGElement>) => (
    <Sailboat className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  equestre: (props: SVGProps<SVGSVGElement>) => (
    <Icon icon="mdi:horse" className={`${iconClasses} ${props?.className || ""}`.trim()} width={48} height={48} />
  ),
  randonnee: (props: SVGProps<SVGSVGElement>) => (
    <Mountain className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  "equipement-nautique": (props: SVGProps<SVGSVGElement>) => (
    <Anchor className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
  "location-voiture-scooter": (props: SVGProps<SVGSVGElement>) => (
    <Motorbike className={`${iconClasses} ${props?.className || ""}`.trim()} />
  ),
};

export type IconName = keyof typeof Icons;
