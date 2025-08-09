import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  national_id: string;
  role: 'member' | 'admin';
  created_at?: string;
}

export class UserService {
  // Create a new user
  static async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if user with national ID already exists
      const existingUser = await this.getUserByNationalId(userData.national_id);
      if (existingUser) {
        return { success: false, error: 'A user with this National ID already exists' };
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          national_id: userData.national_id,
          role: userData.role
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, user: data };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  // Get user by National ID and Name (for login)
  static async getUserByCredentials(nationalId: string, name: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('national_id', nationalId)
        .eq('name', name)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user by credentials:', error);
      return null;
    }
  }

  // Get user by National ID only
  static async getUserByNationalId(nationalId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('national_id', nationalId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user by national ID:', error);
      return null;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<{ success: boolean; error?: string }> {
    try {
      // If updating national ID, check for conflicts
      if (updates.national_id) {
        const existingUser = await this.getUserByNationalId(updates.national_id);
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: 'A user with this National ID already exists' };
        }
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update user' };
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  }

  // Check if any admin users exist
  static async hasAdminUsers(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (error) {
        console.error('Error checking admin users:', error);
        return false;
      }

      return (data && data.length > 0) || false;
    } catch (error) {
      console.error('Error checking admin users:', error);
      return false;
    }
  }

  // Real-time listener for users (admin dashboard)
  static subscribeToUsers(callback: (users: User[]) => void): () => void {
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => {
          // Reload users when changes occur
          this.getAllUsers().then(callback);
        }
      )
      .subscribe();

    // Initial load
    this.getAllUsers().then(callback);

    return () => {
      subscription.unsubscribe();
    };
  }
}