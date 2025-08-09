import React, { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2, Search, MapPin, Phone, Mail, Calendar, Award, TrendingUp, Users, Building, UserCheck } from 'lucide-react';
import { User as UserType, WorkProgress } from '../types';
import { UserService } from '../services/userService';
import { StaffService } from '../services/staffService';
import { useAuth } from '../context/AuthContext';

const StaffProfiles: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<UserType[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<UserType | null>(null);
  const [workProgress, setWorkProgress] = useState<WorkProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffStats, setStaffStats] = useState<any>({});

  const departments = ['HR', 'IT', 'Finance', 'Operations', 'Marketing', 'Sales', 'Support'];

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      loadStaffProgress(selectedStaff.id);
      loadStaffStats(selectedStaff.id);
    }
  }, [selectedStaff]);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const staffData = await UserService.getAllUsers();
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaffProgress = async (staffId: string) => {
    try {
      const progress = await StaffService.getWorkProgressByStaff(staffId);
      setWorkProgress(progress);
    } catch (error) {
      console.error('Error loading staff progress:', error);
    }
  };

  const loadStaffStats = async (staffId: string) => {
    try {
      const stats = await StaffService.getStaffStatistics(staffId);
      setStaffStats(stats);
    } catch (error) {
      console.error('Error loading staff stats:', error);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.nationalId.includes(searchTerm) ||
                         member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderStaffCard = (member: UserType) => (
    <div
      key={member.id}
      onClick={() => setSelectedStaff(member)}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            member.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            {member.profileImage ? (
              <img src={member.profileImage} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <User className={`w-6 h-6 ${member.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {member.name}
            </h3>
            <p className="text-sm text-gray-600">{member.position || 'Staff Member'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
          {member.status || 'active'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {member.department && (
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>{member.department}</span>
          </div>
        )}
        {member.email && (
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>{member.email}</span>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>{member.phone}</span>
          </div>
        )}
      </div>

      {member.skills && member.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {member.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              {skill}
            </span>
          ))}
          {member.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
              +{member.skills.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderStaffDetails = () => {
    if (!selectedStaff) return null;

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                {selectedStaff.profileImage ? (
                  <img src={selectedStaff.profileImage} alt={selectedStaff.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedStaff.name}</h2>
                <p className="text-blue-100">{selectedStaff.position || 'Staff Member'}</p>
                <p className="text-blue-200 text-sm">{selectedStaff.department}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedStaff.status === 'active' ? 'bg-green-500/20 text-green-100' :
                selectedStaff.status === 'inactive' ? 'bg-red-500/20 text-red-100' :
                'bg-yellow-500/20 text-yellow-100'
              }`}>
                {selectedStaff.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-900">{staffStats.totalTasks || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{staffStats.completedTasks || 0}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-900">{staffStats.inProgressTasks || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{Math.round(staffStats.completionRate || 0)}%</p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{selectedStaff.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{selectedStaff.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    Joined: {selectedStaff.hireDate?.toLocaleDateString() || selectedStaff.createdAt?.toLocaleDateString() || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{selectedStaff.department || 'Not assigned'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Supervisor: {selectedStaff.supervisor || 'Not assigned'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Role: {selectedStaff.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {selectedStaff.skills && selectedStaff.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {selectedStaff.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {selectedStaff.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 leading-relaxed">{selectedStaff.bio}</p>
            </div>
          )}

          {/* Recent Work Progress */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Work Progress</h3>
            {workProgress.length > 0 ? (
              <div className="space-y-3">
                {workProgress.slice(0, 5).map((progress) => (
                  <div key={progress.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{progress.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                        progress.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        progress.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {progress.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{progress.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(progress.progress)}`}
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{progress.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No work progress recorded yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Profiles</h2>
          <p className="text-gray-600">Comprehensive staff profiles and work progress tracking</p>
        </div>
        {user?.role === 'admin' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Staff Members ({filteredStaff.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading staff...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStaff.map(renderStaffCard)}
                
                {filteredStaff.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Staff Details */}
        <div className="lg:col-span-2">
          {selectedStaff ? (
            renderStaffDetails()
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Staff Member</h3>
              <p className="text-gray-600">Choose a staff member from the list to view their detailed profile and work progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfiles;