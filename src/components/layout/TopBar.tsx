import { Bell, HelpCircle } from 'lucide-react'

interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-[62px] bg-white border-b border-border-light shadow-topbar flex items-center justify-between px-10">
      {/* Title */}
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-6 h-6 text-text-primary" />
        </button>

        {/* Help */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <HelpCircle className="w-6 h-6 text-text-primary" />
        </button>

        {/* Profile Avatar */}
        <button className="w-10 h-10 flex items-center justify-center">
          <div className="w-[30px] h-[30px] bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">JC</span>
          </div>
        </button>
      </div>
    </header>
  )
}

