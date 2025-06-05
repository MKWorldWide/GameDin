import { IUser } from '../../types/social';

interface ProfileHeaderProps {
  user: IUser;
  isCurrentUser: boolean;
  onEditProfile?: () => void;
}

export const ProfileHeader = ({ user, isCurrentUser, onEditProfile }: ProfileHeaderProps) => {
  return (
    <div className="profile-header">
      <div className="profile-image">
        <img
          src={user.picture || user.avatar}
          alt={user.username}
          className="avatar"
        />
      </div>
      
      <div className="profile-info">
        <h1>{user.name || user.username}</h1>
        <p className="username">@{user.username}</p>
        <p className="bio">{user.bio}</p>
        
        <div className="stats">
          <div className="stat">
            <span className="label">Level</span>
            <span className="value">{user.level}</span>
          </div>
          <div className="stat">
            <span className="label">Rank</span>
            <span className="value">{user.rank}</span>
          </div>
          <div className="stat">
            <span className="label">Games Won</span>
            <span className="value">{user.gameStats.gamesWon}</span>
          </div>
          <div className="stat">
            <span className="label">Win Rate</span>
            <span className="value">{user.gameStats.winRate}%</span>
          </div>
        </div>

        {isCurrentUser && (
          <button
            onClick={onEditProfile}
            className="edit-profile-button"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}; 