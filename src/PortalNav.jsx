import { NavLink } from "react-router-dom";

const links = [
  // Users is the homepage — no nav item needed
  // Chapters & Scanner hidden for now
];

export default function PortalNav() {
  if (links.length === 0) return null;

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
