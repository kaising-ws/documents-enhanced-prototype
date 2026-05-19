import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Home,
  LineChart,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  PiggyBank,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  TimerReset,
  Users,
  UsersRound,
  Wand2,
} from 'lucide-react';

type AppView = 'team' | 'admin';

interface NavLeaf {
  kind: 'leaf';
  label: string;
  icon: React.ReactNode;
  to: string;
}

interface NavGroup {
  kind: 'group';
  label: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: NavLeaf[];
}

type NavNode = NavLeaf | NavGroup;

const TEAM_NAV: NavNode[] = [
  { kind: 'leaf', label: 'Home', icon: <Home className="w-4 h-4" />, to: '/home' },
  { kind: 'leaf', label: 'Messages', icon: <Mail className="w-4 h-4" />, to: '/messages' },
  { kind: 'leaf', label: 'Scheduling', icon: <Calendar className="w-4 h-4" />, to: '/scheduling' },
  { kind: 'leaf', label: 'Compliance', icon: <Shield className="w-4 h-4" />, to: '/compliance' },
  { kind: 'leaf', label: 'Reporting', icon: <LineChart className="w-4 h-4" />, to: '/reporting' },
  {
    kind: 'group',
    label: 'Hiring',
    icon: <ShoppingBag className="w-4 h-4" />,
    children: [
      { kind: 'leaf', label: 'Applicants', icon: <Users className="w-4 h-4" />, to: '/hiring/applicants' },
      { kind: 'leaf', label: 'Job postings', icon: <ClipboardList className="w-4 h-4" />, to: '/hiring/jobs' },
    ],
  },
  {
    kind: 'group',
    label: 'Team Management',
    icon: <UsersRound className="w-4 h-4" />,
    defaultOpen: true,
    children: [
      { kind: 'leaf', label: 'Onboarding', icon: <GraduationCap className="w-4 h-4" />, to: '/team/onboarding' },
      { kind: 'leaf', label: 'Team', icon: <Users className="w-4 h-4" />, to: '/team' },
      { kind: 'leaf', label: 'E-Verify', icon: <ShieldCheck className="w-4 h-4" />, to: '/team/everify' },
      { kind: 'leaf', label: 'Documents', icon: <FileText className="w-4 h-4" />, to: '/documents' },
      { kind: 'leaf', label: 'Surveys', icon: <ClipboardList className="w-4 h-4" />, to: '/team/surveys' },
    ],
  },
  {
    kind: 'group',
    label: 'Payroll',
    icon: <DollarSign className="w-4 h-4" />,
    children: [
      { kind: 'leaf', label: 'Payroll', icon: <DollarSign className="w-4 h-4" />, to: '/payroll' },
      { kind: 'leaf', label: 'Reports', icon: <LineChart className="w-4 h-4" />, to: '/payroll/reports' },
    ],
  },
  {
    kind: 'group',
    label: 'Time Management',
    icon: <TimerReset className="w-4 h-4" />,
    children: [
      { kind: 'leaf', label: 'Shift schedule', icon: <Calendar className="w-4 h-4" />, to: '/time/schedule' },
      { kind: 'leaf', label: 'Timesheets', icon: <ClipboardList className="w-4 h-4" />, to: '/time/timesheets' },
      { kind: 'leaf', label: 'Time off requests', icon: <Bell className="w-4 h-4" />, to: '/time/timeoff' },
    ],
  },
];

const ADMIN_NAV: NavNode[] = [
  { kind: 'leaf', label: 'Home', icon: <Home className="w-4 h-4" />, to: '/admin/home' },
  {
    kind: 'group',
    label: 'Company Settings',
    icon: <Building2 className="w-4 h-4" />,
    defaultOpen: true,
    children: [
      { kind: 'leaf', label: 'Locations', icon: <Building2 className="w-4 h-4" />, to: '/admin/locations' },
      { kind: 'leaf', label: 'Departments', icon: <UsersRound className="w-4 h-4" />, to: '/admin/departments' },
      { kind: 'leaf', label: 'Integrations', icon: <Wand2 className="w-4 h-4" />, to: '/admin/integrations' },
      { kind: 'leaf', label: 'Custom Fields', icon: <ClipboardList className="w-4 h-4" />, to: '/admin/custom-fields' },
      { kind: 'leaf', label: 'AI Settings', icon: <Wand2 className="w-4 h-4" />, to: '/admin/ai' },
    ],
  },
  {
    kind: 'group',
    label: 'Hiring Admin',
    icon: <ShoppingBag className="w-4 h-4" />,
    children: [
      { kind: 'leaf', label: 'Position Templates', icon: <ClipboardList className="w-4 h-4" />, to: '/admin/positions' },
      { kind: 'leaf', label: 'Hiring Processes', icon: <ClipboardList className="w-4 h-4" />, to: '/admin/processes' },
    ],
  },
  { kind: 'leaf', label: 'Team Management Admin', icon: <UsersRound className="w-4 h-4" />, to: '/admin/team' },
  { kind: 'leaf', label: 'Payroll Admin', icon: <PiggyBank className="w-4 h-4" />, to: '/admin/payroll' },
  { kind: 'leaf', label: 'Benefits Admin', icon: <ShieldCheck className="w-4 h-4" />, to: '/admin/benefits' },
  { kind: 'leaf', label: 'Access Control', icon: <Shield className="w-4 h-4" />, to: '/admin/access' },
];

export function Sidebar({
  view,
  onViewChange,
  collapsed,
  onToggleCollapsed,
}: {
  view: AppView;
  onViewChange: (v: AppView) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const items = view === 'team' ? TEAM_NAV : ADMIN_NAV;
  const isDark = view === 'team';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-[width] duration-200 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      } ${isDark ? 'bg-ink-1000 text-white' : 'bg-white text-ink-900 border-r border-ink-300'}`}
    >
      {/* Brand row */}
      <div
        className={`h-[60px] flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'} ${
          isDark ? 'border-b border-ink-900' : 'border-b border-ink-300'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-[8px] bg-brand-500 text-white font-bold flex items-center justify-center shrink-0">
            W
          </div>
          {!collapsed && <span className="font-bold tracking-tight">Workstream</span>}
        </div>
        {!collapsed && (
          <button
            onClick={onToggleCollapsed}
            className={`p-1.5 rounded-[6px] ${isDark ? 'hover:bg-ink-800' : 'hover:bg-ink-200'}`}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggleCollapsed}
          className={`mx-auto mt-2 p-1.5 rounded-[6px] ${isDark ? 'hover:bg-ink-800' : 'hover:bg-ink-200'}`}
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {items.map((item, i) =>
          item.kind === 'leaf' ? (
            <NavLeafItem key={i} item={item} collapsed={collapsed} dark={isDark} />
          ) : (
            <NavGroupItem key={i} group={item} collapsed={collapsed} dark={isDark} />
          ),
        )}
      </nav>

      {/* Footer / view switcher */}
      <div
        className={`h-[62px] sticky bottom-0 flex items-center px-2 ${
          isDark ? 'border-t border-ink-900 bg-ink-1000' : 'border-t border-ink-300 bg-white'
        }`}
      >
        <button
          onClick={() => onViewChange(view === 'team' ? 'admin' : 'team')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm font-medium ${
            isDark ? 'hover:bg-ink-800 text-white' : 'hover:bg-ink-200 text-ink-900'
          } ${collapsed ? 'justify-center' : ''}`}
          title={view === 'team' ? 'Switch to admin view' : 'Switch to team view'}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {view === 'team' ? 'Switch to admin view' : 'Switch to team view'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavLeafItem({ item, collapsed, dark }: { item: NavLeaf; collapsed: boolean; dark: boolean }) {
  const location = useLocation();
  // Documents stays active for all /documents/* routes
  const active = item.to === '/documents'
    ? location.pathname === '/documents' || location.pathname.startsWith('/documents/')
    : location.pathname === item.to;

  const baseLight = active
    ? 'bg-ink-200 text-ink-1000'
    : 'text-ink-800 hover:bg-ink-100';
  const baseDark = active
    ? 'bg-ink-800 text-white'
    : 'text-ink-300 hover:bg-ink-900 hover:text-white';

  return (
    <NavLink
      to={item.to}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm font-medium ${
        dark ? baseDark : baseLight
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function NavGroupItem({
  group,
  collapsed,
  dark,
}: {
  group: NavGroup;
  collapsed: boolean;
  dark: boolean;
}) {
  const location = useLocation();
  const containsActive = group.children.some((c) =>
    c.to === '/documents'
      ? location.pathname === '/documents' || location.pathname.startsWith('/documents/')
      : location.pathname === c.to,
  );
  const [open, setOpen] = useState(group.defaultOpen || containsActive);

  const headerLight = 'text-ink-700 hover:bg-ink-100';
  const headerDark = 'text-ink-300 hover:bg-ink-900 hover:text-white';

  if (collapsed) {
    // when collapsed render just the icon as a tooltip "header"
    return (
      <div
        className={`flex items-center justify-center px-3 py-2 rounded-[6px] ${
          dark ? headerDark : headerLight
        }`}
        title={group.label}
      >
        {group.icon}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm font-semibold uppercase tracking-wider text-[11px] ${
          dark ? headerDark : headerLight
        }`}
      >
        <span className="w-4 h-4 shrink-0 flex items-center justify-center">{group.icon}</span>
        <span className="flex-1 text-left truncate">{group.label}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-0.5 pl-3 border-l border-current/20">
          {group.children.map((c, i) => (
            <NavLeafItem key={i} item={c} collapsed={false} dark={dark} />
          ))}
        </div>
      )}
    </div>
  );
}
