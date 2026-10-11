import { NavLink } from "react-router-dom";
import { useAuth } from "./auth";

const links = [
  { to: "/", label: "Users", end: true },
  { to: "/chapters", label: "Chapters" },
  { to: "/scanner", label: "Scanner" },
];

export default function PortalNav() {
  const { isSuperadmin } = useAuth();
  const items = isSuperadmin
    ? [...links, { to: "/staff", label: "Admins" }]
    : links;

  return (
    <nav className="flex items-center gap-1">
      {items.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-[#C5242A]/10 text-[#C5242A]"
                : "text-slate-600 hover:bg-red-50 hover:text-[#C5242A]"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
