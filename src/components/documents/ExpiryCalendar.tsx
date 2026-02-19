import { useState, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Bell,
  Calendar as CalendarIcon
} from 'lucide-react'
import Button from '../ui/Button'
import { employeeCertifications, EmployeeCertification } from '../../data/mockData'

interface ExpiryCalendarProps {
  onViewCertification?: (cert: EmployeeCertification) => void
  onSendReminder?: (cert: EmployeeCertification) => void
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  expirations: EmployeeCertification[]
}

export default function ExpiryCalendar({
  onViewCertification,
  onSendReminder,
}: ExpiryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get all certifications with expiration dates
  const certificationsWithExpiry = useMemo(() => {
    return employeeCertifications.filter(cert => cert.expirationDate)
  }, [])

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
    
    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let current = new Date(startDate)
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const expirations = certificationsWithExpiry.filter(cert => 
        cert.expirationDate === dateStr
      )
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        expirations,
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentDate, certificationsWithExpiry])

  // Get expirations for selected date
  const selectedExpirations = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = selectedDate.toISOString().split('T')[0]
    return certificationsWithExpiry.filter(cert => cert.expirationDate === dateStr)
  }, [selectedDate, certificationsWithExpiry])

  // Count expirations by month for overview
  const monthlyStats = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    let expiredCount = 0
    let expiringThisMonth = 0
    let upcomingCount = 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    
    certificationsWithExpiry.forEach(cert => {
      if (!cert.expirationDate) return
      const expiryDate = new Date(cert.expirationDate)
      
      if (expiryDate < today) {
        expiredCount++
      } else if (expiryDate >= monthStart && expiryDate <= monthEnd) {
        expiringThisMonth++
      } else if (expiryDate > monthEnd) {
        upcomingCount++
      }
    })
    
    return { expiredCount, expiringThisMonth, upcomingCount }
  }, [currentDate, certificationsWithExpiry])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getExpirationColor = (expirationDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expirationDate)
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'bg-red-500'
    if (diffDays <= 7) return 'bg-red-400'
    if (diffDays <= 30) return 'bg-orange-400'
    if (diffDays <= 60) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  return (
    <div className="flex gap-6">
      {/* Calendar */}
      <div className="flex-1 bg-white rounded-container border border-border-light overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-light">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-text-primary">
              {formatMonthYear(currentDate)}
            </h2>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-border-light">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{monthlyStats.expiredCount}</p>
            <p className="text-xs text-text-secondary">Expired</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{monthlyStats.expiringThisMonth}</p>
            <p className="text-xs text-text-secondary">Expiring This Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{monthlyStats.upcomingCount}</p>
            <p className="text-xs text-text-secondary">Future</p>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border-light">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-text-secondary uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const isSelected = selectedDate && 
              day.date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  min-h-[80px] p-2 border-b border-r border-border-light text-left transition-colors
                  ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
                  ${day.isToday ? 'ring-2 ring-inset ring-primary-500' : ''}
                  ${isSelected ? 'bg-primary-50' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${!day.isCurrentMonth ? 'text-text-placeholder' : 'text-text-primary'}
                  ${day.isToday ? 'text-primary-600' : ''}
                `}>
                  {day.date.getDate()}
                </span>
                
                {/* Expiration dots */}
                {day.expirations.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {day.expirations.slice(0, 3).map((cert) => (
                      <div
                        key={cert.id}
                        className={`h-1.5 rounded-full ${getExpirationColor(cert.expirationDate!)}`}
                        title={`${cert.employeeName} - ${cert.templateName}`}
                      />
                    ))}
                    {day.expirations.length > 3 && (
                      <span className="text-xs text-text-secondary">
                        +{day.expirations.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 p-3 bg-gray-50 border-t border-border-light">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-text-secondary">Expired</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-xs text-text-secondary">This Month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-xs text-text-secondary">60 Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs text-text-secondary">Valid</span>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="w-80 bg-white rounded-container border border-border-light overflow-hidden">
        <div className="p-4 border-b border-border-light bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {selectedDate 
                  ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  : 'Select a date'
                }
              </h3>
              <p className="text-xs text-text-secondary">
                {selectedExpirations.length} certification{selectedExpirations.length !== 1 ? 's' : ''} expiring
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 max-h-[500px] overflow-auto">
          {selectedDate ? (
            selectedExpirations.length > 0 ? (
              <div className="space-y-3">
                {selectedExpirations.map((cert) => {
                  const isExpired = new Date(cert.expirationDate!) < new Date()
                  
                  return (
                    <div
                      key={cert.id}
                      className={`p-3 rounded-element border ${
                        isExpired 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-border-light bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isExpired ? 'bg-red-100' : 'bg-orange-100'
                        }`}>
                          {isExpired ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {cert.employeeName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {cert.templateName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {cert.employeeRole} · {cert.employeeLocation}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current border-opacity-10">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => onViewCertification?.(cert)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Bell className="w-3 h-3" />}
                          onClick={() => onSendReminder?.(cert)}
                        >
                          Remind
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-sm text-text-secondary">
                  No certifications expiring on this date
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-text-secondary">
                Click on a date to see expiring certifications
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



