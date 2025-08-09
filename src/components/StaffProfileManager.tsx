import React, { useState, useEffect } from 'react';
import { User, Plus, Edit, Save, X, Search, MapPin, Phone, Mail, Calendar, Award, TrendingUp, Users, Building, UserCheck, Upload } from 'lucide-react';
import { User as UserType } from '../types';
import { UserService } from '../services/userService';
import { StaffProfileService, StaffProfile } from '../services/staffProfileService';
import { useAuth } from '../context/AuthContext';

const StaffProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<UserType[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: StaffProfile }>({});
  const [selectedStaff, setSelectedStaff] = useState<UserType | null>(null);
  const [editingProfile, setEditingProfile] = useState<StaffProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const departments = ['HR', 'IT', 'Finance', 'Operations', 'Marketing', 'Sales', 'Support'];
  const maritalStatuses = ['single', 'married', 'divorced', 'widowed'];
  const statuses = ['active', 'inactive', 'on-leave'];

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const staffData = await UserService.getAllUsers();
      setStaff(staffData);

      // Load profiles for each staff member
      const profilesData: { [key: string]: StaffProfile } = {};
      for (const staffMember of staffData) {
        const profile = await StaffProfileService.getStaffProfile(staffMember.id);
        if (profile) {
          profilesData[staffMember.id] = profile;
        }
      }
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading staff:', error);
      setError('Failed to load staff data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const profile = profiles[member.id];
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.nationalId.includes(searchTerm) ||
                         profile?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile?.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || profile?.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const startEditProfile = (staffMember: UserType) => {
    const existingProfile = profiles[staffMember.id];
    
    if (existingProfile) {
      setEditingProfile(existingProfile);
    } else {
      // Create new profile template
      setEditingProfile({
        id: '',
        user_id: staffMember.id,
        full_name: staffMember.name,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    setSelectedStaff(staffMember);
  };

  const saveProfile = async () => {
    if (!editingProfile || !selectedStaff) return;

    try {
      setError('');
      setSuccess('');

      if (editingProfile.id) {
        // Update existing profile
        const result = await StaffProfileService.updateStaffProfile(selectedStaff.id, editingProfile);
        if (result.success) {
          setProfiles(prev => ({
            ...prev,
            [selectedStaff.id]: editingProfile
          }));
          setSuccess('Profile updated successfully!');
        } else {
          setError(result.error || 'Failed to update profile');
        }
      } else {
        // Create new profile
        const result = await StaffProfileService.createStaffProfile({
          ...editingProfile,
          user_id: selectedStaff.id
        });
        if (result.success && result.profile) {
          setProfiles(prev => ({
            ...prev,
            [selectedStaff.id]: result.profile!
          }));
          setSuccess('Profile created successfully!');
        } else {
          setError(result.error || 'Failed to create profile');
        }
      }

      setEditingProfile(null);
      setSelectedStaff(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('An unexpected error occurred');
    }
  };

  const cancelEdit = () => {
    setEditingProfile(null);
    setSelectedStaff(null);
    setError('');
    setSuccess('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStaffCard = (member: UserType) => {
    const profile = profiles[member.id];
    
    return (
      <div
        key={member.id}
        className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              member.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              {profile?.profile_image_url ? (
                <img src={profile.profile_image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className={`w-6 h-6 ${member.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {profile?.full_name || member.name}
              </h3>
              <p className="text-sm text-gray-600">{profile?.position || 'Staff Member'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(profile?.status || 'active')}`}>
              {profile?.status || 'active'}
            </span>
            {user?.role === 'admin' && (
              <button
                onClick={() => startEditProfile(member)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Profile"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {profile?.department && (
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>{profile.department}</span>
            </div>
          )}
          {(profile?.work_email || profile?.email) && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{profile.work_email || profile.email}</span>
            </div>
          )}
          {(profile?.mobile_number || profile?.phone) && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{profile.mobile_number || profile.phone}</span>
            </div>
          )}
        </div>

        {profile?.skills && profile.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {profile.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                +{profile.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editingProfile || !selectedStaff) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Profile - {selectedStaff.name}
              </h2>
              <button
                onClick={cancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingProfile.full_name || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingProfile.date_of_birth || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <select
                    value={editingProfile.marital_status || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, marital_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    {maritalStatuses.map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingProfile.status}
                    onChange={(e) => setEditingProfile({ ...editingProfile, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={editingProfile.fathers_name || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, fathers_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={editingProfile.mothers_name || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, mothers_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                  <input
                    type="text"
                    value={editingProfile.spouse_name || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, spouse_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email</label>
                  <input
                    type="email"
                    value={editingProfile.personal_email || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, personal_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    value={editingProfile.work_email || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, work_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={editingProfile.mobile_number || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, mobile_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone</label>
                  <input
                    type="tel"
                    value={editingProfile.home_phone || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, home_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={editingProfile.department || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={editingProfile.position || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={editingProfile.hire_date || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, hire_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                  <textarea
                    value={editingProfile.current_address || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, current_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editingProfile.city || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editingProfile.state || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={editingProfile.postal_code || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editingProfile.country || 'Malaysia'}
                    onChange={(e) => setEditingProfile({ ...editingProfile, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editingProfile.emergency_contact_name || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, emergency_contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={editingProfile.emergency_contact_phone || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, emergency_contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={editingProfile.bio || ''}
                onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Brief description about the staff member..."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={editingProfile.skills?.join(', ') || ''}
                onChange={(e) => setEditingProfile({ 
                  ...editingProfile, 
                  skills: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="JavaScript, React, Project Management, etc."
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg">
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
        <p className="text-gray-600">Only administrators can manage staff profiles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Profile Manager</h2>
          <p className="text-gray-600">Manage comprehensive staff profiles and information</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff by name, ID, department, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff profiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(renderStaffCard)}
          
          {filteredStaff.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {renderEditForm()}
    </div>
  );
};

export default StaffProfileManager;