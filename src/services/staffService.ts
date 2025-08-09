import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { WorkProgress, StaffPerformance } from '../types';

export class StaffService {
  private static workProgressCollection = collection(db, 'work_progress');
  private static performanceCollection = collection(db, 'staff_performance');

  // Work Progress Methods
  static async createWorkProgress(progressData: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; progress?: WorkProgress; error?: string }> {
    try {
      const docRef = await addDoc(this.workProgressCollection, {
        ...progressData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newProgress: WorkProgress = {
        id: docRef.id,
        ...progressData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return { success: true, progress: newProgress };
    } catch (error) {
      const errorMessage = handleFirestoreError(error, 'creating work progress');
      return { success: false, error: errorMessage };
    }
  }

  static async getWorkProgressByStaff(staffId: string): Promise<WorkProgress[]> {
    try {
      const q = query(
        this.workProgressCollection,
        where('staffId', '==', staffId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docData => {
        const data = docData.data();
        return {
          id: docData.id,
          staffId: data.staffId,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          priority: data.priority,
          startDate: data.startDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          progress: data.progress || 0,
          assignedBy: data.assignedBy,
          tags: data.tags || [],
          notes: data.notes,
          attachments: data.attachments || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Error getting work progress by staff:', error);
      return [];
    }
  }

  static async getAllWorkProgress(): Promise<WorkProgress[]> {
    try {
      const q = query(this.workProgressCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docData => {
        const data = docData.data();
        return {
          id: docData.id,
          staffId: data.staffId,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          priority: data.priority,
          startDate: data.startDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          progress: data.progress || 0,
          assignedBy: data.assignedBy,
          tags: data.tags || [],
          notes: data.notes,
          attachments: data.attachments || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Error getting all work progress:', error);
      return [];
    }
  }

  static async updateWorkProgress(progressId: string, updates: Partial<Omit<WorkProgress, 'id' | 'createdAt'>>): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, 'work_progress', progressId);
      const updateData: any = { 
        ...updates, 
        updatedAt: serverTimestamp() 
      };
      
      // Convert Date objects if present
      if (updateData.startDate) {
        updateData.startDate = updateData.startDate;
      }
      if (updateData.dueDate) {
        updateData.dueDate = updateData.dueDate;
      }
      if (updateData.completedDate) {
        updateData.completedDate = updateData.completedDate;
      }

      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error) {
      const errorMessage = handleFirestoreError(error, 'updating work progress');
      return { success: false, error: errorMessage };
    }
  }

  static async deleteWorkProgress(progressId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, 'work_progress', progressId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      const errorMessage = handleFirestoreError(error, 'deleting work progress');
      return { success: false, error: errorMessage };
    }
  }

  // Staff Performance Methods
  static async createPerformanceRecord(performanceData: Omit<StaffPerformance, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; performance?: StaffPerformance; error?: string }> {
    try {
      const docRef = await addDoc(this.performanceCollection, {
        ...performanceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newPerformance: StaffPerformance = {
        id: docRef.id,
        ...performanceData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return { success: true, performance: newPerformance };
    } catch (error) {
      const errorMessage = handleFirestoreError(error, 'creating performance record');
      return { success: false, error: errorMessage };
    }
  }

  static async getPerformanceByStaff(staffId: string): Promise<StaffPerformance[]> {
    try {
      const q = query(
        this.performanceCollection,
        where('staffId', '==', staffId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docData => {
        const data = docData.data();
        return {
          id: docData.id,
          staffId: data.staffId,
          period: data.period,
          tasksCompleted: data.tasksCompleted || 0,
          tasksOnTime: data.tasksOnTime || 0,
          averageRating: data.averageRating || 0,
          goals: data.goals || [],
          achievements: data.achievements || [],
          areasForImprovement: data.areasForImprovement || [],
          supervisorNotes: data.supervisorNotes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Error getting performance by staff:', error);
      return [];
    }
  }

  // Real-time listeners
  static subscribeToWorkProgress(staffId: string, callback: (progress: WorkProgress[]) => void): () => void {
    const q = query(
      this.workProgressCollection,
      where('staffId', '==', staffId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const progress = querySnapshot.docs.map(docData => {
        const data = docData.data();
        return {
          id: docData.id,
          staffId: data.staffId,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          priority: data.priority,
          startDate: data.startDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          progress: data.progress || 0,
          assignedBy: data.assignedBy,
          tags: data.tags || [],
          notes: data.notes,
          attachments: data.attachments || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
      callback(progress);
    }, (error) => {
      console.error('Error in work progress subscription:', error);
      callback([]);
    });
  }

  static subscribeToAllWorkProgress(callback: (progress: WorkProgress[]) => void): () => void {
    const q = query(this.workProgressCollection, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const progress = querySnapshot.docs.map(docData => {
        const data = docData.data();
        return {
          id: docData.id,
          staffId: data.staffId,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          priority: data.priority,
          startDate: data.startDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          progress: data.progress || 0,
          assignedBy: data.assignedBy,
          tags: data.tags || [],
          notes: data.notes,
          attachments: data.attachments || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
      callback(progress);
    }, (error) => {
      console.error('Error in all work progress subscription:', error);
      callback([]);
    });
  }

  // Analytics and Statistics
  static async getStaffStatistics(staffId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    averageProgress: number;
    completionRate: number;
  }> {
    try {
      const progress = await this.getWorkProgressByStaff(staffId);
      const now = new Date();
      
      const totalTasks = progress.length;
      const completedTasks = progress.filter(p => p.status === 'completed').length;
      const inProgressTasks = progress.filter(p => p.status === 'in-progress').length;
      const overdueTasks = progress.filter(p => 
        p.dueDate && p.dueDate < now && p.status !== 'completed'
      ).length;
      
      const averageProgress = totalTasks > 0 
        ? progress.reduce((sum, p) => sum + p.progress, 0) / totalTasks 
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