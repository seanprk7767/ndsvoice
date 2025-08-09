import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Submission, AppContextType } from '../types';
import { useAuth } from './AuthContext';
import { SubmissionService } from '../services/submissionService';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load submissions from Supabase with real-time updates
  const loadSubmissions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let submissionsData: Submission[];
      
      if (user.role === 'admin') {
        submissionsData = await SubmissionService.getAllSubmissions();
      } else {
        submissionsData = await SubmissionService.getSubmissionsByUser(user.id);
      }
      
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubmission = async (submission: Omit<Submission, 'id' | 'submittedAt'>) => {
    if (!user) return;

    try {
      const result = await SubmissionService.createSubmission({
        ...submission,
        submittedBy: user.id,
      });

      if (result.success && result.submission) {
        setSubmissions(prev => [result.submission!, ...prev]);
      } else {
        console.error('Error adding submission:', result.error);
        throw new Error(result.error || 'Failed to create submission');
      }
    } catch (error) {
      console.error('Error in addSubmission:', error);
      throw error;
    }
  };

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    const result = await SubmissionService.updateSubmission(id, updates);

    if (result.success) {
      setSubmissions(prev =>
        prev.map(submission =>
          submission.id === id ? { ...submission, ...updates } : submission
        )
      );
    } else {
      console.error('Error updating submission:', result.error);
    }
  };

  const deleteSubmission = async (id: string) => {
    const result = await SubmissionService.deleteSubmission(id);

    if (result.success) {
      setSubmissions(prev => prev.filter(submission => submission.id !== id));
    } else {
      console.error('Error deleting submission:', result.error);
    }
  };

  // Set up real-time listeners when user changes
  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    if (user.role === 'admin') {
      // Admin sees all submissions with real-time updates
      unsubscribe = SubmissionService.subscribeToAllSubmissions((submissionsData) => {
        setSubmissions(submissionsData);
        setIsLoading(false);
      });
    } else {
      // Regular users see only their submissions with real-time updates
      unsubscribe = SubmissionService.subscribeToUserSubmissions(user.id, (submissionsData) => {
        setSubmissions(submissionsData);
        setIsLoading(false);
      });
    }

    setIsLoading(true);

    // Cleanup subscription on unmount or user change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return (
    <AppContext.Provider value={{ 
      submissions, 
      addSubmission, 
      updateSubmission, 
      deleteSubmission, 
      loadSubmissions,
      isLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};