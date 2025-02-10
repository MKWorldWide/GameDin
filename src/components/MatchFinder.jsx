import { useState } from 'react';
import useStore from '../store/useStore';

const MatchFinder = () => {
  const [filters, setFilters] = useState({
    game: '',
    skill: 'any',
    region: 'any',
  });

  const setMatches = useStore(state => state.setMatches);

  const handleSearch = () => {
    // Simulated match finding - replace with actual API call
    const mockMatches = [
      { id: 1, username: 'Player1', game: 'Fortnite', skill: 'Pro', region: 'NA' },
      { id: 2, username: 'Player2', game: 'Valorant', skill: 'Intermediate', region: 'EU' },
    ];
    setMatches(mockMatches);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Find Gaming Partners</h2>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Game</span>
          </label>
          <input
            type="text"
            placeholder="Enter game name"
            className="input input-bordered"
            value={filters.game}
            onChange={e => setFilters({ ...filters, game: e.target.value })}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Skill Level</span>
          </label>
          <select
            className="select select-bordered"
            value={filters.skill}
            onChange={e => setFilters({ ...filters, skill: e.target.value })}
          >
            <option value="any">Any Skill Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Region</span>
          </label>
          <select
            className="select select-bordered"
            value={filters.region}
            onChange={e => setFilters({ ...filters, region: e.target.value })}
          >
            <option value="any">Any Region</option>
            <option value="na">North America</option>
            <option value="eu">Europe</option>
            <option value="asia">Asia</option>
          </select>
        </div>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary" onClick={handleSearch}>
            Find Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchFinder;
