import React, { useState, useRef } from 'react';
import { Upload, File, X, Play, Pause, Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface AudioFileUploadProps {
  onFileUpload?: (file: File) => void;
  onSaveToDatabase?: (audioData: { file: File; name: string; size: number; duration?: number }) => Promise<void>;
  className?: string;
  userId?: string;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

const AudioFileUpload: React.FC<AudioFileUploadProps> = ({ 
  onFileUpload, 
  onSaveToDatabase,
  className = '',
  userId,
  maxFileSize = 10, // 10MB default
  acceptedFormats = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac']
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `File type not supported. Accepted formats: ${acceptedFormats.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size too large. Maximum size: ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    setSuccess('');
    setIsUploading(true);

    try {
      const validFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validationError = validateFile(file);
        
        if (validationError) {
          setError(validationError);
          setIsUploading(false);
          return;
        }
        
        validFiles.push(file);
      }

      // Add files to uploaded files list
      setUploadedFiles(prev => [...prev, ...validFiles]);

      // Call callbacks
      for (const file of validFiles) {
        if (onFileUpload) {
          onFileUpload(file);
        }

        if (onSaveToDatabase) {
          // Get audio duration if possible
          const audio = new Audio();
          const duration = await new Promise<number>((resolve) => {
            audio.addEventListener('loadedmetadata', () => {
              resolve(audio.duration);
            });
            audio.addEventListener('error', () => {
              resolve(0);
            });
            audio.src = URL.createObjectURL(file);
          });

          await onSaveToDatabase({
            file,
            name: file.name,
            size: file.size,
            duration
          });
        }
      }

      setSuccess(`Successfully uploaded ${validFiles.length} audio file(s)`);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const playAudio = async (file: File) => {
    const fileId = `${file.name}-${file.size}`;
    
    if (playingFile === fileId) {
      // Pause current audio
      const audio = audioRefs.current[fileId];
      if (audio) {
        audio.pause();
        setPlayingFile(null);
      }
      return;
    }

    // Stop any currently playing audio
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Create or get audio element
    if (!audioRefs.current[fileId]) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('ended', () => {
        setPlayingFile(null);
      });
      audio.addEventListener('error', () => {
        setError('Failed to play audio file');
        setPlayingFile(null);
      });
      audioRefs.current[fileId] = audio;
    }

    const audio = audioRefs.current[fileId];
    setPlayingFile(fileId);
    
    try {
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to play audio file');
      setPlayingFile(null);
    }
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const removeFile = (index: number) => {
    const file = uploadedFiles[index];
    const fileId = `${file.name}-${file.size}`;
    
    // Stop and cleanup audio if playing
    if (audioRefs.current[fileId]) {
      audioRefs.current[fileId].pause();
      URL.revokeObjectURL(audioRefs.current[fileId].src);
      delete audioRefs.current[fileId];
    }
    
    if (playingFile === fileId) {
      setPlayingFile(null);
    }

    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Audio Files</h3>
        <div className="text-sm text-gray-600">
          {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) uploaded` : 'No files uploaded'}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-600 hover:text-green-800">×</button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />
        
        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          {dragOver ? 'Drop files here' : 'Upload Audio Files'}
        </h4>
        
        <p className="text-gray-600 mb-4">
          Drag and drop audio files here, or click to browse
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Choose Files
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-3">
          Supported formats: {acceptedFormats.join(', ')} • Max size: {maxFileSize}MB
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files</h4>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => {
              const fileId = `${file.name}-${file.size}`;
              const isPlaying = playingFile === fileId;
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <File className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type || 'Audio file'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => playAudio(file)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioFileUpload;