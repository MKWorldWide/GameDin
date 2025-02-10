import useStore from '../store/useStore';

const ProfileCard = () => {
  const user = useStore(state => state.user);

  if (!user) {
    return (
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Please log in</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        <img src={user.avatar || '/default-avatar.png'} alt="Profile" className="rounded-xl" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{user.username}</h2>
        <p>{user.bio}</p>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Games</div>
            <div className="stat-value">{user.gamesCount || 0}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Matches</div>
            <div className="stat-value">{user.matchesCount || 0}</div>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn btn-primary">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
