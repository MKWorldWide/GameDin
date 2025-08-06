
import React, { useState, useEffect, useCallback } from 'react';
import { Lobby } from '../types';
import * as nexus from '../services/nexus';
import SearchBar from '../components/SearchBar';
import LobbyCard from '../components/lobby/LobbyCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MatchmakingPage: React.FC = () => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('any');
  const [playstyleFilter, setPlaystyleFilter] = useState('any');
  
  const skillLevels = ['Any', 'Beginner', 'Casual', 'Veteran', 'Divine', 'Mythic+'];
  const playstyles = ['Any', 'Competitive', 'Co-op', 'Social'];

  const fetchLobbies = useCallback(async () => {
    setIsLoading(true);
    try {
        const filters = {
            query: searchQuery,
            skill: skillFilter,
            playstyle: playstyleFilter
        };
        const foundLobbies = await nexus.findLobbies(filters);
        setLobbies(foundLobbies);
    } catch (e) {
        console.error("Failed to fetch lobbies", e);
    } finally {
        setIsLoading(false);
    }
  }, [searchQuery, skillFilter, playstyleFilter]);

  useEffect(() => {
      fetchLobbies();
  }, [fetchLobbies]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Universal Lobby</h1>
        <p className="text-secondary mt-1">Find your next adventure. Join allies across all networks.</p>
      </header>
      
      <div className="p-4 bg-secondary rounded-lg border border-primary space-y-4">
        <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search by game or title..."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="skill" className="block text-sm font-medium text-secondary mb-1">Skill Level</label>
                <select id="skill" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="block w-full rounded-md border-0 bg-tertiary py-2.5 px-3 text-primary ring-1 ring-inset ring-border-primary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm">
                    {skillLevels.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="playstyle" className="block text-sm font-medium text-secondary mb-1">Playstyle</label>
                <select id="playstyle" value={playstyleFilter} onChange={(e) => setPlaystyleFilter(e.target.value)} className="block w-full rounded-md border-0 bg-tertiary py-2.5 px-3 text-primary ring-1 ring-inset ring-border-primary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm">
                    {playstyles.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                </select>
            </div>
        </div>
      </div>
      
      {isLoading ? (
          <LoadingSpinner />
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lobbies.length > 0 ? (
                lobbies.map(lobby => <LobbyCard key={lobby.id} lobby={lobby} />)
            ) : (
                <div className="text-center py-12 text-secondary bg-secondary/50 rounded-lg col-span-full">
                    <h3 className="text-xl font-semibold">No Lobbies Found</h3>
                    <p className="mt-2">Try adjusting your filters or create a new lobby.</p>
                </div>
            )}
          </div>
      )}
    </div>
  );
};

export default MatchmakingPage;
