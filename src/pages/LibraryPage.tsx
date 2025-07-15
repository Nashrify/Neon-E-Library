import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Library, AlertCircle } from 'lucide-react'
import { supabase, Resource } from '../lib/supabase'
import ResourceCard from '../components/ResourceCard'
import SearchFilter from '../components/SearchFilter'

const LibraryPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  useEffect(() => {
    fetchResources()
  }, [searchTerm, selectedSubject, selectedLevel, selectedCategory])

  const fetchResources = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`)
      }

      // Apply subject filter
      if (selectedSubject !== 'All Subjects') {
        query = query.eq('subject', selectedSubject)
      }

      // Apply level filter
      if (selectedLevel !== 'All Levels') {
        query = query.eq('level', selectedLevel)
      }

      // Apply category filter
      if (selectedCategory !== 'All Categories') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setResources(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (resource: Resource) => {
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
      setResources(prevResources =>
        prevResources.map(r =>
          r.id === resource.id
            ? { ...r, download_count: r.download_count + 1 }
            : r
        )
      )

      // Open download link
      window.open(resource.file_url, '_blank')
    } catch (err) {
      console.error('Error downloading resource:', err)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSubject('All Subjects')
    setSelectedLevel('All Levels')
    setSelectedCategory('All Categories')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Library className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Digital Library
          </h1>
          <p className="text-xl text-gray-600">
            Browse and download educational resources for free
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {loading ? 'Loading...' : `${resources.length} Resources Found`}
            </h2>
            {(searchTerm || selectedSubject !== 'All Subjects' || selectedLevel !== 'All Levels' || selectedCategory !== 'All Categories') && (
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-700 text-sm mt-1"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex space-x-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Resources Grid */}
        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && resources.length === 0 && (
          <div className="text-center py-12">
            <Library className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LibraryPage