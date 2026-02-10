import { useState } from 'react'
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Bell,
  Upload,
  CalendarDays,
  FileCheck,
  Shield,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Send,
  Trash2,
  Download,
  RefreshCw,
} from 'lucide-react'
import Button from '../ui/Button'
import SearchBox from '../ui/SearchBox'
import Checkbox from '../ui/Checkbox'
import ContextMenu, { ContextMenuItem } from '../ui/ContextMenu'
import { useToast } from '../ui/Toast'

// Mock data for certifications
interface EmployeeCertification {
  id: string
  templateId: string
  templateName: string
  category: string
  employeeId: string
  employeeName: string
  employeeRole: string
  employeeLocation: string
  status: 'requested' | 'pending-upload' | 'pending-verification' | 'active' | 'expiring-soon' | 'expired' | 'rejected'
  documentUrl?: string
  uploadedAt?: string
  expirationDate?: string
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
  remindersSent: number
  lastReminderDate?: string
}

// Temporary mock data
const mockCertifications: EmployeeCertification[] = [
  {
    id: 'c1',
    templateId: 'ct1',
    templateName: 'Food Handler Certificate',
    category: 'food-safety',
    employeeId: '1',
    employeeName: 'John Smith',
    employeeRole: 'Server',
    employeeLocation: 'Downtown',
    status: 'active',
    documentUrl: '/uploads/cert-001.pdf',
    uploadedAt: '2024-01-10',
    expirationDate: '2026-01-10',
    verifiedBy: 'Sarah Johnson',
    verifiedAt: '2024-01-11',
    remindersSent: 0,
  },
  {
    id: 'c2',
    templateId: 'ct1',
    templateName: 'Food Handler Certificate',
    category: 'food-safety',
    employeeId: '3',
    employeeName: 'Mike Williams',
    employeeRole: 'Cook',
    employeeLocation: 'Downtown',
    status: 'expiring-soon',
    documentUrl: '/uploads/cert-002.pdf',
    uploadedAt: '2022-02-15',
    expirationDate: '2024-02-15',
    verifiedBy: 'Sarah Johnson',
    verifiedAt: '2022-02-16',
    remindersSent: 1,
    lastReminderDate: '2024-01-15',
  },
  {
    id: 'c3',
    templateId: 'ct2',
    templateName: 'TIPS Alcohol Certification',
    category: 'alcohol',
    employeeId: '4',
    employeeName: 'Emily Davis',
    employeeRole: 'Bartender',
    employeeLocation: 'Midtown',
    status: 'expired',
    documentUrl: '/uploads/cert-003.pdf',
    uploadedAt: '2021-06-20',
    expirationDate: '2023-06-20',
    remindersSent: 3,
    lastReminderDate: '2023-06-15',
  },
  {
    id: 'c4',
    templateId: 'ct1',
    templateName: 'Food Handler Certificate',
    category: 'food-safety',
    employeeId: '5',
    employeeName: 'Chris Brown',
    employeeRole: 'Host',
    employeeLocation: 'Downtown',
    status: 'pending-upload',
    remindersSent: 2,
    lastReminderDate: '2024-01-20',
  },
  {
    id: 'c5',
    templateId: 'ct3',
    templateName: 'Driver\'s License',
    category: 'drivers-license',
    employeeId: '6',
    employeeName: 'Alex Martinez',
    employeeRole: 'Delivery Driver',
    employeeLocation: 'Uptown',
    status: 'pending-verification',
    documentUrl: '/uploads/cert-005.pdf',
    uploadedAt: '2024-01-25',
    expirationDate: '2027-05-15',
    remindersSent: 0,
  },
  {
    id: 'c6',
    templateId: 'ct2',
    templateName: 'TIPS Alcohol Certification',
    category: 'alcohol',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    employeeRole: 'Manager',
    employeeLocation: 'Uptown',
    status: 'active',
    documentUrl: '/uploads/cert-006.pdf',
    uploadedAt: '2023-08-10',
    expirationDate: '2025-08-10',
    verifiedBy: 'Regional Manager',
    verifiedAt: '2023-08-11',
    remindersSent: 0,
  },
]

interface CertificationsDashboardProps {
  onRequestCertification?: () => void
  onViewCertification?: (cert: EmployeeCertification) => void
  onVerifyCertification?: (cert: EmployeeCertification) => void
  onViewCalendar?: () => void
}

// ─── Reduced color palette ───
// Red = act now (expired, rejected)
// Amber = heads up (expiring, pending upload, needs review, requested)
// Green = all good (active/valid)
// Gray = neutral fallback
const statusDisplayConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  'requested': { 
    label: 'Requested', 
    icon: <Clock className="w-3 h-3" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'pending-upload': { 
    label: 'Pending Upload', 
    icon: <Upload className="w-3 h-3" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'pending-verification': { 
    label: 'Needs Review', 
    icon: <Clock className="w-3 h-3" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'active': { 
    label: 'Valid', 
    icon: <CheckCircle2 className="w-3 h-3" />, 
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  'expiring-soon': { 
    label: 'Expiring Soon', 
    icon: <AlertTriangle className="w-3 h-3" />, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'expired': { 
    label: 'Expired', 
    icon: <XCircle className="w-3 h-3" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'rejected': { 
    label: 'Rejected', 
    icon: <XCircle className="w-3 h-3" />, 
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
}

// Category badges — all neutral gray
const categoryConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  'food-safety': { label: 'Food Safety', icon: <Shield className="w-3 h-3" /> },
  'alcohol': { label: 'Alcohol', icon: <Shield className="w-3 h-3" /> },
  'drivers-license': { label: 'Driver\'s License', icon: <FileCheck className="w-3 h-3" /> },
  'work-permit': { label: 'Work Permit', icon: <FileCheck className="w-3 h-3" /> },
  'professional': { label: 'Professional', icon: <FileCheck className="w-3 h-3" /> },
  'health': { label: 'Health', icon: <Shield className="w-3 h-3" /> },
  'other': { label: 'Other', icon: <FileCheck className="w-3 h-3" /> },
}

type SortField = 'employee' | 'certification' | 'status' | 'expiration'
type SortDirection = 'asc' | 'desc'

// Status filter chips — traffic light palette only
const statusChips: { id: string; label: string; filterFn: (c: EmployeeCertification) => boolean; dotColor: string }[] = [
  { id: 'all', label: 'All', filterFn: () => true, dotColor: 'bg-gray-400' },
  { id: 'expired', label: 'Expired', filterFn: (c) => c.status === 'expired', dotColor: 'bg-red-500' },
  { id: 'expiring-soon', label: 'Expiring', filterFn: (c) => c.status === 'expiring-soon', dotColor: 'bg-amber-500' },
  { id: 'pending-verification', label: 'Needs Review', filterFn: (c) => c.status === 'pending-verification', dotColor: 'bg-amber-500' },
  { id: 'pending-upload', label: 'Pending Upload', filterFn: (c) => c.status === 'pending-upload', dotColor: 'bg-amber-500' },
  { id: 'active', label: 'Valid', filterFn: (c) => c.status === 'active', dotColor: 'bg-green-500' },
]

export default function CertificationsDashboard({
  onRequestCertification,
  onViewCertification,
  onVerifyCertification,
  onViewCalendar,
}: CertificationsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChip, setActiveChip] = useState('all')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const { addToast } = useToast()

  // Compute chip counts
  const chipCounts = statusChips.reduce((acc, chip) => {
    acc[chip.id] = mockCertifications.filter(chip.filterFn).length
    return acc
  }, {} as Record<string, number>)

  // Filter certifications
  const activeChipDef = statusChips.find((c) => c.id === activeChip) || statusChips[0]
  const filteredCertifications = mockCertifications.filter((cert) => {
    const matchesSearch = 
      cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.templateName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesChip = activeChipDef.filterFn(cert)
    
    return matchesSearch && matchesChip
  })

  // Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-gray-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-gray-600" />
    )
  }

  // Sort by priority (default) or by selected field
  const statusPriority: Record<string, number> = {
    'expired': 1,
    'expiring-soon': 2,
    'pending-verification': 3,
    'pending-upload': 4,
    'active': 5,
    'requested': 6,
    'rejected': 7,
  }
  
  const sortedCertifications = [...filteredCertifications].sort((a, b) => {
    if (!sortField) {
      return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99)
    }
    const dir = sortDirection === 'asc' ? 1 : -1
    switch (sortField) {
      case 'employee':
        return a.employeeName.localeCompare(b.employeeName) * dir
      case 'certification':
        return a.templateName.localeCompare(b.templateName) * dir
      case 'status':
        return ((statusPriority[a.status] || 99) - (statusPriority[b.status] || 99)) * dir
      case 'expiration':
        return ((new Date(a.expirationDate || '9999-12-31').getTime()) - (new Date(b.expirationDate || '9999-12-31').getTime())) * dir
      default:
        return 0
    }
  })

  // Bulk selection
  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRows.length === sortedCertifications.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(sortedCertifications.map((c) => c.id))
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDaysUntilExpiry = (expirationDate?: string) => {
    if (!expirationDate) return null
    const now = new Date()
    const expiry = new Date(expirationDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMenuItems = (cert: EmployeeCertification): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [
      {
        id: 'view',
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => onViewCertification?.(cert),
      },
    ]

    if (cert.status === 'pending-verification') {
      items.push({
        id: 'verify',
        label: 'Review & Verify',
        icon: <CheckCircle2 className="w-4 h-4" />,
        onClick: () => onVerifyCertification?.(cert),
      })
    }

    if (cert.status === 'pending-upload' || cert.status === 'expired' || cert.status === 'expiring-soon') {
      items.push({
        id: 'remind',
        label: 'Send Reminder',
        icon: <Bell className="w-4 h-4" />,
        onClick: () => addToast(`Reminder sent to ${cert.employeeName}`, 'success'),
      })
    }

    if (cert.documentUrl) {
      items.push({
        id: 'download',
        label: 'Download Document',
        icon: <Download className="w-4 h-4" />,
        onClick: () => addToast(`Downloading ${cert.templateName} for ${cert.employeeName}`, 'info'),
      })
    }

    items.push({
      id: 'reassign',
      label: 'Re-request',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: () => addToast(`Certification re-requested from ${cert.employeeName}`, 'success'),
    })

    items.push({
      id: 'delete',
      label: 'Remove',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => addToast(`Certification removed for ${cert.employeeName}`, 'error'),
    })

    return items
  }

  return (
    <div className="space-y-4">
      {/* ─── Status Filter Chips + Search ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusChips.map((chip) => {
            const count = chipCounts[chip.id]
            if (chip.id !== 'all' && count === 0) return null
            const isActive = activeChip === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => setActiveChip(chip.id)}
                className={`
                  inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all
                  ${isActive
                    ? 'bg-text-primary text-white shadow-sm'
                    : 'bg-white text-text-secondary border border-border-light hover:border-gray-300 hover:text-text-primary'
                  }
                `}
              >
                {chip.id !== 'all' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/70' : chip.dotColor}`} />
                )}
                {chip.label}
                <span className={`${isActive ? 'text-white/70' : 'text-text-secondary'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search certifications..."
            className="w-64"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CalendarDays className="w-3.5 h-3.5" />}
            onClick={onViewCalendar}
          >
            Calendar
          </Button>
        </div>
      </div>

      {/* Floating bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 bg-gray-900 text-white rounded-container px-4 py-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
            {selectedRows.length} certification{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`Reminders sent for ${selectedRows.length} certification(s)`, 'success')
                setSelectedRows([])
              }}
            >
              Send Reminders
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                addToast(`Downloading ${selectedRows.length} certification(s)`, 'info')
                setSelectedRows([])
              }}
            >
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setSelectedRows([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ─── Certifications Table ─── */}
      <div className="bg-white rounded-container border border-border-light overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-gray-50">
              <th className="h-11 px-4 w-12">
                <Checkbox
                  checked={selectedRows.length === sortedCertifications.length && sortedCertifications.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('employee')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Employee {getSortIcon('employee')}
                </button>
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('certification')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Certification {getSortIcon('certification')}
                </button>
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Category
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th className="h-11 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('expiration')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  Expiration {getSortIcon('expiration')}
                </button>
              </th>
              <th className="h-11 px-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-[120px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCertifications.map((cert) => {
              const status = statusDisplayConfig[cert.status]
              const category = categoryConfig[cert.category] || categoryConfig['other']
              const daysUntilExpiry = getDaysUntilExpiry(cert.expirationDate)
              
              return (
                <tr 
                  key={cert.id} 
                  className={`border-b border-border-light last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                    selectedRows.includes(cert.id) ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => onViewCertification?.(cert)}
                >
                  <td className="h-14 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.includes(cert.id)}
                      onChange={() => handleToggleRow(cert.id)}
                    />
                  </td>
                  <td className="h-14 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-600">
                          {cert.employeeName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{cert.employeeName}</p>
                        <p className="text-xs text-text-secondary">{cert.employeeRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="h-14 px-4">
                    <p className="text-sm text-text-primary">{cert.templateName}</p>
                  </td>
                  <td className="h-14 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {category.icon}
                      {category.label}
                    </span>
                  </td>
                  <td className="h-14 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="h-14 px-4">
                    {cert.expirationDate ? (
                      <div>
                        <p className="text-sm text-text-primary">{formatDate(cert.expirationDate)}</p>
                        {daysUntilExpiry !== null && (
                          <p className={`text-xs ${
                            daysUntilExpiry < 0 ? 'text-red-600' :
                            daysUntilExpiry < 30 ? 'text-amber-600' :
                            'text-text-secondary'
                          }`}>
                            {daysUntilExpiry < 0 
                              ? `${Math.abs(daysUntilExpiry)} days overdue`
                              : daysUntilExpiry === 0 
                                ? 'Expires today'
                                : `${daysUntilExpiry} days left`
                            }
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-text-placeholder">—</span>
                    )}
                  </td>
                  <td className="h-14 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {cert.status === 'pending-verification' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onVerifyCertification?.(cert)}
                        >
                          Review
                        </Button>
                      )}
                      {(cert.status === 'expired' || cert.status === 'expiring-soon' || cert.status === 'pending-upload') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToast(`Reminder sent to ${cert.employeeName}`, 'success')}
                          className="text-gray-500 hover:bg-gray-100"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <ContextMenu items={getMenuItems(cert)} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sortedCertifications.length === 0 && (
          <div className="p-12 text-center">
            <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-text-primary mb-1">No certifications found</h3>
            <p className="text-sm text-text-secondary">
              {searchQuery || activeChip !== 'all'
                ? 'Try adjusting your filters'
                : 'Request certifications from your team to get started'}
            </p>
            {!searchQuery && activeChip === 'all' && (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-4"
                onClick={onRequestCertification}
              >
                Request Certification
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedCertifications.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Showing {sortedCertifications.length} of {mockCertifications.length} certifications
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export type { EmployeeCertification }
