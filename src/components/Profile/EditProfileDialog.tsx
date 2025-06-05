import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { IUser } from '../../types/social';

interface EditProfileDialogProps {
  user: IUser;
  onClose: () => void;
}

export const EditProfileDialog = ({ user, onClose }: EditProfileDialogProps) => {
  const { updateSettings } = useStore();
  const [bio, setBio] = useState(user.bio);
  const [picture, setPicture] = useState(user.picture || user.avatar);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSettings({
      user: {
        ...user,
        bio,
        picture
      }
    });
    
    onClose();
  };

  return (
    <div className="edit-profile-dialog">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="picture">Profile Picture</label>
          <input
            type="text"
            id="picture"
            value={picture}
            onChange={(e) => setPicture(e.target.value)}
            placeholder="Enter picture URL"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}; 