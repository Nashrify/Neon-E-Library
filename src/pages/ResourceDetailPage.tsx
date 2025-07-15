import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Calendar, Eye, FileText, Video, Book, File, AlertCircle } from 'lucide-react'
import { supabase, Resource } from '../lib/supabase'

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchResource(id)
    }
  }, [id])

  const fetchResource = async (resourceId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single()

      if (error) {
        throw error
      }

      setResource(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resource not found')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!resource) return

    try {
      // Increment download count
      const { error } = await supabase
        .from('resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id)

      if (error) {
        throw error
      }

      // Update local state
      setResource(prev => 
        prev ? { ...prev, download_count: prev.download_count + 1 } : null
      )

      // Open download link
      window.open(resource.file_url, '_blank')
    } catch (err) {
      console.error('Error downloading resource:', err)
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />
      case 'mp4':
        return <Video className="w-8 h-8 text-blue-500" />
      case 'epub':
        return <Book className="w-8 h-8 text-green-500" />
      case 'docx':
        return <File className="w-8 h-8 text-blue-600" />
      default:
        return <File className="w-8 h-8 text-gray-500" />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resource...</p>
        </div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resource Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested resource could not be found.'}</p>
          <Link
            to="/library"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/library"
          className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>

        {/* Resource Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-start space-x-4 mb-6">
              {getFileIcon(resource.file_type)}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {resource.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {resource.subject}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLevelColor(resource.level)}`}>
                    {resource.level}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(resource.category)}`}>
                    {resource.category}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                    {resource.file_type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {resource.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Added</p>
                <p className="font-semibold text-gray-900">
                  {new Date(resource.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Download className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="font-semibold text-gray-900">
                  {resource.download_count.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Eye className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Format</p>
                <p className="font-semibold text-gray-900">
                  {resource.file_type.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                <Download className="w-5 h-5" />
                <span>Download Resource</span>
              </button>
              
              {resource.file_type === 'pdf' && (
                <button
                  onClick={() => window.open(resource.file_url, '_blank')}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
                >
                  <Eye className="w-5 h-5" />
                  <span>Preview PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetailPage