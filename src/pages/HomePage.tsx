import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Book, Search, Download, Users, ArrowRight, FileText, Video, BookOpen } from 'lucide-react'
import { supabase, Resource } from '../lib/supabase'
import ResourceCard from '../components/ResourceCard'

const HomePage: React.FC = () => {
  const [recentResources, setRecentResources] = useState<Resource[]>([])
  const [stats, setStats] = useState({
    totalResources: 0,
    totalDownloads: 0,
    subjects: 0
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRecentResources()
    fetchStats()
  }, [])

  const fetchRecentResources = async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching recent resources:', error)
    } else {
      setRecentResources(data || [])
    }
  }

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('download_count, subject')

    if (error) {
      console.error('Error fetching stats:', error)
    } else {
      const totalResources = data?.length || 0
      const totalDownloads = data?.reduce((sum, resource) => sum + resource.download_count, 0) || 0
      const subjects = new Set(data?.map(resource => resource.subject)).size

      setStats({
        totalResources,
        totalDownloads,
        subjects
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/library?search=${encodeURIComponent(searchTerm)}`
    }
  }

  const handleDownload = async (resource: Resource) => {
    // Increment download count
    const { error } = await supabase
      .from('resources')
      .update({ download_count: resource.download_count + 1 })
      .eq('id', resource.id)

    if (error) {
      console.error('Error updating download count:', error)
    }

    // Open download link
    window.open(resource.file_url, '_blank')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Neon-Library
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Your free digital library for educational resources
            </p>
            <p className="text-lg mb-12 text-indigo-200 max-w-2xl mx-auto">
              Access thousands of textbooks, notes, past papers, and videos completely free. 
              No sign-up required, no subscriptions, just pure learning resources.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for textbooks, notes, videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/library"
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Book className="w-5 h-5" />
                <span>Browse Library</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#recent"
                className="flex items-center justify-center space-x-2 px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Recent Uploads</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <BookOpen className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalResources.toLocaleString()}
              </h3>
              <p className="text-gray-600">Resources Available</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Download className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalDownloads.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Downloads</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.subjects}
              </h3>
              <p className="text-gray-600">Subjects Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Neon-Library?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for your educational journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Free Access
              </h3>
              <p className="text-gray-600">
                All resources are completely free. No registration, no subscriptions, no hidden fees.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <Video className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600">
                Access content in various formats including PDFs, videos, EPUB books, and documents.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <Search className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Search
              </h3>
              <p className="text-gray-600">
                Find exactly what you need with powerful search and filtering options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Resources */}
      <section id="recent" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recently Added
            </h2>
            <p className="text-xl text-gray-600">
              Discover the latest educational resources
            </p>
          </div>

          {recentResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentResources.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No resources available yet. Check back soon!
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/library"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              <span>View All Resources</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage