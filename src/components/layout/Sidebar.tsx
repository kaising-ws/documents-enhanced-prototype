import {
  Home,
  MessageSquare,
  Calendar,
  BarChart3,
  Users,
  Briefcase,
  Megaphone,
  Network,
  UserPlus,
  Users2,
  FileText,
  ClipboardCheck,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  icon: React.ElementType
  label: string
  active?: boolean
  hasDropdown?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { icon: Home, label: 'Home' },
      { icon: MessageSquare, label: 'Messages' },
      { icon: Calendar, label: 'Scheduling' },
      { icon: BarChart3, label: 'Reporting' },
    ],
  },
  {
    title: 'HIRING',
    items: [
      { icon: Users, label: 'Applicants' },
      { icon: Briefcase, label: 'Job Postings' },
      { icon: Megaphone, label: 'Sourcing Tools' },
      { icon: Network, label: 'Talent network' },
    ],
  },
  {
    title: 'TEAM MANAGEMENT',
    items: [
      { icon: UserPlus, label: 'Onboarding', hasDropdown: true },
      { icon: Users2, label: 'Team' },
      { icon: FileText, label: 'Documents', active: true },
      { icon: ClipboardCheck, label: 'Surveys' },
    ],
  },
  {
    title: 'PAYROLL',
    items: [{ icon: DollarSign, label: 'Payroll' }],
  },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className="bg-nav h-full flex flex-col w-60 flex-shrink-0">
      {/* Header */}
      <div className="h-[62px] flex items-center justify-between px-4">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-nav-light" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <div className="px-6 pb-2.5 pt-5">
                <span className="text-gray-500 text-xs font-semibold tracking-wider uppercase">
                  {section.title}
                </span>
              </div>
            )}
            {section.items.map((item, itemIndex) => (
              <NavItemComponent key={itemIndex} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-nav-light" />

      {/* Footer */}
      <div className="h-[62px] flex items-center px-4">
        <button className="flex items-center gap-2.5 px-2.5 py-2 text-gray-400 hover:text-white transition-colors w-full">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Switch to admin view</span>
        </button>
      </div>
    </aside>
  )
}

function NavItemComponent({ item }: { item: NavItem }) {
  const Icon = item.icon
  
  return (
    <div className="px-3 h-10 flex items-center">
      <button
        className={`
          flex items-center gap-2 w-full px-3 py-2 rounded-md transition-colors
          ${item.active 
            ? 'bg-nav text-white font-semibold' 
            : 'text-gray-400 hover:text-white hover:bg-nav-light'
          }
        `}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm flex-1 text-left">{item.label}</span>
        {item.hasDropdown && (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
    </div>
  )
}

