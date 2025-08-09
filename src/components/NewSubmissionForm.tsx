import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Submission } from '../types';
import AudioFileUpload from './AudioFileUpload';

interface NewSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewSubmissionForm: React.FC<NewSubmissionFormProps> = ({ isOpen, onClose }) => {
  const { addSubmission } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'complaint' as Submission['type'],
    priority: 'medium' as Submission['priority'],
    targetManager: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);

  const managers = [
    { id: 'operation-manager', name: 'Operation Manager' },
    { id: 'hr-manager', name: 'HR Manager' },
    { id: 'area-manager', name: 'Area Manager' }
  ];
  const categories = ['Workplace', 'Technology', 'Process', 'Communication', 'Safety', 'Training', 'Other'];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      await addSubmission({
        ...formData,
        status: 'pending',
        submittedBy: user.id,
      });

      setFormData({
        title: '',
        description: '',
        type: 'complaint',
        priority: 'medium',
        targetManager: '',
        category: '',
      });
      setVoiceNotes([]);
      setAudioFiles([]);
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAudioFileUpload = (file: File) => {
    setAudioFiles(prev => [...prev, file]);
    console.log(`Audio file uploaded: ${file.name}, ${file.size} bytes`);
  };

  const removeAudioFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">New Submission</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Submission['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
                <option value="idea">Idea</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Submission['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Manager</label>
              <select
                value={formData.targetManager}
                onChange={(e) => setFormData({ ...formData, targetManager: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Manager</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a clear, descriptive title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Provide detailed information about your submission"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Audio Files Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Audio Files</label>
              <button
                type="button"
                onClick={() => setShowAudioUpload(!showAudioUpload)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                disabled={isSubmitting}
              >
                <Upload className="w-4 h-4" />
                {showAudioUpload ? 'Hide Upload' : 'Add Audio Files'}
              </button>
            </div>
            
            {showAudioUpload && (
              <div className="mb-4">
                <AudioFileUpload 
                  onFileUpload={handleAudioFileUpload}
                  className="border border-gray-300 rounded-lg"
                  maxFileSize={15}
                  acceptedFormats={['.mp3', '.wav', '.m4a', '.ogg', '.aac']}
                />
              </div>
            )}
            
            {audioFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploaded audio files ({audioFiles.length}):</p>
                {audioFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={() => removeAudioFile(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSubmissionForm;