import { useState } from 'react'
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  MessageSquare,
  Award,
  Clock
} from 'lucide-react'
import Button from '../ui/Button'
import { WriteUp } from '../../data/mockData'

interface WriteUpAcknowledgementProps {
  writeUp: WriteUp
  onAcknowledge?: (response?: string) => void
  onDecline?: (reason: string) => void
  onClose?: () => void
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  'verbal-warning': { 
    icon: <AlertTriangle className="w-5 h-5" />, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50' 
  },
  'written-warning': { 
    icon: <AlertTriangle className="w-5 h-5" />, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50' 
  },
  'final-warning': { 
    icon: <AlertTriangle className="w-5 h-5" />, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50' 
  },
  'performance-improvement': { 
    icon: <FileText className="w-5 h-5" />, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50' 
  },
  'recognition': { 
    icon: <Award className="w-5 h-5" />, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50' 
  },
  'coaching': { 
    icon: <MessageSquare className="w-5 h-5" />, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50' 
  },
}

const typeLabels: Record<string, string> = {
  'verbal-warning': 'Verbal Warning',
  'written-warning': 'Written Warning',
  'final-warning': 'Final Warning',
  'performance-improvement': 'Performance Improvement Plan',
  'recognition': 'Recognition',
  'coaching': 'Coaching',
}

export default function WriteUpAcknowledgement({
  writeUp,
  onAcknowledge,
  onDecline,
  onClose,
}: WriteUpAcknowledgementProps) {
  const [step, setStep] = useState<'view' | 'respond' | 'decline'>('view')
  const [employeeResponse, setEmployeeResponse] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [hasReadDocument, setHasReadDocument] = useState(false)
  const [signature, setSignature] = useState(false)

  const config = typeConfig[writeUp.type] || typeConfig['verbal-warning']
  const isPositive = writeUp.type === 'recognition'

  const handleAcknowledge = () => {
    if (onAcknowledge) {
      onAcknowledge(employeeResponse || undefined)
    }
  }

  const handleDecline = () => {
    if (onDecline && declineReason) {
      onDecline(declineReason)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const renderViewStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-container ${config.bgColor}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor} ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${config.color} ${config.bgColor} border ${config.color.replace('text-', 'border-')}`}>
              {typeLabels[writeUp.type]}
            </span>
            <h1 className="text-xl font-bold text-text-primary mt-2">{writeUp.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(writeUp.incidentDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {writeUp.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white border border-border-light rounded-container overflow-hidden">
        {/* Issued To */}
        <div className="p-4 border-b border-border-light bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{writeUp.employeeName}</p>
              <p className="text-xs text-text-secondary">{writeUp.employeeRole} · {writeUp.employeeLocation}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            {isPositive ? 'Recognition Details' : 'Incident Description'}
          </h3>
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {writeUp.description}
          </p>
        </div>

        {/* Manager Notes */}
        {writeUp.managerNotes && (
          <div className="p-6 border-t border-border-light bg-gray-50">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Manager Notes
            </h3>
            <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
              {writeUp.managerNotes}
            </p>
          </div>
        )}

        {/* Points Warning */}
        {writeUp.points && writeUp.points > 0 && (
          <div className="p-4 border-t border-border-light">
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-element">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                This write-up adds <strong>{writeUp.points} point{writeUp.points !== 1 ? 's' : ''}</strong> to your record.
              </p>
            </div>
          </div>
        )}

        {/* Manager Signature */}
        <div className="p-4 border-t border-border-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Issued By</p>
              <p className="text-sm font-medium text-text-primary mt-1">{writeUp.managerSignature.signedBy}</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Signed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgement Checkbox */}
      <div 
        onClick={() => setHasReadDocument(!hasReadDocument)}
        className={`p-4 rounded-element border-2 cursor-pointer transition-all ${
          hasReadDocument 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
            hasReadDocument ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
          }`}>
            {hasReadDocument && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <p className="text-sm text-text-primary">
            I have read and understand the contents of this {isPositive ? 'recognition' : 'write-up'}.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light">
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
        <div className="flex items-center gap-3">
          {!isPositive && (
            <Button 
              variant="outline" 
              onClick={() => setStep('decline')}
              disabled={!hasReadDocument}
            >
              Decline to Sign
            </Button>
          )}
          <Button 
            onClick={() => setStep('respond')}
            disabled={!hasReadDocument}
          >
            {isPositive ? 'Acknowledge' : 'Acknowledge & Sign'}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderRespondStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${config.bgColor} ${config.color}`}>
          {config.icon}
        </div>
        <h2 className="text-lg font-bold text-text-primary mt-4">
          {isPositive ? 'Acknowledge Recognition' : 'Acknowledge Write-up'}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          {isPositive 
            ? 'Add a response or simply acknowledge this recognition.'
            : 'You may add a response before signing. Your signature confirms receipt, not necessarily agreement.'}
        </p>
      </div>

      {/* Response Input */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Your Response (Optional)
        </label>
        <textarea
          value={employeeResponse}
          onChange={(e) => setEmployeeResponse(e.target.value)}
          placeholder={isPositive 
            ? "Thank you for the recognition..." 
            : "Add any comments or context you'd like to include..."}
          className="w-full h-32 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Signature */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Your Signature
        </label>
        <div 
          onClick={() => setSignature(!signature)}
          className={`p-6 rounded-element border-2 border-dashed cursor-pointer transition-all ${
            signature
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {signature ? (
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-800">{writeUp.employeeName}</p>
              <p className="text-xs text-green-600 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-xs text-text-secondary mt-2">Click to remove signature</p>
            </div>
          ) : (
            <div className="text-center">
              <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">Click to sign</p>
              <p className="text-xs text-text-secondary mt-1">
                Your electronic signature will be recorded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      {!isPositive && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-element">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">What happens next?</p>
            <p className="text-xs text-blue-700 mt-1">
              Your acknowledgement confirms you have received and read this write-up. 
              It does not necessarily mean you agree with its contents. 
              You may add your perspective in the response above.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light">
        <Button variant="ghost" onClick={() => setStep('view')}>
          Back
        </Button>
        <Button onClick={handleAcknowledge} disabled={!signature}>
          Submit Acknowledgement
        </Button>
      </div>
    </div>
  )

  const renderDeclineStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-red-50">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mt-4">Decline to Sign</h2>
        <p className="text-sm text-text-secondary mt-1">
          You may decline to sign this write-up. Please provide a reason below.
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-element">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Important</p>
          <p className="text-xs text-amber-700 mt-1">
            Declining to sign does not invalidate this write-up. It will be marked as 
            "Refused to Sign" in your employee file, along with your stated reason. 
            HR will be notified of your decision.
          </p>
        </div>
      </div>

      {/* Reason Input */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Reason for Declining <span className="text-red-500">*</span>
        </label>
        <textarea
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          placeholder="Please explain why you are declining to sign this write-up..."
          className="w-full h-32 px-3 py-2 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Confirmation Checkbox */}
      <div 
        onClick={() => setSignature(!signature)}
        className={`p-4 rounded-element border-2 cursor-pointer transition-all ${
          signature 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
            signature ? 'border-red-500 bg-red-500' : 'border-gray-300'
          }`}>
            {signature && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <p className="text-sm text-text-primary">
            I understand that declining to sign does not invalidate this write-up and that 
            my decision will be recorded in my employee file.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light">
        <Button variant="ghost" onClick={() => setStep('view')}>
          Back
        </Button>
        <Button 
          variant="outline"
          onClick={handleDecline} 
          disabled={!signature || !declineReason.trim()}
          className="border-red-500 text-red-600 hover:bg-red-50"
        >
          Decline to Sign
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      {step === 'view' && renderViewStep()}
      {step === 'respond' && renderRespondStep()}
      {step === 'decline' && renderDeclineStep()}
    </div>
  )
}



