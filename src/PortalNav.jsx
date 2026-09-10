import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Credentials", end: true },
  { to: "/chapters", label: "Chapters" },
  // { to: "/scanner", label: "Scanner" },
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
                ? "bg-[#2D5A5D]/10 text-[#2D5A5D]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
