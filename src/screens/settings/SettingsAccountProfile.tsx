import React, { useState, useRef, useEffect } from 'react';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { User, Camera, Mail, AtSign, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useCurrentUser, useUpdateUserProfile } from '../../hooks/useConvex';
import { uploadProfilePicture, compressImage, formatFileSize } from '../../lib/imageUpload';

export default function SettingsAccountProfile() {
  const { user, firebaseUid } = useCurrentUser();
  const updateProfile = useUpdateUserProfile();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    email: '',
    avatar: ''
  });

  // Load user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Handle profile picture upload
  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUid) return;

    try {
      setError(null);
      setIsUploadingPicture(true);

      // Compress image for optimization
      const compressedFile = await compressImage(file, 0.8);
      
      // Upload to Firebase Storage
      const downloadURL = await uploadProfilePicture(compressedFile, firebaseUid);
      
      // Update user profile in Convex with new avatar URL
      await updateProfile({
        firebaseUid,
        avatar: downloadURL,
      });

      // Update local form state
      setFormData(prev => ({ ...prev, avatar: downloadURL }));
      setSuccess('Profile picture updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload profile picture';
      setError(errorMessage);
      console.error('Profile picture upload error:', err);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!firebaseUid) return;

    try {
      setError(null);
      setIsLoading(true);

      await updateProfile({
        firebaseUid,
        name: formData.name,
        username: formData.username,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailLayout 
      title="Profile Info" 
      description="How you appear to other readers and creators."
      onSave={handleSave}
      isLoading={isLoading}
    >
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-3">
          <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-green-200 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-10">
        <div 
          className="relative group cursor-pointer"
          onClick={() => !isUploadingPicture && fileInputRef.current?.click()}
        >
          <div className="w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 overflow-hidden ring-4 ring-white/5 shadow-2xl">
            {formData.avatar ? (
              <img 
                src={formData.avatar}
                alt="Avatar"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-lemon-muted/20 to-white/5 flex items-center justify-center">
                <User size={48} className="text-white/30" />
              </div>
            )}
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
            {isUploadingPicture ? (
              <Loader size={24} className="text-white animate-spin" />
            ) : (
              <Camera size={24} className="text-white" />
            )}
          </div>

          {isUploadingPicture && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-white/50 font-medium">
              Uploading...
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePictureUpload}
          disabled={isUploadingPicture}
          className="hidden"
          aria-label="Upload profile picture"
        />

        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/30">
          {isUploadingPicture ? 'Uploading...' : 'Tap to change avatar'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Full Name</label>
          <div className="relative">
             <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Username</label>
          <div className="relative">
             <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2 opacity-50">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Email Address</label>
          <div className="relative">
             <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
             <input 
              type="email" 
              readOnly
              value={formData.email}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 font-bold cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] font-bold text-white/20 ml-4 italic">Email cannot be changed manually.</p>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
