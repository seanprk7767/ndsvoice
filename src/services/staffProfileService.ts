import { supabase } from '../lib/supabase';

export interface StaffProfile {
  id: string;
  user_id: string;
  
  // Personal Information
  full_name?: string;
  date_of_birth?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  
  // Family Information
  fathers_name?: string;
  mothers_name?: string;
  spouse_name?: string;
  
  // Contact Information
  personal_email?: string;
  work_email?: string;
  email?: string; // Legacy field
  mobile_number?: string;
  home_phone?: string;
  phone?: string; // Legacy field
  
  // Address Information
  permanent_address?: string;
  current_address?: string;
  address?: string; // Legacy field
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Work Information
  department?: string;
  position?: string;
  supervisor_id?: string;
  hire_date?: string;
  profile_image_url?: string;
  skills?: string[];
  bio?: string;
  status: 'active' | 'inactive' | 'on-leave';
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  created_at: string;
  updated_at: string;
}

export interface WorkProgress {
  id: string;
  staff_id: string;
  title: string;
  description: string;
  category: 'project' | 'task' | 'training' | 'meeting' | 'other';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  due_date?: string;
  completed_date?: string;
  progress_percentage: number;
  assigned_by?: string;
  tags?: string[];
  notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export class StaffProfileService {
  // Profile Image Upload
  static async uploadProfileImage(file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error) {
      return { success: false, error: 'Failed to upload image' };
    }
  }

  // Staff Profile CRUD
  static async createStaffProfile(profileData: Omit<StaffProfile, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; profile?: StaffProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: 'Failed to create staff profile' };
    }
  }

  static async getStaffProfile(userId: string): Promise<StaffProfile | null> {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting staff profile:', error);
        return null;
      }

      // Return the first profile if data exists, otherwise null
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting staff profile:', error);
      return null;
    }
  }

  static async getAllStaffProfiles(): Promise<StaffProfile[]> {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          user:users!staff_profiles_user_id_fkey(name, role, national_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all staff profiles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all staff profiles:', error);
      return [];
    }
  }

  static async updateStaffProfile(userId: string, updates: Partial<StaffProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('staff_profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update staff profile' };
    }
  }

  // Work Progress CRUD
  static async createWorkProgress(progressData: Omit<WorkProgress, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; progress?: WorkProgress; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('work_progress')
        .insert(progressData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, progress: data };
    } catch (error) {
      return { success: false, error: 'Failed to create work progress' };
    }
  }

  static async getWorkProgressByStaff(staffId: string): Promise<WorkProgress[]> {
    try {
      const { data, error } = await supabase
        .from('work_progress')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting work progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting work progress:', error);
      return [];
    }
  }

  static async getAllWorkProgress(): Promise<WorkProgress[]> {
    try {
      const { data, error } = await supabase
        .from('work_progress')
        .select(`
          *,
          staff:users(name, national_id),
          assigned_by_user:users!work_progress_assigned_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all work progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all work progress:', error);
      return [];
    }
  }

  static async updateWorkProgress(progressId: string, updates: Partial<WorkProgress>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('work_progress')
        .update(updates)
        .eq('id', progressId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update work progress' };
    }
  }

  static async deleteWorkProgress(progressId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('work_progress')
        .delete()
        .eq('id', progressId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete work progress' };
    }
  }

  // Submission Staff Assignment
  static async assignStaffToSubmission(submissionId: string, staffIds: string[], assignedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, remove existing assignments
      await supabase
        .from('submission_staff')
        .delete()
        .eq('submission_id', submissionId);

      // Then add new assignments
      if (staffIds.length > 0) {
        const assignments = staffIds.map(staffId => ({
          submission_id: submissionId,
          staff_id: staffId,
          assigned_by: assignedBy
        }));

        const { error } = await supabase
          .from('submission_staff')
          .insert(assignments);

        if (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to assign staff to submission' };
    }
  }

  static async getSubmissionStaff(submissionId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('submission_staff')
        .select('staff_id')
        .eq('submission_id', submissionId);

      if (error) {
        console.error('Error getting submission staff:', error);
        return [];
      }

      return data?.map(item => item.staff_id) || [];
    } catch (error) {
      console.error('Error getting submission staff:', error);
      return [];
    }
  }

  // Statistics
  static async getStaffStatistics(staffId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    averageProgress: number;
    completionRate: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('work_progress')
        .select('status, progress_percentage, due_date')
        .eq('staff_id', staffId);

      if (error) {
        console.error('Error getting staff statistics:', error);
        return {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0,
          averageProgress: 0,
          completionRate: 0
        };
      }

      const progress = data || [];
      const now = new Date();
      
      const totalTasks = progress.length;
      const completedTasks = progress.filter(p => p.status === 'completed').length;
      const inProgressTasks = progress.filter(p => p.status === 'in-progress').length;
      const overdueTasks = progress.filter(p => 
        p.due_date && new Date(p.due_date) < now && p.status !== 'completed'
      ).length;
      
      const averageProgress = totalTasks > 0 
        ? progress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalTasks 
        : 0;
      
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        averageProgress,
        completionRate
      };
    } catch (error) {
      console.error('Error getting staff statistics:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        averageProgress: 0,
        completionRate: 0
      };
    }
  }
}