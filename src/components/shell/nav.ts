import {
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/academics", label: "Academics", icon: GraduationCap, exact: false },
  { to: "/courses", label: "Courses", icon: BookOpen, exact: false },
  { to: "/results", label: "Results", icon: LineChart, exact: false },
  { to: "/routine", label: "Routine", icon: CalendarDays, exact: false },
  { to: "/notices", label: "Notices", icon: Megaphone, exact: false },
  { to: "/events", label: "Events", icon: Calendar, exact: false },
  { to: "/notifications", label: "Notifications", icon: Bell, exact: false },
  { to: "/profile", label: "Profile", icon: UserRound, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export type NavItem = (typeof NAV)[number];
export type IconType = LucideIcon;
