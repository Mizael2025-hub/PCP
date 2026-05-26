import {
  Factory,
  FlaskConical,
  Home,
  Package,
  Settings,
  type LucideIcon
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Início",
    href: "/",
    icon: Home
  },
  {
    label: "Produção",
    href: "/producao",
    icon: Factory
  },
  {
    label: "Qualidade",
    href: "/qualidade",
    icon: FlaskConical
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: Package
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings
  }
]

export function getNavLabel(pathname: string): string {
  const exact = NAV_ITEMS.find((item) => item.href === pathname)
  if (exact) {
    return exact.label
  }

  const partial = NAV_ITEMS.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  )

  return partial?.label ?? "PCP Baterias"
}
