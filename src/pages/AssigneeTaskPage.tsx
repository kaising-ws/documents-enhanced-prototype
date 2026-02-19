import { useState, useCallback } from 'react'
import {
  ArrowLeft,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Shield,
  User,
  MapPin,
  Building,
  Loader2,
  X,
  Check,
  ScanLine,
  Eye,
  PenLine,
  Lock,
  CircleDot,
  AlignLeft,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { DocumentRecipient, TemplateCategory } from '../data/mockData'

interface AssigneeTaskPageProps {
  documentName: string
  documentDescription?: string
  recipient: DocumentRecipient
  category: TemplateCategory
  onBack: () => void
}

// ── Mock manager answers (simulates what manager already filled in) ──
interface ManagerAnswer {
  fieldId: string
  label: string
  type: 'single-select' | 'open-text'
  value: string
}

const MOCK_MANAGER_ANSWERS: ManagerAnswer[] = [
  {
    fieldId: 'mgr-reason',
    label: 'Reason for write-up',
    type: 'single-select',
    value: 'Attendance / Tardiness',
  },
  {
    fieldId: 'mgr-incident-date',
    label: 'Date of incident',
    type: 'open-text',
    value: 'January 15, 2025',
  },
  {
    fieldId: 'mgr-description',
    label: 'Describe the incident or behavior',
    type: 'open-text',
    value: 'Employee was 45 minutes late to their scheduled shift on Jan 15 without calling ahead. This is the third occurrence of unexcused tardiness in the past 30 days (also late on Jan 3 and Jan 10). The team had to cover additional tables during peak lunch service.',
  },
  {
    fieldId: 'mgr-previous-warnings',
    label: 'Have there been previous verbal or written warnings for this issue?',
    type: 'single-select',
    value: 'Yes',
  },
  {
    fieldId: 'mgr-corrective-action',
    label: 'What corrective action is expected from the employee?',
    type: 'open-text',
    value: 'Employee must arrive on time for all scheduled shifts. If unable to attend, must notify the manager at least 1 hour before the shift. Any further tardiness within the next 60 days may result in escalated disciplinary action.',
  },
  {
    fieldId: 'mgr-severity',
    label: 'Severity level',
    type: 'single-select',
    value: 'Written Warning',
  },
  {
    fieldId: 'mgr-followup',
    label: 'Follow-up date or review period',
    type: 'open-text',
    value: 'March 15, 2025 — 60-day review',
  },
]

// ── Worker questions (the employee needs to answer) ──
interface WorkerQuestion {
  fieldId: string
  label: string
  type: 'single-select' | 'open-text'
  required: boolean
  options?: string[]
}

const WORKER_QUESTIONS: WorkerQuestion[] = [
  {
    fieldId: 'wkr-agree',
    label: 'Do you agree with the description of the incident above?',
    type: 'single-select',
    required: true,
    options: ['Yes', 'No'],
  },
  {
    fieldId: 'wkr-response',
    label: 'Employee comments or response',
    type: 'open-text',
    required: false,
  },
  {
    fieldId: 'wkr-improvement',
    label: 'What steps will you take to correct this issue?',
    type: 'open-text',
    required: true,
  },
  {
    fieldId: 'wkr-context',
    label: 'Is there any additional context you would like management to know?',
    type: 'open-text',
    required: false,
  },
]

/** Simulated OCR results */
interface OcrResult {
  certificateHolder: string
  certificateNumber: string
  issuingAuthority: string
  issueDate: string
  expirationDate: string
  confidence: number
}

type CertStep = 'upload' | 'review' | 'submitted'
type WriteUpStep = 'form' | 'submitted'

export default function AssigneeTaskPage({
  documentName,
  documentDescription,
  recipient,
  category,
  onBack,
}: AssigneeTaskPageProps) {
  // ── Decide which flow ──
  const isWriteUp = category === 'write-up'

  // ── Certificate state ──
  const [certStep, setCertStep] = useState<CertStep>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const [certificateHolder, setCertificateHolder] = useState('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [issuingAuthority, setIssuingAuthority] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')

  // ── Write-up state ──
  const [writeUpStep, setWriteUpStep] = useState<WriteUpStep>('form')
  const [workerAnswers, setWorkerAnswers] = useState<Record<string, string>>({})

  // Certificate helpers
  const simulateOcr = useCallback(
    (_file: File) => {
      setIsScanning(true)
      setTimeout(() => {
        const mockOcr: OcrResult = {
          certificateHolder: recipient.name,
          certificateNumber: `CH-${Math.floor(100000 + Math.random() * 900000)}`,
          issuingAuthority: 'National Food Safety Authority',
          issueDate: '2024-08-15',
          expirationDate: '2027-08-15',
          confidence: 94,
        }
        setOcrResult(mockOcr)
        setCertificateHolder(mockOcr.certificateHolder)
        setCertificateNumber(mockOcr.certificateNumber)
        setIssuingAuthority(mockOcr.issuingAuthority)
        setIssueDate(mockOcr.issueDate)
        setExpirationDate(mockOcr.expirationDate)
        setIsScanning(false)
        setCertStep('review')
      }, 2000)
    },
    [recipient.name]
  )

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    simulateOcr(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleCertSubmit = () => setCertStep('submitted')

  const handleReUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setOcrResult(null)
    setCertificateHolder('')
    setCertificateNumber('')
    setIssuingAuthority('')
    setIssueDate('')
    setExpirationDate('')
    setCertStep('upload')
  }

  // Write-up helpers
  const setWorkerAnswer = (fieldId: string, value: string) => {
    setWorkerAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }

  const isWriteUpValid = () => {
    return WORKER_QUESTIONS.filter((q) => q.required).every(
      (q) => workerAnswers[q.fieldId] && workerAnswers[q.fieldId].trim().length > 0
    )
  }

  const handleWriteUpSubmit = () => setWriteUpStep('submitted')

  // ── Shared header icon ──
  const headerIcon = isWriteUp ? (
    <PenLine className="w-6 h-6 text-amber-500" />
  ) : (
    <Shield className="w-6 h-6 text-blue-500" />
  )
  const headerBg = isWriteUp ? 'bg-amber-50' : 'bg-blue-50'

  // ── Steps for stepper ──
  const isSubmitted = isWriteUp ? writeUpStep === 'submitted' : certStep === 'submitted'
  const stepLabels = isWriteUp
    ? ['Review & Respond', 'Submitted']
    : ['Upload', 'Review & Confirm', 'Submitted']
  const currentStepIdx = isWriteUp
    ? writeUpStep === 'form'
      ? 0
      : 1
    : certStep === 'upload'
    ? 0
    : certStep === 'review'
    ? 1
    : 2

  return (
    <div className="min-h-full bg-surface-gray">
      {/* Top bar */}
      <div className="bg-white border-b border-border-light px-6 py-4">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to document
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
            <Eye className="w-3 h-3" />
            Manager preview
          </span>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto p-6 pb-20">
        {/* ─── Task Header ─── */}
        <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-lg ${headerBg} flex items-center justify-center flex-shrink-0`}
            >
              {headerIcon}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-text-primary mb-1">{documentName}</h1>
              {documentDescription && (
                <p className="text-sm text-text-secondary mb-3">{documentDescription}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {recipient.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  {recipient.role}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {recipient.location}
                </span>
              </div>
            </div>
          </div>

          {/* Progress stepper */}
          <div className="mt-6 pt-5 border-t border-border-light">
            <div className="flex items-center gap-2">
              {stepLabels.map((label, i) => {
                const isComplete = i < currentStepIdx
                const isCurrent = i === currentStepIdx
                return (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isComplete
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isComplete ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span
                        className={`text-sm font-medium whitespace-nowrap ${
                          isCurrent
                            ? 'text-text-primary'
                            : isComplete
                            ? 'text-green-600'
                            : 'text-text-secondary'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div
                        className={`h-px flex-1 ${isComplete ? 'bg-green-300' : 'bg-gray-200'}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            WRITE-UP FLOW
           ════════════════════════════════════════════════════════════════ */}
        {isWriteUp && writeUpStep === 'form' && (
          <div className="space-y-6">
            {/* ─── Manager Section (Read-only) ─── */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-border-light">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">
                      Manager's Report
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Filled by your manager — read only
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {MOCK_MANAGER_ANSWERS.map((answer) => (
                  <div key={answer.fieldId}>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
                      {answer.type === 'single-select' ? (
                        <CircleDot className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {answer.label}
                    </label>
                    {answer.type === 'single-select' ? (
                      <div className="h-10 px-3 flex items-center rounded-lg border border-border-light bg-gray-50 text-sm text-text-primary">
                        {answer.value}
                      </div>
                    ) : (
                      <div className="px-3 py-2.5 rounded-lg border border-border-light bg-gray-50 text-sm text-text-primary whitespace-pre-wrap min-h-[40px]">
                        {answer.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Worker Section (Editable) ─── */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <PenLine className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">
                      Employee Response
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Please review the above and answer the following questions
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {WORKER_QUESTIONS.map((question) => (
                  <div key={question.fieldId}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                      {question.type === 'single-select' ? (
                        <CircleDot className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      {question.label}
                      {question.required && (
                        <span className="text-red-500 text-xs">*</span>
                      )}
                    </label>

                    {question.type === 'single-select' && question.options ? (
                      <div className="flex gap-3">
                        {question.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setWorkerAnswer(question.fieldId, opt)}
                            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-all ${
                              workerAnswers[question.fieldId] === opt
                                ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                                : 'border-border-light bg-white text-text-primary hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={workerAnswers[question.fieldId] || ''}
                        onChange={(e) => setWorkerAnswer(question.fieldId, e.target.value)}
                        placeholder="Type your response..."
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[80px]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Acknowledgement info ─── */}
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                By submitting, you acknowledge that you have read the manager's report above and
                provided your response. This will be recorded as part of your employee file.
              </p>
            </div>

            {/* ─── Submit ─── */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button
                leftIcon={<Check className="w-4 h-4" />}
                onClick={handleWriteUpSubmit}
                disabled={!isWriteUpValid()}
              >
                Acknowledge & Submit
              </Button>
            </div>
          </div>
        )}

        {/* Write-up submitted */}
        {isWriteUp && writeUpStep === 'submitted' && (
          <WriteUpSubmittedView
            documentName={documentName}
            recipient={recipient}
            workerAnswers={workerAnswers}
            onBack={onBack}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            CERTIFICATE FLOW
           ════════════════════════════════════════════════════════════════ */}
        {!isWriteUp && certStep === 'upload' && !isScanning && (
          <CertUploadStep
            isDragging={isDragging}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileSelect={handleFileSelect}
          />
        )}

        {!isWriteUp && isScanning && <ScanningOverlay />}

        {!isWriteUp && certStep === 'review' && (
          <CertReviewStep
            uploadedFile={uploadedFile}
            previewUrl={previewUrl}
            ocrResult={ocrResult}
            isImageExpanded={isImageExpanded}
            setIsImageExpanded={setIsImageExpanded}
            certificateHolder={certificateHolder}
            setCertificateHolder={setCertificateHolder}
            certificateNumber={certificateNumber}
            setCertificateNumber={setCertificateNumber}
            issuingAuthority={issuingAuthority}
            setIssuingAuthority={setIssuingAuthority}
            issueDate={issueDate}
            setIssueDate={setIssueDate}
            expirationDate={expirationDate}
            setExpirationDate={setExpirationDate}
            onReUpload={handleReUpload}
            onSubmit={handleCertSubmit}
          />
        )}

        {!isWriteUp && certStep === 'submitted' && (
          <CertSubmittedView
            documentName={documentName}
            certificateHolder={certificateHolder}
            certificateNumber={certificateNumber}
            expirationDate={expirationDate}
            onBack={onBack}
          />
        )}
      </div>

      {/* Image expanded overlay */}
      {isImageExpanded && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
              onClick={() => setIsImageExpanded(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewUrl}
              alt="Certificate full view"
              className="max-h-[85vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Write-up Submitted View
// ══════════════════════════════════════════════════════════════════════════
function WriteUpSubmittedView({
  documentName,
  recipient,
  workerAnswers,
  onBack,
}: {
  documentName: string
  recipient: DocumentRecipient
  workerAnswers: Record<string, string>
  onBack: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-12 text-center">
      <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Write-Up Acknowledged</h2>
        <p className="text-sm text-text-secondary">
          Your response has been recorded. This write-up is now part of your employee file.
        </p>

        <div className="w-full mt-4 p-4 bg-gray-50 rounded-lg text-left space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Document</span>
            <span className="font-medium text-text-primary">{documentName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Employee</span>
            <span className="font-medium text-text-primary">{recipient.name}</span>
          </div>
          {WORKER_QUESTIONS.map((q) => {
            const val = workerAnswers[q.fieldId]
            if (!val) return null
            return (
              <div key={q.fieldId} className="text-sm">
                <span className="text-text-secondary block mb-0.5">{q.label}</span>
                <span className="font-medium text-text-primary">{val}</span>
              </div>
            )
          })}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border-light">
            <span className="text-text-secondary">Status</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Acknowledged
            </span>
          </div>
        </div>

        <Button variant="outline" onClick={onBack} className="mt-4">
          Back to document
        </Button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Certificate Upload Step
// ══════════════════════════════════════════════════════════════════════════
function CertUploadStep({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}: {
  isDragging: boolean
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onFileSelect: (file: File) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-6">
      <h2 className="text-base font-semibold text-text-primary mb-1">Upload your certificate</h2>
      <p className="text-sm text-text-secondary mb-6">
        Take a photo or upload an image of your certificate. We'll automatically extract the key
        information from it.
      </p>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Drag and drop your certificate here
            </p>
            <p className="text-xs text-text-secondary">PNG, JPG, or PDF up to 10MB</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onFileSelect(file)
                }}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                <Upload className="w-4 h-4" />
                Browse files
              </span>
            </label>
            <span className="text-xs text-text-secondary">or</span>
            <button
              type="button"
              onClick={() => {
                const mockFile = new File(['mock-image'], 'camera-capture.jpg', {
                  type: 'image/jpeg',
                })
                onFileSelect(mockFile)
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Take photo
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800 space-y-0.5">
          <p className="font-medium">Tips for best results:</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-700">
            <li>Make sure the entire document is visible and in focus</li>
            <li>Avoid glare and shadows on the document</li>
            <li>The expiration date should be clearly readable</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Scanning Overlay
// ══════════════════════════════════════════════════════════════════════════
function ScanningOverlay() {
  return (
    <div className="bg-white rounded-xl border border-border-light p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-primary-50 flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-primary-500 animate-pulse" />
          </div>
          <Loader2 className="absolute -top-1 -right-1 w-6 h-6 text-primary-500 animate-spin" />
        </div>
        <div>
          <p className="text-base font-semibold text-text-primary mb-1">
            Scanning your document...
          </p>
          <p className="text-sm text-text-secondary">
            Extracting certificate details and expiration date via OCR
          </p>
        </div>
        <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full animate-pulse"
            style={{ width: '60%' }}
          />
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Certificate Review Step
// ══════════════════════════════════════════════════════════════════════════
function CertReviewStep({
  uploadedFile,
  previewUrl,
  ocrResult,
  isImageExpanded,
  setIsImageExpanded,
  certificateHolder,
  setCertificateHolder,
  certificateNumber,
  setCertificateNumber,
  issuingAuthority,
  setIssuingAuthority,
  issueDate,
  setIssueDate,
  expirationDate,
  setExpirationDate,
  onReUpload,
  onSubmit,
}: {
  uploadedFile: File | null
  previewUrl: string | null
  ocrResult: OcrResult | null
  isImageExpanded: boolean
  setIsImageExpanded: (v: boolean) => void
  certificateHolder: string
  setCertificateHolder: (v: string) => void
  certificateNumber: string
  setCertificateNumber: (v: string) => void
  issuingAuthority: string
  setIssuingAuthority: (v: string) => void
  issueDate: string
  setIssueDate: (v: string) => void
  expirationDate: string
  setExpirationDate: (v: string) => void
  onReUpload: () => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Document preview */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Uploaded Document</h2>
          <Button variant="ghost" size="sm" onClick={onReUpload}>
            Re-upload
          </Button>
        </div>
        <div className="relative">
          <div
            className="border border-border-light rounded-lg bg-gray-50 overflow-hidden cursor-pointer"
            onClick={() => setIsImageExpanded(!isImageExpanded)}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded certificate"
                className={`w-full object-contain transition-all ${
                  isImageExpanded ? 'max-h-[600px]' : 'max-h-[200px]'
                }`}
              />
            ) : (
              <div
                className={`w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 transition-all ${
                  isImageExpanded ? 'h-[500px]' : 'h-[200px]'
                }`}
              >
                <FileText className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-500">
                  {uploadedFile?.name || 'certificate.jpg'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Click to expand</p>
              </div>
            )}
          </div>
          {ocrResult && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              <ScanLine className="w-3 h-3" />
              {ocrResult.confidence}% confidence
            </div>
          )}
        </div>
      </div>

      {/* Extracted fields */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Extracted Information</h2>
            <p className="text-xs text-text-secondary">
              Please verify the information below is correct. Edit any fields if needed.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="Certificate Holder"
            value={certificateHolder}
            onChange={setCertificateHolder}
            icon={<User className="w-4 h-4 text-gray-400" />}
            ocrDetected
          />
          <FieldInput
            label="Certificate Number"
            value={certificateNumber}
            onChange={setCertificateNumber}
            icon={<FileText className="w-4 h-4 text-gray-400" />}
            ocrDetected
          />
          <FieldInput
            label="Issuing Authority"
            value={issuingAuthority}
            onChange={setIssuingAuthority}
            icon={<Building className="w-4 h-4 text-gray-400" />}
            ocrDetected
          />
          <FieldInput
            label="Issue Date"
            value={issueDate}
            onChange={setIssueDate}
            type="date"
            icon={<Calendar className="w-4 h-4 text-gray-400" />}
            ocrDetected
          />
          <div className="col-span-2">
            <FieldInput
              label="Expiration Date"
              value={expirationDate}
              onChange={setExpirationDate}
              type="date"
              icon={<Calendar className="w-4 h-4 text-gray-400" />}
              ocrDetected
              highlighted
            />
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            These fields were auto-filled by scanning your document. Please double-check that all
            information is accurate before submitting. Your manager will verify the submission.
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-border-light p-6">
        <p className="text-sm text-text-secondary">
          By submitting, you confirm that the above information is accurate.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onReUpload}>
            Start Over
          </Button>
          <Button
            leftIcon={<Check className="w-4 h-4" />}
            onClick={onSubmit}
            disabled={!certificateHolder || !expirationDate}
          >
            Confirm & Submit
          </Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Certificate Submitted View
// ══════════════════════════════════════════════════════════════════════════
function CertSubmittedView({
  documentName,
  certificateHolder,
  certificateNumber,
  expirationDate,
  onBack,
}: {
  documentName: string
  certificateHolder: string
  certificateNumber: string
  expirationDate: string
  onBack: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-12 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Certificate Submitted!</h2>
        <p className="text-sm text-text-secondary">
          Your certificate has been submitted for manager verification. You'll be notified once it's
          been reviewed and approved.
        </p>
        <div className="w-full mt-4 p-4 bg-gray-50 rounded-lg text-left space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Document</span>
            <span className="font-medium text-text-primary">{documentName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Holder</span>
            <span className="font-medium text-text-primary">{certificateHolder}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Certificate #</span>
            <span className="font-medium text-text-primary">{certificateNumber}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Expiration</span>
            <span className="font-medium text-text-primary">{expirationDate}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Status</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-purple-600">
              <Loader2 className="w-3 h-3" />
              Pending verification
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Back to document
        </Button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Field Input Component (for certificates)
// ══════════════════════════════════════════════════════════════════════════
function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  ocrDetected,
  highlighted,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  type?: 'text' | 'date'
  icon?: React.ReactNode
  ocrDetected?: boolean
  highlighted?: boolean
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
        {icon}
        {label}
        {ocrDetected && (
          <span className="ml-auto text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            OCR
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-10 px-3 rounded-lg border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          highlighted ? 'border-green-300 bg-green-50/50' : 'border-border bg-white'
        }`}
      />
    </div>
  )
}
