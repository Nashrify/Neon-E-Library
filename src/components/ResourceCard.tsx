import React from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText, Video, Book, File, Calendar } from 'lucide-react'
import { Resource } from '../lib/supabase'

interface ResourceCardProps {
  resource: Resource
  onDownload?: (resource: Resource) => void
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onDownload }) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />
      case 'mp4':
        return <Video className="w-6 h-6 text-blue-500" />
      case 'epub':
        return <Book className="w-6 h-6 text-green-500" />
      case 'docx':
        return <File className="w-6 h-6 text-blue-600" />
      default:
        return <File className="w-6 h-6 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'o-level':
        return 'bg-blue-100 text-blue-800'
      case 'a-level':
        return 'bg-green-100 text-green-800'
      case 'university':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'textbook':
        return 'bg-orange-100 text-orange-800'
      case 'notes':
        return 'bg-yellow-100 text-yellow-800'
      case 'exam':
        return 'bg-red-100 text-red-800'
      case 'video':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onDownload) {
      onDownload(resource)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getFileIcon(resource.file_type)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{resource.subject}</p>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(resource.level)}`}>
            {resource.level}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(resource.category)}`}>
            {resource.category}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {resource.file_type.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{new Date(resource.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Download className="w-3 h-3" />
            <span>{resource.download_count} downloads</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
        <Link
          to={`/resource/${resource.id}`}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          View Details
        </Link>
        <button
          onClick={handleDownload}
          className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  )
}

export default ResourceCard