import React, { useState, useEffect } from 'react';
import { Database, Users, FileText, Download, RefreshCw, Search, Cloud } from 'lucide-react';
import { User, Submission } from '../types';
import { UserService } from '../services/userService';
import { SubmissionService } from '../services/submissionService';

const DatabaseView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTable, setActiveTable] = useState<'users' | 'submissions'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load users
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);

      // Load submissions
      const submissionsData = await SubmissionService.getAllSubmissions();
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (type: 'users' | 'submissions') => {
    const data = type === 'users' ? users : submissions;
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nds-${type}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nationalId.includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const renderUsersTable = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                  {user.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.nationalId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubmissionsTable = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                  {submission.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                  {submission.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                    submission.type === 'complaint' ? 'bg-red-100 text-red-800' :
                    submission.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {submission.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    submission.status === 'in-review' ? 'bg-blue-100 text-blue-800' :
                    submission.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {submission.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    submission.priority === 'high' ? 'bg-red-100 text-red-800' :
                    submission.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {submission.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getUserName(submission.submittedBy)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.submittedAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database View</h2>
          <p className="text-gray-600">View and export all system data</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => exportData(activeTable)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Export {activeTable}
          </button>
        </div>
      </div>

      {/* Firebase Integration Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Cloud className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Supabase Database</h3>
            <p className="text-blue-800 text-sm mb-3">
              All data is stored in <strong>Supabase</strong> - a PostgreSQL cloud database with real-time synchronization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="font-medium text-blue-900">✓ Cloud Features:</p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• Real-time data synchronization</li>
                  <li>• Automatic scaling and backup</li>
                  <li>• Multi-region availability</li>
                  <li>• Built-in security rules</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="font-medium text-blue-900">Database Tables:</p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• <strong>users</strong> - User accounts and roles</li>
                  <li>• <strong>submissions</strong> - All user submissions</li>
                  <li>• <strong>auth_tokens</strong> - Authentication tokens</li>
                  <li>• Automatic indexing and queries</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              <p className="text-xs text-gray-500">
                {users.filter(u => u.role === 'admin').length} admins, {users.filter(u => u.role === 'member').length} members
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
              <p className="text-xs text-gray-500">
                {submissions.filter(s => s.status === 'pending').length} pending, {submissions.filter(s => s.status === 'resolved').length} resolved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTable('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTable === 'users'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTable('submissions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTable === 'submissions'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Submissions ({submissions.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTable}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading data from Firebase Firestore...</p>
        </div>
      ) : (
        <>
          {activeTable === 'users' ? renderUsersTable() : renderSubmissionsTable()}
          
          {((activeTable === 'users' && filteredUsers.length === 0) || 
            (activeTable === 'submissions' && filteredSubmissions.length === 0)) && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : `No ${activeTable} available in the database`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DatabaseView;