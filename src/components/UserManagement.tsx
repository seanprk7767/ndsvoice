import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Shield, User, Search, CheckCircle, AlertCircle, Crown, RefreshCw } from 'lucide-react';
import { User as UserType } from '../types';
import { UserService } from '../services/userService';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    role: 'member' as 'member' | 'admin',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    
    // Set up real-time listener for users
    const unsubscribe = UserService.subscribeToUsers((usersData) => {
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.nationalId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await UserService.createUser({
        name: formData.name.trim(),
        national_id: formData.nationalId.trim(),
        role: formData.role,
      });

      if (result.success && result.user) {
        setFormData({ name: '', nationalId: '', role: 'member' });
        setShowCreateForm(false);
        
        if (formData.role === 'admin') {
          setSuccess('✅ Admin user created successfully! They can now log in with full administrative privileges.');
        } else {
          setSuccess('✅ Member user created successfully! They can now log in and submit requests.');
        }
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.nationalId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await UserService.updateUser(editingUser.id, {
        name: formData.name.trim(),
        national_id: formData.nationalId.trim(),
        role: formData.role,
      });

      if (result.success) {
        setEditingUser(null);
        setFormData({ name: '', nationalId: '', role: 'member' });
        setShowCreateForm(false);
        
        if (formData.role === 'admin' && editingUser.role !== 'admin') {
          setSuccess('✅ User promoted to admin successfully!');
        } else if (formData.role === 'member' && editingUser.role === 'admin') {
          setSuccess('✅ Admin demoted to member successfully!');
        } else {
          setSuccess('✅ User updated successfully!');
        }
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    // Prevent deleting the last admin
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (userToDelete.role === 'admin' && adminCount === 1) {
      setError('Cannot delete the last admin user. At least one admin must exist.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone and will also delete all their submissions.`)) {
      try {
        const result = await UserService.deleteUser(userId);

        if (result.success) {
          setSuccess('✅ User deleted successfully');
        } else {
          setError(result.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const startEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      nationalId: user.nationalId,
      role: user.role,
    });
    setShowCreateForm(true);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: '', nationalId: '', role: 'member' });
    setShowCreateForm(false);
    setError('');
    setSuccess('');
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nationalId.includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const memberCount = users.filter(u => u.role === 'member').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Create and manage user accounts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setError('');
              setSuccess('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Firebase Integration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-blue-600 text-sm font-bold">💾</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Database Integration</h3>
            <p className="text-blue-800 text-sm mb-3">
              All user data is stored in <strong>Supabase</strong> with real-time synchronization and secure access.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="font-medium text-blue-900">✓ Real-time Updates:</p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• Instant data synchronization</li>
                  <li>• Live user list updates</li>
                  <li>• Automatic conflict resolution</li>
                  <li>• Cross-device consistency</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="font-medium text-blue-900">Database Features:</p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• Offline data persistence</li>
                  <li>• Scalable PostgreSQL database</li>
                  <li>• Built-in security rules</li>
                  <li>• Cloud infrastructure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Creation Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Crown className="w-6 h-6 text-purple-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Admin Account Creation</h3>
            <p className="text-purple-800 text-sm mb-3">
              This is the <strong>only place</strong> where admin accounts can be created. Regular users can only register as members through the login form.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="font-medium text-purple-900">✓ Admin Privileges:</p>
                <ul className="text-purple-800 mt-1 space-y-1">
                  <li>• Create and manage all users</li>
                  <li>• View and manage all submissions</li>
                  <li>• Access user management dashboard</li>
                  <li>• View database and export data</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="font-medium text-purple-900">Member Limitations:</p>
                <ul className="text-purple-800 mt-1 space-y-1">
                  <li>• Can only view their own submissions</li>
                  <li>• Cannot access admin features</li>
                  <li>• Can register themselves via login form</li>
                  <li>• Need admin promotion for privileges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administrators</p>
              <p className="text-2xl font-semibold text-gray-900">{adminCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-semibold text-gray-900">{memberCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, National ID, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users from Firebase...</p>
        </div>
      )}

      {/* Users List */}
      {!isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          {user.role === 'admin' ? (
                            <Shield className="w-4 h-4 text-purple-600" />
                          ) : (
                            <User className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          {user.role === 'admin' && (
                            <div className="text-xs text-purple-600 font-medium">Administrator</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nationalId}</td>
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
                      {user.createdAt?.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                          disabled={user.role === 'admin' && adminCount === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first user to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {editingUser 
                  ? 'Update user information and role'
                  : 'Create a new user with member or admin privileges'
                }
              </p>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter National ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'member' | 'admin' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="member">Member - Can submit and view own submissions</option>
                  <option value="admin">Admin - Full system access and management</option>
                </select>
                
                {formData.role === 'admin' && (
                  <p className="text-xs text-purple-600 mt-1">
                    ⚠️ Admin users will have full access to all system features and data
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;