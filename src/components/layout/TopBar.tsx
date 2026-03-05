import { Bell, HelpCircle } from 'lucide-react'

interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-[62px] bg-white border-b border-border-light shadow-topbar flex items-center justify-between px-10 shrink-0">
      <h1 className="text-title-4 text-text-primary">{title}</h1>

      <div className="flex items-center gap-0.5">
        <button className="w-10 h-10 flex items-center justify-center rounded-element hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-text-primary" />
        </button>

        <button className="w-10 h-10 flex items-center justify-center rounded-element hover:bg-gray-50 transition-colors">
          <HelpCircle className="w-5 h-5 text-text-primary" />
        </button>

        <button className="w-10 h-10 flex items-center justify-center ml-1">
          <div className="w-[30px] h-[30px] bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-caption font-semibold text-white">JC</span>
          </div>
        </button>
      </div>
    </header>
  )
}
