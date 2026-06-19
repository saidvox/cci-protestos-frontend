import { NavLink } from "react-router-dom"
import type { NavigationItem } from "@/config/navigation"

export function BottomNav({ items }: { items: readonly NavigationItem[] }) {
  const visible = items.slice(0, 5)

  return (
    <nav className="bottom-nav">
      {visible.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path.endsWith("/dashboard")}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`
          }
        >
          <item.icon className="bottom-nav__icon" />
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
