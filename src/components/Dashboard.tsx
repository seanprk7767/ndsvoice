import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search, BarChart3, RefreshCw, Users, Database, Key, UserCheck, TrendingUp, Menu, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import SubmissionCard from './SubmissionCard';
import NewSubmissionForm from './NewSubmissionForm';
import AudioFileUpload from './AudioFileUpload';
import UserManagement from './UserManagement';
import DatabaseView from './DatabaseView';
import TokenManagement from './TokenManagement';
import StaffProfileManager from './StaffProfileManager';
import { Submission } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { submissions, loadSubmissions, isLoading } = useApp();
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'database' | 'tokens' | 'staff'>('submissions');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAudioUpload, setShowAudioUpload] = useState(false);

  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    return filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }, [submissions, searchTerm, filterType, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      inReview: submissions.filter(s => s.status === 'in-review').length,
      resolved: submissions.filter(s => s.status === 'resolved').length,
    };
  }, [submissions]);

  const handleRefresh = () => {
    loadSubmissions();
  };

  const adminMenuItems = [
    { id: 'submissions', label: 'Submissions', icon: BarChart3, description: 'Manage all submissions' },
    { id: 'users', label: 'Users', icon: Users, description: 'User management' },
    { id: 'staff', label: 'Staff Profiles', icon: UserCheck, description: 'Staff information' },
    { id: 'tokens', label: 'Tokens', icon: Key, description: 'Authentication tokens' },
    { id: 'database', label: 'Database', icon: Database, description: 'View & export data' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'database':
        return <DatabaseView />;
      case 'tokens':
        return <TokenManagement />;
      case 'staff':
        return <StaffProfileManager />;
      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="stats-card-3d p-6">
                <div className="flex items-center">
                  <div className="p-3 icon-3d">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="stats-card-3d p-6">
                <div className="flex items-center">
                  <div className="p-3 icon-3d">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-semibold text-gray-800">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="stats-card-3d p-6">
                <div className="flex items-center">
                  <div className="p-3 icon-3d">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Review</p>
                    <p className="text-2xl font-semibold text-gray-800">{stats.inReview}</p>
                  </div>
                </div>
              </div>

              <div className="stats-card-3d p-6">
                <div className="flex items-center">
                  <div className="p-3 icon-3d">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-semibold text-gray-800">{stats.resolved}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {user?.role === 'admin' ? 'All Submissions' : 'My Submissions'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.role === 'admin' 
                    ? 'Manage all staff complaints, suggestions, and ideas' 
                    : 'Track your complaints, suggestions, and ideas'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="button-3d flex items-center gap-2 px-4 py-2 text-white disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="button-3d flex items-center gap-2 px-4 py-2 text-white"
                >
                  <Plus className="w-4 h-4" />
                  New Submission
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="card-3d p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 input-3d text-gray-800 placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 input-3d text-gray-800 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="complaint">Complaints</option>
                    <option value="suggestion">Suggestions</option>
                    <option value="idea">Ideas</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 input-3d text-gray-800 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading submissions...</p>
              </div>
            )}

            {/* Submissions List */}
            {!isLoading && (
              <div className="space-y-6">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No submissions found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Get started by creating your first submission'}
                    </p>
                    {(!searchTerm && filterType === 'all' && filterStatus === 'all') && (
                      <button
                        onClick={() => setShowNewForm(true)}
                        className="button-3d inline-flex items-center gap-2 px-4 py-2 text-white"
                      >
                        <Plus className="w-4 h-4" />
                        Create Submission
                      </button>
                    )}
                  </div>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))
                )}
              </div>
            )}

            <NewSubmissionForm 
              isOpen={showNewForm} 
              onClose={() => setShowNewForm(false)} 
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen container-3d relative">
      {/* Fashion-inspired floating accents */}
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      
      {/* Admin Sidebar Toggle Button */}
      {user?.role === 'admin' && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-4 z-40 button-3d p-3 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          title="Open Admin Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Admin Sidebar Overlay */}
      {user?.role === 'admin' && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      {user?.role === 'admin' && (
        <div className={`fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-lg border-r border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
                <p className="text-sm text-gray-600 mt-1">System Management</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {user?.role === 'member' && (
                <button
                  onClick={() => setShowAudioUpload(!showAudioUpload)}
                  className="button-3d flex items-center gap-2 px-4 py-2 text-white"
                >
                  <Upload className="w-4 h-4" />
                  Audio Files
                </button>
              )}
            </div>
          </div>

          {/* Audio Upload Section for Members */}
          {user?.role === 'member' && showAudioUpload && (
            <div className="mb-8">
              <AudioFileUpload
                userId={user.id}
                onFileUpload={(file) => {
                  console.log('Audio file uploaded:', file.name, file.size);
                }}
                onSaveToDatabase={async (audioData) => {
                  // Here you could save to your database
                  console.log('Saving audio to database:', audioData);
                  // Simulate API call
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }}
                maxFileSize={25} // 25MB limit
                acceptedFormats={['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac', '.webm']}
              />
            </div>
          )}

          {/* Sidebar Navigation */}
          <div className="p-4 space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50/80">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Active: <span className="font-medium text-gray-700">
                  {adminMenuItems.find(item => item.id === activeTab)?.label}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${user?.role === 'admin' ? 'pl-4' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
