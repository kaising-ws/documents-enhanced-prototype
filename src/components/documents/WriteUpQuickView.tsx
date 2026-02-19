import {
  X,
  Calendar,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  PenLine,
} from 'lucide-react'
import {
  WriteUp,
  WriteUpStatus,
  WriteUpType,
  getWriteUpTemplateName,
} from '../../data/mockData'

interface WriteUpQuickViewProps {
  writeUp: WriteUp | null
  onClose: () => void
}

const statusConfig: Record<
  WriteUpStatus,
  { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }
> = {
  draft: { label: 'Draft', icon: <FileText className="w-4 h-4" />, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  scheduled: { label: 'Scheduled', icon: <Clock className="w-4 h-4" />, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  sent: { label: 'Pending Acknowledgement', icon: <Clock className="w-4 h-4" />, color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  acknowledged: { label: 'Acknowledged', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  refused: { label: 'Refused to Sign', icon: <XCircle className="w-4 h-4" />, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  expired: { label: 'Expired', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
}

const typeLabels: Record<WriteUpType, string> = {
  'verbal-warning': 'Verbal Warning',
  'written-warning': 'Written Warning',
  'final-warning': 'Final Warning',
  'performance-improvement': 'Performance Improvement Plan',
  recognition: 'Recognition',
  coaching: 'Coaching',
}

export default function WriteUpQuickView({ writeUp, onClose }: WriteUpQuickViewProps) {
  if (!writeUp) return null

  const sc = statusConfig[writeUp.status]

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <PenLine className="w-4.5 h-4.5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary truncate">
                {writeUp.title}
              </h2>
              <p className="text-xs text-text-secondary">
                {getWriteUpTemplateName(writeUp.templateId)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status banner */}
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border ${sc.bgColor} ${sc.borderColor}`}>
            <span className={sc.color}>{sc.icon}</span>
            <span className={`text-sm font-medium ${sc.color}`}>{sc.label}</span>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Employee</p>
                <p className="text-sm font-medium text-text-primary">{writeUp.employeeName}</p>
                <p className="text-xs text-text-secondary">{writeUp.employeeRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Location</p>
                <p className="text-sm font-medium text-text-primary">{writeUp.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Incident Date</p>
                <p className="text-sm font-medium text-text-primary">{formatDate(writeUp.incidentDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Type</p>
                <p className="text-sm font-medium text-text-primary">{typeLabels[writeUp.type]}</p>
              </div>
            </div>
          </div>

          {writeUp.points !== undefined && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-border-light">
              <span className="text-xs text-text-secondary">Demerit Points:</span>
              <span className="text-sm font-bold text-text-primary">{writeUp.points}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-text-primary leading-relaxed bg-gray-50 rounded-lg border border-border-light px-4 py-3">
              {writeUp.description}
            </p>
          </div>

          {/* Manager Notes */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Manager Notes
            </h3>
            <p className="text-sm text-text-primary leading-relaxed bg-gray-50 rounded-lg border border-border-light px-4 py-3">
              {writeUp.managerNotes}
            </p>
          </div>

          {/* Employee Response */}
          {writeUp.employeeResponse && (
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Employee Response
              </h3>
              <p className="text-sm text-text-primary leading-relaxed bg-blue-50 rounded-lg border border-blue-200 px-4 py-3">
                {writeUp.employeeResponse}
              </p>
            </div>
          )}

          {/* Signatures */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Signatures
            </h3>
            <div className="space-y-3">
              {/* Manager signature */}
              <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-xs text-green-700 font-medium">Manager</p>
                  <p className="text-sm text-text-primary">{writeUp.managerSignature.signedBy}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-green-700">{formatDateTime(writeUp.managerSignature.signedAt)}</span>
                </div>
              </div>

              {/* Employee signature */}
              {writeUp.employeeSignature ? (
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                    writeUp.employeeSignature.declined
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        writeUp.employeeSignature.declined ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      Employee {writeUp.employeeSignature.declined ? '(Declined)' : ''}
                    </p>
                    <p className="text-sm text-text-primary">{writeUp.employeeSignature.signedBy}</p>
                    {writeUp.employeeSignature.declineReason && (
                      <p className="text-xs text-red-600 mt-1 italic">
                        &ldquo;{writeUp.employeeSignature.declineReason}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {writeUp.employeeSignature.declined ? (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    )}
                    <span
                      className={`text-xs ${
                        writeUp.employeeSignature.declined ? 'text-red-600' : 'text-green-700'
                      }`}
                    >
                      {formatDateTime(writeUp.employeeSignature.signedAt)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-border-light">
                  <div>
                    <p className="text-xs text-text-secondary font-medium">Employee</p>
                    <p className="text-sm text-text-secondary italic">Awaiting signature</p>
                  </div>
                  <Clock className="w-4 h-4 text-text-secondary" />
                </div>
              )}
            </div>
          </div>

          {/* Activity/Timeline */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Timeline
            </h3>
            <div className="space-y-0 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-light" />
              {[
                { label: 'Created', date: writeUp.createdAt, by: writeUp.createdBy },
                ...(writeUp.sentDate ? [{ label: 'Sent to employee', date: writeUp.sentDate }] : []),
                ...(writeUp.lastReminderDate
                  ? [{ label: `Reminder sent (${writeUp.remindersSent} total)`, date: writeUp.lastReminderDate }]
                  : []),
                ...(writeUp.acknowledgedDate ? [{ label: 'Acknowledged', date: writeUp.acknowledgedDate }] : []),
                ...(writeUp.employeeSignature?.declined
                  ? [{ label: 'Employee refused to sign', date: writeUp.employeeSignature.signedAt }]
                  : []),
              ].map((event, i) => (
                <div key={i} className="flex items-start gap-3 py-2 relative">
                  <div className="w-[15px] h-[15px] rounded-full bg-white border-2 border-gray-300 flex-shrink-0 z-10" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{event.label}</p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(event.date)}
                      {'by' in event && event.by ? ` by ${event.by}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

