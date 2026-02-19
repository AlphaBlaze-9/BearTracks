import { Tag, Eye, Camera, Trash2, ChevronUp } from 'lucide-react'

export function TagIcon({ className = 'h-5 w-5' }) {
  return <Tag className={className} />
}

export function EyeIcon({ className = 'h-5 w-5' }) {
  return <Eye className={className} />
}

export function CameraIcon({ className = 'h-5 w-5' }) {
  return <Camera className={className} />
}

export function TrashIcon({ className = 'h-5 w-5' }) {
  return <Trash2 className={className} />
}

export function ChevronUpIcon({ className = 'h-5 w-5' }) {
  return <ChevronUp className={className} />
}
