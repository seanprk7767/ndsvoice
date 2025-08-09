import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Plus, Filter, Search, BarChart3, RefreshCw, Users, Database, Key, UserCheck, TrendingUp, Menu, X, Upload, CheckCircle, Clock, Check, Loader2, XCircle } from 'lucide-react';

// ===============================================
// === 1. MOCK DATA AND TYPES ====================
// ===============================================

// Define the types used in the application
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface Submission {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'complaint' | 'suggestion' | 'idea';
  status: 'pending' | 'in-review' | 'resolved' | 'rejected';
  submittedAt: Date;
}

// Mock authenticated user (can be changed to 'member')
const mockUser: User = {
  id: 'user-123',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  role: 'admin', // Change to 'member' to see the member view
};

// Mock submission data
const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    userId: 'user-123',
    title: 'Improve cafeteria food options',
    description: 'The current menu is repetitive. A suggestion to add more healthy and diverse food choices.',
    type: 'suggestion',
    status: 'resolved',
    submittedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'sub-2',
    userId: 'user-456',
    title: 'Bug in the HR portal',
    description: 'The vacation request feature is not working correctly, often resulting in an error.',
    type: 'complaint',
    status: 'in-review',
    submittedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'sub-3',
    userId: 'user-123',
    title: 'New project management tool idea',
    description: 'Proposing a new tool that could streamline project workflows and team collaboration.',
    type: 'idea',
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: 'sub-4',
    userId: 'user-789',
    title: 'Broken chair in meeting room C',
    description: 'The chair has a loose leg and is a safety hazard.',
    type: 'complaint',
    status: 'rejected',
    submittedAt: new Date(Date.now() - 86400000 * 10),
  },
];

// ===============================================
// === 2. CONTEXTS AND CUSTOM HOOKS ==============
// ===============================================

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// App Context
interface AppContextType {
  submissions: Submission[];
  loadSubmissions: () => void;
  addSubmission: (submission: Submission) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// ===============================================
// === 3. MODAL COMPONENT ========================
// ===============================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// === 4. COMPONENT STUBS ========================
// ===============================================

interface SubmissionCardProps {
  submission: Submission;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  const getStatusClasses = (status: Submission['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Submission['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-review': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Check className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeClasses = (type: Submission['type']) => {
    switch (type) {
      case 'complaint': return 'bg-red-500';
      case 'suggestion': return 'bg-blue-500';
      case 'idea': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-full ${getTypeClasses(submission.type)}`}>
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(submission.status)}`}>
            {getStatusIcon(submission.status)}
            <span className="ml-2">{submission.status}</span>
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            {submission.type}
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{submission.title}</h3>
      <p className="text-gray-600 mb-4">{submission.description}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {submission.userId}
        </p>
        <p>
          {submission.submittedAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

interface NewSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewSubmissionForm: React.FC<NewSubmissionFormProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'complaint' | 'suggestion' | 'idea'>('complaint');
  const { addSubmission } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      userId: mockUser.id, // Using mock user ID
      title,
      description,
      type,
      status: 'pending',
      submittedAt: new Date(),
    };
    addSubmission(newSubmission);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Submission">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 mt-1 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 mt-1 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-4 py-3 mt-1 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="idea">Idea</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface AudioFileUploadProps {
  userId: string;
  onFileUpload: (file: File) => void;
  onSaveToDatabase: (audioData: any) => Promise<void>;
  maxFileSize: number; // in MB
  acceptedFormats: string[];
}

const AudioFileUpload: React.FC<AudioFileUploadProps> = ({ userId, onFileUpload, onSaveToDatabase, maxFileSize, acceptedFormats }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size / 1024 / 1024 > maxFileSize) {
        setUploadMessage(`Error: File size exceeds ${maxFileSize}MB.`);
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage('Please select a file first.');
      return;
    }
    setIsUploading(true);
    setUploadMessage('Uploading...');
    try {
      // Simulate file upload and saving to a database
      onFileUpload(file);
      await onSaveToDatabase({ name: file.name, userId, size: file.size });
      setUploadMessage('Upload successful!');
      setFile(null);
    } catch (error) {
      setUploadMessage('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h4 className="text-lg font-bold text-gray-800 mb-4">Audio File Upload</h4>
      <p className="text-gray-600 mb-4">Upload your audio files here. Max size: {maxFileSize}MB.</p>
      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-center gap-2 px-4 py-3 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
          <Upload className="w-4 h-4" />
          Choose File
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {file && (
          <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="flex items-center justify-center gap-2 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Audio'
          )}
        </button>
      </div>
      {uploadMessage && (
        <p className={`mt-4 text-center text-sm ${uploadMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {uploadMessage}
        </p>
      )}
    </div>
  );
};


const UserManagement: React.FC = () => (
  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 text-center">
    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
    <p className="mt-2 text-gray-600">This is where you would manage user accounts, roles, and permissions.</p>
  </div>
);

const DatabaseView: React.FC = () => (
  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 text-center">
    <h2 className="text-2xl font-bold text-gray-800">Database View</h2>
    <p className="mt-2 text-gray-600">This is a placeholder for viewing and exporting raw database data.</p>
  </div>
);

const TokenManagement: React.FC = () => (
  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 text-center">
    <h2 className="text-2xl font-bold text-gray-800">Token Management</h2>
    <p className="mt-2 text-gray-600">This section is for managing authentication and API tokens.</p>
  </div>
);

const StaffProfileManager: React.FC = () => (
  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 text-center">
    <h2 className="text-2xl font-bold text-gray-800">Staff Profile Manager</h2>
    <p className="mt-2 text-gray-600">This is where you would manage staff member profiles and information.</p>
  </div>
);

// ===============================================
// === 5. THE DASHBOARD COMPONENT (USER'S CODE) ==
// ===============================================

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { submissions, loadSubmissions, isLoading, addSubmission } = useApp();
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'database' | 'tokens' | 'staff' | 'audioUpload'>('submissions');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filter and sort submissions
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

  // Calculate statistics
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
    { id: 'audioUpload', label: 'Audio Upload', icon: Upload, description: 'Upload audio files' }
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
      case 'audioUpload':
        return (
          <AudioFileUpload
            userId={user?.id || 'guest'}
            onFileUpload={(file) => console.log('File uploaded:', file.name)}
            onSaveToDatabase={async (data) => console.log('Saving to DB:', data)}
            maxFileSize={10}
            acceptedFormats={['.mp3', '.wav', '.ogg']}
          />
        );
      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-full">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-semibold text-gray-800">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Review</p>
                    <p className="text-2xl font-semibold text-gray-800">{stats.inReview}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full">
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
                  className="flex items-center gap-2 px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  New Submission
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 bg-white rounded-xl shadow-md mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="complaint">Complaints</option>
                    <option value="suggestion">Suggestions</option>
                    <option value="idea">Ideas</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="text-center py-12 p-6 bg-white rounded-xl shadow-md">
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
                        className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Main container. `flex-col` for mobile (stacking sidebar on top) and `lg:flex-row` for larger screens (sidebar on the left). */}
      <div className="flex flex-col lg:flex-row">
        {/* Admin Sidebar (Desktop) */}
        {user?.role === 'admin' && (
          <aside className="w-full lg:w-80 lg:shrink-0 bg-white shadow-lg lg:shadow-none p-6 space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
              <p className="text-sm text-gray-600 mt-1">System Management</p>
            </div>
            <div className="p-4 space-y-2">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-500 text-white'
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
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Admin Menu Toggle (Mobile) */}
          {user?.role === 'admin' && (
            <div className="flex justify-end lg:hidden mb-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 bg-white rounded-lg shadow-md"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}

          {/* Admin Menu (Mobile) */}
          {user?.role === 'admin' && sidebarOpen && (
            <div className="lg:hidden p-4 bg-white shadow-lg rounded-xl mb-4">
              <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-3">Admin Menu</h2>
              <div className="space-y-2">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-500 text-white'
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
            </div>
          )}

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// === 6. MAIN APP COMPONENT =====================
// ===============================================

export default function App() {
  const [user, setUser] = useState<User | null>(mockUser);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading submissions from a database
  const loadSubmissions = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setIsLoading(false);
    }, 1500); // Simulate network delay
  };

  const addSubmission = (newSubmission: Submission) => {
    setSubmissions(prev => [newSubmission, ...prev]);
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    login: async () => {}, // Placeholder for a real login function
    logout: async () => setUser(null), // Placeholder for a real logout function
  }), [user]);

  const appStateContextValue = useMemo(() => ({
    submissions,
    loadSubmissions,
    addSubmission,
    isLoading,
  }), [submissions, isLoading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <AppContext.Provider value={appStateContextValue}>
        <Dashboard />
      </AppContext.Provider>
    </AuthContext.Provider>
  );
}
