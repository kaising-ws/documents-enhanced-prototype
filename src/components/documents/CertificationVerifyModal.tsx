import { useState } from 'react'
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Download,
  ExternalLink,
  User,
  MapPin,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { EmployeeCertification } from '../../data/mockData'

interface CertificationVerifyModalProps {
  isOpen: boolean
  onClose: () => void
  certification: EmployeeCertification | null
  onApprove?: (certId: string, notes?: string) => void
  onReject?: (certId: string, reason: string) => void
}

export default function CertificationVerifyModal({
  isOpen,
  onClose,
  certification,
  onApprove,
  onReject,
}: CertificationVerifyModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [expirationVerified, setExpirationVerified] = useState(false)
  const [documentVerified, setDocumentVerified] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  if (!certification) return null

  const handleApprove = () => {
    if (onApprove) {
      onApprove(certification.id, notes || undefined)
    }
    handleClose()
  }

  const handleReject = () => {
    if (onReject && rejectReason) {
      onReject(certification.id, rejectReason)
    }
    handleClose()
  }

  const handleClose = () => {
    setAction(null)
    setNotes('')
    setRejectReason('')
    setExpirationVerified(false)
    setDocumentVerified(false)
    setZoom(100)
    setRotation(0)
    onClose()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntilExpiry = () => {
    if (!certification.expirationDate) return null
    const now = new Date()
    const expiry = new Date(certification.expirationDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry()

  const canApprove = expirationVerified && documentVerified

  const renderVerificationStep = () => (
    <div className="space-y-6">
      {/* Document Preview */}
      <div className="relative bg-gray-900 rounded-container overflow-hidden">
        {/* Toolbar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-b from-gray-900/90 to-transparent z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </button>
            <span className="text-xs text-white font-medium px-2">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors ml-2"
            >
              <RotateCw className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors">
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Document Display */}
        <div className="h-80 flex items-center justify-center overflow-hidden">
          {certification.documentUrl ? (
            <div 
              className="bg-white p-4 rounded shadow-lg transition-transform"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
            >
              {/* Placeholder for document preview */}
              <div className="w-64 h-80 bg-gray-100 flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">No document preview available</p>
            </div>
          )}
        </div>

        {/* Document Name */}
        <div className="p-3 bg-gray-800 border-t border-gray-700">
          <p className="text-sm text-white font-medium">
            {certification.documentName || 'Uploaded document'}
          </p>
          <p className="text-xs text-gray-400">
            Uploaded {certification.uploadedAt ? formatDate(certification.uploadedAt) : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Employee Info */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-element">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {certification.employeeName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{certification.employeeName}</p>
          <p className="text-xs text-text-secondary">{certification.employeeRole} · {certification.employeeLocation}</p>
        </div>
      </div>

      {/* Certification Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-border-light rounded-element">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Certification</p>
          <p className="text-sm font-medium text-text-primary mt-1">{certification.templateName}</p>
        </div>
        
        <div className={`p-4 rounded-element ${
          daysUntilExpiry && daysUntilExpiry < 30 
            ? 'bg-orange-50 border border-orange-200' 
            : 'bg-white border border-border-light'
        }`}>
          <p className="text-xs text-text-secondary uppercase tracking-wider">Expiration Date</p>
          <p className="text-sm font-medium text-text-primary mt-1">
            {formatDate(certification.expirationDate)}
          </p>
          {daysUntilExpiry !== null && (
            <p className={`text-xs mt-0.5 ${
              daysUntilExpiry < 30 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
            </p>
          )}
        </div>
      </div>

      {certification.certificateNumber && (
        <div className="p-4 bg-white border border-border-light rounded-element">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Certificate Number</p>
          <p className="text-sm font-mono font-medium text-text-primary mt-1">
            {certification.certificateNumber}
          </p>
        </div>
      )}

      {/* Verification Checklist */}
      <div className="border-t border-border-light pt-6">
        <h4 className="text-sm font-semibold text-text-primary mb-4">Verification Checklist</h4>
        
        <div className="space-y-3">
          <div 
            onClick={() => setDocumentVerified(!documentVerified)}
            className={`flex items-center gap-3 p-3 rounded-element border cursor-pointer transition-all ${
              documentVerified 
                ? 'border-green-500 bg-green-50' 
                : 'border-border-light hover:border-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              documentVerified ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {documentVerified && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Document is authentic and readable</p>
              <p className="text-xs text-text-secondary">Certificate appears valid and all text is legible</p>
            </div>
          </div>

          <div 
            onClick={() => setExpirationVerified(!expirationVerified)}
            className={`flex items-center gap-3 p-3 rounded-element border cursor-pointer transition-all ${
              expirationVerified 
                ? 'border-green-500 bg-green-50' 
                : 'border-border-light hover:border-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              expirationVerified ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {expirationVerified && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Expiration date is correct</p>
              <p className="text-xs text-text-secondary">
                Date on document matches entered date: {formatDate(certification.expirationDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderApproveStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Approve Certification</h3>
        <p className="text-sm text-text-secondary mt-1">
          You are about to approve {certification.employeeName}'s {certification.templateName}.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this verification..."
          className="w-full h-24 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setAction(null)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleApprove}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Approve
        </Button>
      </div>
    </div>
  )

  const renderRejectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Reject Certification</h3>
        <p className="text-sm text-text-secondary mt-1">
          {certification.employeeName} will be notified and asked to re-upload.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Reason for rejection <span className="text-red-500">*</span>
        </label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Explain why this certification was rejected..."
          className="w-full h-24 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Quick rejection reasons */}
      <div>
        <p className="text-xs text-text-secondary mb-2">Quick reasons:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Document not readable',
            'Expiration date mismatch',
            'Wrong document type',
            'Missing required information',
            'Document appears altered',
          ].map((reason) => (
            <button
              key={reason}
              onClick={() => setRejectReason(reason)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                rejectReason === reason
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-text-primary hover:bg-gray-200'
              }`}
            >
              {reason}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setAction(null)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleReject}
          disabled={!rejectReason}
          variant="outline"
          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
        >
          Reject
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={action ? (action === 'approve' ? 'Approve Certification' : 'Reject Certification') : 'Verify Certification'}
      size="xl"
      footer={
        !action ? (
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => setAction('reject')}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button 
                onClick={() => setAction('approve')}
                disabled={!canApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {!action && renderVerificationStep()}
      {action === 'approve' && renderApproveStep()}
      {action === 'reject' && renderRejectStep()}
    </Modal>
  )
}



