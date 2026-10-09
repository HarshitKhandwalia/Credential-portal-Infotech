import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Users", end: true },
  { to: "/chapters", label: "Chapters" },
  { to: "/scanner", label: "Scanner" },
];

export default function PortalNav() {
  return (
    <nav className="flex items-center gap-1">
      {links.map(({ to, label, end }) => (
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
