import {
  LayoutDashboard,
  Search,
  FileText,
  Kanban,
  BarChart2,
  Globe,
  Settings,
  ImagePlus,
} from 'lucide-react'

export const navigation = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Auditoria',
    href: '/dashboard/audit',
    icon: Search,
  },
  {
    label: 'Conteúdo',
    href: '/dashboard/content',
    icon: FileText,
  },
  {
    label: 'Workflow',
    href: '/dashboard/workflow',
    icon: Kanban,
  },
  {
    label: 'Imagens IA',
    href: '/dashboard/images',
    icon: ImagePlus,
  },
  {
    label: 'Otimização',
    href: '/dashboard/optimization',
    icon: BarChart2,
  },
  {
    label: 'Inteligência',
    href: '/dashboard/intelligence',
    icon: Globe,
  },
  {
    label: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
]
