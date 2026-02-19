import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  Calendar,
  Award,
  PenLine,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Button from '../ui/Button'
import { WriteUp, getEmployeeWriteUps, getEmployeePointBalance } from '../../data/mockData'

interface WriteUpHistorySectionProps {
  employeeId: string
  employeeName: string
  onViewWriteUp?: (writeUp: WriteUp) => void
  onResendWriteUp?: (writeUp: WriteUp) => void
  collapsed?: boolean
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  draft: { 
    label: 'Draft', 
    icon: <FileText className="w-3 h-3" />, 
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  scheduled: { 
    label: 'Scheduled', 
    icon: <Calendar className="w-3 h-3" />, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  sent: { 
    label: 'Pending', 
    icon: <Clock className="w-3 h-3" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  },
  acknowledged: { 
    label: 'Acknowledged', 
    icon: <CheckCircle2 className="w-3 h-3" />, 
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  refused: { 
    label: 'Refused', 
    icon: <XCircle className="w-3 h-3" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  expired: { 
    label: 'Expired', 
    icon: <AlertTriangle className="w-3 h-3" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; severity: number }> = {
  'verbal-warning': { label: 'Verbal Warning', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', severity: 1 },
  'written-warning': { label: 'Written Warning', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-600 bg-orange-50 border-orange-200', severity: 2 },
  'final-warning': { label: 'Final Warning', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-200', severity: 3 },
  'performance-improvement': { label: 'Performance Improvement Plan', icon: <FileText className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200', severity: 2 },
  'recognition': { label: 'Recognition', icon: <Award className="w-4 h-4" />, color: 'text-green-600 bg-green-50 border-green-200', severity: 0 },
  'coaching': { label: 'Coaching', icon: <PenLine className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200', severity: 0 },
}

export default function WriteUpHistorySection({
  employeeId,
  employeeName,
  onViewWriteUp,
  onResendWriteUp,
  collapsed = false,
}: WriteUpHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed)
  const [showAll, setShowAll] = useState(false)

  const writeUps = getEmployeeWriteUps(employeeId)
  const pointBalance = getEmployeePointBalance(employeeId)
  
  // Sort by date (most recent first)
  const sortedWriteUps = [...writeUps].sort((a, b) => 
    new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime()
  )
  
  const displayedWriteUps = showAll ? sortedWriteUps : sortedWriteUps.slice(0, 3)
  
  // Calculate stats
  const stats = {
    total: writeUps.length,
    warnings: writeUps.filter(wu => ['verbal-warning', 'written-warning', 'final-warning'].includes(wu.type)).length,
    recognitions: writeUps.filter(wu => wu.type === 'recognition').length,
    pending: writeUps.filter(wu => wu.status === 'sent').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (writeUps.length === 0) {
    return (
      <div className="bg-white rounded-container border border-border-light p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Write-up History</h3>
        </div>
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No write-ups on record</p>
          <p className="text-xs text-text-placeholder mt-1">
            {employeeName.split(' ')[0]} has a clean record
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-container border border-border-light overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-text-primary">Write-up History</h3>
            <p className="text-xs text-text-secondary">
              {stats.total} record{stats.total !== 1 ? 's' : ''} · {stats.warnings} warning{stats.warnings !== 1 ? 's' : ''} · {stats.recognitions} recognition{stats.recognitions !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Point Balance Badge */}
          {pointBalance !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
              pointBalance > 0 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {pointBalance > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {pointBalance > 0 ? '+' : ''}{pointBalance} pts
            </div>
          )}
          {stats.pending > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              {stats.pending} pending
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border-light">
          {/* Timeline */}
          <div className="p-4 space-y-4">
            {displayedWriteUps.map((writeUp, index) => {
              const type = typeConfig[writeUp.type]
              const status = statusConfig[writeUp.status]
              
              return (
                <div key={writeUp.id} className="relative">
                  {/* Timeline connector */}
                  {index < displayedWriteUps.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" />
                  )}
                  
                  <div className={`flex gap-4 p-3 rounded-element border ${type.color}`}>
                    {/* Type Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${type.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-20`}>
                      {type.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{writeUp.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {formatDate(writeUp.incidentDate)}
                            </span>
                            {writeUp.points && writeUp.points > 0 && (
                              <span className="text-xs text-red-600 font-medium">
                                +{writeUp.points} pts
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onViewWriteUp?.(writeUp)}
                            className="p-1.5 rounded hover:bg-white/50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-white/50 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4 text-gray-500" />
                          </button>
                          {writeUp.status === 'sent' && (
                            <button
                              onClick={() => onResendWriteUp?.(writeUp)}
                              className="p-1.5 rounded hover:bg-white/50 transition-colors"
                              title="Send reminder"
                            >
                              <RefreshCw className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Description Preview */}
                      <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                        {writeUp.description}
                      </p>
                      
                      {/* Signatures */}
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-current border-opacity-10">
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span>Issued by {writeUp.managerSignature.signedBy}</span>
                        </div>
                        {writeUp.employeeSignature ? (
                          <div className="flex items-center gap-1 text-xs">
                            {writeUp.employeeSignature.declined ? (
                              <>
                                <XCircle className="w-3 h-3 text-red-500" />
                                <span className="text-red-600">Declined to sign</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                <span className="text-text-secondary">Acknowledged</span>
                              </>
                            )}
                          </div>
                        ) : writeUp.status === 'sent' ? (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            <span>Awaiting acknowledgement</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Show More/Less */}
          {sortedWriteUps.length > 3 && (
            <div className="px-4 pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? 'Show Less' : `Show ${sortedWriteUps.length - 3} More`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}



