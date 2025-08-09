import { supabase } from '../lib/supabase';
import { Submission } from '../types';

export class SubmissionService {
  // Create a new submission
  static async createSubmission(submissionData: Omit<Submission, 'id' | 'submittedAt'>): Promise<{ success: boolean; submission?: Submission; error?: string }> {
    try {
      const insertData = {
        title: submissionData.title,
        description: submissionData.description,
        type: submissionData.type,
        status: submissionData.status || 'pending',
        priority: submissionData.priority || 'medium',
        submitted_by: submissionData.submittedBy,
        submitted_at: new Date().toISOString(),
        admin_notes: submissionData.adminNotes || null,
        resolved_at: submissionData.resolvedAt?.toISOString() || null,
        resolved_by: submissionData.resolvedBy || null,
        target_manager: submissionData.targetManager || null,
        impact: submissionData.impact || 'medium',
        category: submissionData.category || null
      };

      const { data, error } = await supabase
        .from('submissions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating submission:', error);
        return { success: false, error: error.message };
      }

      const newSubmission: Submission = {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        priority: data.priority,
        submittedBy: data.submitted_by,
        submittedAt: new Date(data.submitted_at),
        resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
        resolvedBy: data.resolved_by,
        adminNotes: data.admin_notes,
        targetManager: data.target_manager,
        impact: data.impact,
        category: data.category
      };

      return { success: true, submission: newSubmission };
    } catch (error) {
      console.error('Error creating submission:', error);
      return { success: false, error: 'Failed to create submission' };
    }
  }

  // Get submissions by user ID
  static async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('submitted_by', userId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error getting user submissions:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status,
        priority: item.priority,
        submittedBy: item.submitted_by,
        submittedAt: new Date(item.submitted_at),
        resolvedAt: item.resolved_at ? new Date(item.resolved_at) : undefined,
        resolvedBy: item.resolved_by,
        adminNotes: item.admin_notes,
        targetManager: item.target_manager,
        impact: item.impact,
        category: item.category
      }));
    } catch (error) {
      console.error('Error getting user submissions:', error);
      return [];
    }
  }

  // Get all submissions (admin only)
  static async getAllSubmissions(): Promise<Submission[]> {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error getting all submissions:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status,
        priority: item.priority,
        submittedBy: item.submitted_by,
        submittedAt: new Date(item.submitted_at),
        resolvedAt: item.resolved_at ? new Date(item.resolved_at) : undefined,
        resolvedBy: item.resolved_by,
        adminNotes: item.admin_notes,
        targetManager: item.target_manager,
        impact: item.impact,
        category: item.category
      }));
    } catch (error) {
      console.error('Error getting all submissions:', error);
      return [];
    }
  }

  // Update submission
  static async updateSubmission(submissionId: string, updates: Partial<Omit<Submission, 'id' | 'submittedAt'>>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.resolvedAt !== undefined) updateData.resolved_at = updates.resolvedAt?.toISOString();
      if (updates.resolvedBy !== undefined) updateData.resolved_by = updates.resolvedBy;
      if (updates.adminNotes !== undefined) updateData.admin_notes = updates.adminNotes;
      if (updates.targetManager !== undefined) updateData.target_manager = updates.targetManager;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', submissionId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update submission' };
    }
  }

  // Delete submission
  static async deleteSubmission(submissionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete submission' };
    }
  }

  // Real-time listener for user submissions
  static subscribeToUserSubmissions(userId: string, callback: (submissions: Submission[]) => void): () => void {
    const subscription = supabase
      .channel('user_submissions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'submissions', filter: `submitted_by=eq.${userId}` },
        () => {
          this.getSubmissionsByUser(userId).then(callback);
        }
      )
      .subscribe();

    // Initial load
    this.getSubmissionsByUser(userId).then(callback);

    return () => {
      subscription.unsubscribe();
    };
  }

  // Real-time listener for all submissions (admin)
  static subscribeToAllSubmissions(callback: (submissions: Submission[]) => void): () => void {
    const subscription = supabase
      .channel('all_submissions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'submissions' },
        () => {
          this.getAllSubmissions().then(callback);
        }
      )
      .subscribe();

    // Initial load
    this.getAllSubmissions().then(callback);

    return () => {
      subscription.unsubscribe();
    };
  }
}