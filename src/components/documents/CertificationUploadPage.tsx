import { useState } from 'react'
import { 
  Upload, 
  FileText, 
  X, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Camera,
  Image,
  Info,
  ChevronRight
} from 'lucide-react'
import Button from '../ui/Button'

interface CertificationRequest {
  id: string
  templateName: string
  category: string
  description?: string
  instructions?: string
  expirationRequired: boolean
  requestedBy: string
  requestedAt: string
}

interface CertificationUploadPageProps {
  request: CertificationRequest
  employeeName?: string
  onSubmit?: (data: UploadSubmission) => void
  onCancel?: () => void
}

interface UploadSubmission {
  file: File
  expirationDate?: string
  certificateNumber?: string
}

export default function CertificationUploadPage({
  request,
  employeeName = 'Employee',
  onSubmit,
  onCancel,
}: CertificationUploadPageProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [expirationDate, setExpirationDate] = useState('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [step, setStep] = useState<'upload' | 'details' | 'review'>('upload')

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    setUploadedFile(file)
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = () => {
    if (!uploadedFile) return
    
    if (onSubmit) {
      onSubmit({
        file: uploadedFile,
        expirationDate: request.expirationRequired ? expirationDate : undefined,
        certificateNumber: certificateNumber || undefined,
      })
    }
  }

  const isFormValid = () => {
    if (!uploadedFile) return false
    if (request.expirationRequired && !expirationDate) return false
    return true
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Instructions */}
      {request.instructions && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-element">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Instructions</p>
            <p className="text-sm text-blue-700 mt-1">{request.instructions}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-container transition-colors
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploadedFile ? 'p-4' : 'p-12'}
        `}
      >
        {uploadedFile ? (
          <div className="flex items-start gap-4">
            {/* Preview */}
            {previewUrl ? (
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {formatFileSize(uploadedFile.size)} · {uploadedFile.type || 'Unknown type'}
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFile}
                >
                  Remove
                </Button>
                <label className="cursor-pointer">
                  <Button variant="ghost" size="sm" as="span">
                    Replace
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Drag and drop your file here
            </p>
            <p className="text-xs text-text-secondary mb-4">
              or click to browse
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <label className="cursor-pointer">
                <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />} as="span">
                  Upload File
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </label>
              
              <label className="cursor-pointer">
                <Button variant="outline" leftIcon={<Camera className="w-4 h-4" />} as="span">
                  Take Photo
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
            
            <p className="text-xs text-text-placeholder mt-4">
              Supports PDF, JPG, PNG (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      {uploadedFile && (
        <Button
          className="w-full"
          onClick={() => setStep('details')}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Continue
        </Button>
      )}
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-6">
      {/* File Preview */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-element">
        {previewUrl ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">
            {uploadedFile?.name}
          </p>
          <p className="text-xs text-text-secondary">
            {uploadedFile && formatFileSize(uploadedFile.size)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
          Change
        </Button>
      </div>

      {/* Expiration Date */}
      {request.expirationRequired && (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 pr-10 rounded-element border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-text-secondary mt-1.5">
            Enter the expiration date shown on your certificate
          </p>
        </div>
      )}

      {/* Certificate Number */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Certificate Number (optional)
        </label>
        <input
          type="text"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
          placeholder="e.g., FH-2024-12345"
          className="w-full h-10 px-3 rounded-element border border-border bg-white text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-text-secondary mt-1.5">
          If your certificate has an ID number, enter it here
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4">
        <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={() => setStep('review')} 
          disabled={!isFormValid()}
          className="flex-1"
        >
          Review
        </Button>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gray-50 rounded-container border border-border-light overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <h3 className="text-sm font-semibold text-text-primary">Review Your Submission</h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* File */}
          <div className="flex items-start gap-4">
            {previewUrl ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <FileText className="w-10 h-10 text-gray-500" />
              </div>
            )}
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Document</p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {uploadedFile?.name}
              </p>
              <p className="text-xs text-text-secondary">
                {uploadedFile && formatFileSize(uploadedFile.size)}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light">
            {request.expirationRequired && expirationDate && (
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Expiration Date</p>
                <p className="text-sm font-medium text-text-primary mt-1">
                  {formatDate(expirationDate)}
                </p>
              </div>
            )}
            {certificateNumber && (
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Certificate Number</p>
                <p className="text-sm font-medium text-text-primary mt-1">
                  {certificateNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-element">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Before you submit</p>
          <ul className="text-xs text-amber-700 mt-1 space-y-1">
            <li>• Make sure the document is clearly readable</li>
            <li>• Check that the expiration date matches what's on your certificate</li>
            <li>• Your manager will review and verify this submission</li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4">
        <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          className="flex-1"
        >
          Submit for Review
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{request.templateName}</h1>
            <p className="text-sm text-text-secondary">
              Requested by {request.requestedBy} · {formatDate(request.requestedAt)}
            </p>
          </div>
        </div>
        
        {request.description && (
          <p className="text-sm text-text-secondary">{request.description}</p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['upload', 'details', 'review'].map((s, index) => {
          const stepIndex = ['upload', 'details', 'review'].indexOf(step)
          const isActive = s === step
          const isComplete = index < stepIndex
          
          return (
            <div key={s} className="flex items-center flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isActive ? 'bg-primary-500 text-white' : isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  isComplete ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-between mb-8 text-xs text-text-secondary">
        <span className={step === 'upload' ? 'text-primary-600 font-medium' : ''}>Upload</span>
        <span className={step === 'details' ? 'text-primary-600 font-medium' : ''}>Details</span>
        <span className={step === 'review' ? 'text-primary-600 font-medium' : ''}>Review</span>
      </div>

      {/* Step Content */}
      {step === 'upload' && renderUploadStep()}
      {step === 'details' && renderDetailsStep()}
      {step === 'review' && renderReviewStep()}

      {/* Cancel */}
      {onCancel && (
        <div className="mt-8 text-center">
          <button
            onClick={onCancel}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}



