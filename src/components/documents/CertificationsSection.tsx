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
  Upload,
  Download,
  Eye,
  Bell,
  Shield,
  Plus
} from 'lucide-react'
import Button from '../ui/Button'
import { getEmployeeCertifications, EmployeeCertification, CertificationStatus } from '../../data/mockData'

interface CertificationsSectionProps {
  employeeId: string
  employeeName: string
  onViewCertification?: (cert: EmployeeCertification) => void
  onUploadCertification?: (templateId?: string) => void
  onSendReminder?: (cert: EmployeeCertification) => void
  collapsed?: boolean
}

const statusConfig: Record<CertificationStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  'requested': { 
    label: 'Requested', 
    icon: <Bell className="w-3 h-3" />, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  'pending-upload': { 
    label: 'Pending Upload', 
    icon: <Upload className="w-3 h-3" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  },
  'pending-verification': { 
    label: 'Pending Review', 
    icon: <Clock className="w-3 h-3" />, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  'active': { 
    label: 'Valid', 
    icon: <CheckCircle2 className="w-3 h-3" />, 
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  'expiring-soon': { 
    label: 'Expiring Soon', 
    icon: <AlertTriangle className="w-3 h-3" />, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  'expired': { 
    label: 'Expired', 
    icon: <XCircle className="w-3 h-3" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  'rejected': { 
    label: 'Rejected', 
    icon: <XCircle className="w-3 h-3" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
}

const categoryIcons: Record<string, React.ReactNode> = {
  'food-safety': <Shield className="w-4 h-4" />,
  'alcohol': <Shield className="w-4 h-4" />,
  'drivers-license': <FileText className="w-4 h-4" />,
  'work-permit': <FileText className="w-4 h-4" />,
  'professional': <FileText className="w-4 h-4" />,
  'health': <Shield className="w-4 h-4" />,
  'other': <FileText className="w-4 h-4" />,
}

export default function CertificationsSection({
  employeeId,
  employeeName,
  onViewCertification,
  onUploadCertification,
  onSendReminder,
  collapsed = false,
}: CertificationsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed)

  const certifications = getEmployeeCertifications(employeeId)
  
  // Sort by priority (expired first, then expiring, then pending)
  const statusPriority: Record<string, number> = {
    'expired': 1,
    'expiring-soon': 2,
    'pending-verification': 3,
    'pending-upload': 4,
    'rejected': 5,
    'active': 6,
    'requested': 7,
  }
  
  const sortedCertifications = [...certifications].sort((a, b) => 
    (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99)
  )
  
  // Calculate stats
  const stats = {
    total: certifications.length,
    valid: certifications.filter(c => c.status === 'active').length,
    expiring: certifications.filter(c => c.status === 'expiring-soon').length,
    expired: certifications.filter(c => c.status === 'expired').length,
    pending: certifications.filter(c => ['pending-upload', 'pending-verification'].includes(c.status)).length,
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntilExpiry = (expirationDate?: string) => {
    if (!expirationDate) return null
    const now = new Date()
    const expiry = new Date(expirationDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (certifications.length === 0) {
    return (
      <div className="bg-white rounded-container border border-border-light p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Certifications & Licenses</h3>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3 h-3" />}
            onClick={() => onUploadCertification?.()}
          >
            Request
          </Button>
        </div>
        <div className="text-center py-8">
          <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No certifications on file</p>
          <p className="text-xs text-text-placeholder mt-1">
            Request certifications from {employeeName.split(' ')[0]}
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
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-text-primary">Certifications & Licenses</h3>
            <p className="text-xs text-text-secondary">
              {stats.valid} valid · {stats.pending} pending · {stats.expiring + stats.expired} needs attention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats.expired > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
              {stats.expired} expired
            </span>
          )}
          {stats.expiring > 0 && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
              {stats.expiring} expiring
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
          {/* Certification List */}
          <div className="divide-y divide-border-light">
            {sortedCertifications.map((cert) => {
              const status = statusConfig[cert.status]
              const daysUntilExpiry = getDaysUntilExpiry(cert.expirationDate)
              const categoryIcon = categoryIcons[cert.category] || categoryIcons['other']
              
              return (
                <div 
                  key={cert.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    cert.status === 'expired' ? 'bg-red-50' :
                    cert.status === 'expiring-soon' ? 'bg-orange-50' :
                    ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      cert.status === 'active' ? 'bg-green-100 text-green-600' :
                      cert.status === 'expiring-soon' ? 'bg-orange-100 text-orange-600' :
                      cert.status === 'expired' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {categoryIcon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{cert.templateName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                            {cert.expirationDate && (
                              <span className={`text-xs ${
                                daysUntilExpiry !== null && daysUntilExpiry < 0 ? 'text-red-600' :
                                daysUntilExpiry !== null && daysUntilExpiry < 30 ? 'text-orange-600' :
                                'text-text-secondary'
                              }`}>
                                Expires {formatDate(cert.expirationDate)}
                                {daysUntilExpiry !== null && (
                                  <span className="ml-1">
                                    ({daysUntilExpiry < 0 
                                      ? `${Math.abs(daysUntilExpiry)}d overdue`
                                      : daysUntilExpiry === 0
                                        ? 'today'
                                        : `${daysUntilExpiry}d left`
                                    })
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {cert.documentUrl && (
                            <>
                              <button
                                onClick={() => onViewCertification?.(cert)}
                                className="p-1.5 rounded hover:bg-white/50 transition-colors"
                                title="View document"
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                className="p-1.5 rounded hover:bg-white/50 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-gray-500" />
                              </button>
                            </>
                          )}
                          {(cert.status === 'pending-upload' || cert.status === 'expired') && (
                            <button
                              onClick={() => onSendReminder?.(cert)}
                              className="p-1.5 rounded hover:bg-white/50 transition-colors"
                              title="Send reminder"
                            >
                              <Bell className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      {cert.certificateNumber && (
                        <p className="text-xs text-text-secondary mt-2">
                          Certificate #: <span className="font-mono">{cert.certificateNumber}</span>
                        </p>
                      )}
                      
                      {cert.verifiedBy && (
                        <p className="text-xs text-text-secondary mt-1">
                          Verified by {cert.verifiedBy} on {formatDate(cert.verifiedAt)}
                        </p>
                      )}
                      
                      {cert.status === 'pending-upload' && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Upload className="w-3 h-3" />}
                            onClick={() => onUploadCertification?.(cert.templateId)}
                          >
                            Upload
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Request New */}
          <div className="p-4 bg-gray-50 border-t border-border-light">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => onUploadCertification?.()}
              className="w-full"
            >
              Request New Certification
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}



