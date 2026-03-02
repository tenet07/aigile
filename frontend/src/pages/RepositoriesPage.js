import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Plus, Github, Gitlab, Link } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RepositoriesPage = () => {
  const { workspaceId } = useOutletContext();
  const [repositories, setRepositories] = useState([]);
  const [showConnect, setShowConnect] = useState(false);
  const [newRepo, setNewRepo] = useState({ name: '', url: '', platform: 'github' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, [workspaceId]);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get(`${API}/repositories/${workspaceId}`);
      setRepositories(response.data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const connectRepository = async () => {
    if (!newRepo.name.trim() || !newRepo.url.trim()) {
      toast.error('Repository name and URL are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/repositories`, { workspace_id: workspaceId, ...newRepo });
      toast.success('Repository connected successfully');
      setShowConnect(false);
      setNewRepo({ name: '', url: '', platform: 'github' });
      await fetchRepositories();
    } catch (error) {
      console.error('Error connecting repository:', error);
      toast.error('Failed to connect repository');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'github':
        return <Github className="w-6 h-6" strokeWidth={1.5} />;
      case 'gitlab':
        return <Gitlab className="w-6 h-6" strokeWidth={1.5} />;
      default:
        return <Link className="w-6 h-6" strokeWidth={1.5} />;
    }
  };

  return (
    <div data-testid="repositories-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="repositories-title">
            Repositories
          </h1>
          <p className="text-base text-muted-foreground font-mono">Connected code repositories</p>
        </div>
        <button
          onClick={() => setShowConnect(true)}
          className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          data-testid="connect-repo-btn"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          Connect
        </button>
      </div>

      {showConnect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" data-testid="connect-repo-modal">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Connect Repository</h2>
            <input
              type="text"
              placeholder="Repository Name"
              value={newRepo.name}
              onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
              className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono placeholder:text-white/20 transition-colors mb-4"
              data-testid="repo-name-input"
            />
            <input
              type="text"
              placeholder="Repository URL"
              value={newRepo.url}
              onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
              className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono placeholder:text-white/20 transition-colors mb-4"
              data-testid="repo-url-input"
            />
            <select
              value={newRepo.platform}
              onChange={(e) => setNewRepo({ ...newRepo, platform: e.target.value })}
              className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono mb-6"
              data-testid="repo-platform-select"
            >
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={connectRepository}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md transition-all disabled:opacity-50"
                data-testid="confirm-connect-btn"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
              <button
                onClick={() => setShowConnect(false)}
                className="flex-1 bg-transparent border border-white/20 text-white hover:bg-white/5 font-mono uppercase tracking-wider px-6 py-3 rounded-md transition-all"
                data-testid="cancel-connect-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {repositories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="repositories-grid">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
              data-testid={`repo-card-${repo.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                  {getPlatformIcon(repo.platform)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-tight mb-1">{repo.name}</h3>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-secondary hover:underline font-mono mb-3 inline-block"
                  >
                    {repo.url}
                  </a>
                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                    <span className="capitalize">{repo.platform}</span>
                    <span>•</span>
                    <span className="capitalize">{repo.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0A0A0A] border border-white/10 rounded-xl" data-testid="empty-repositories">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Github className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No repositories connected</h3>
          <p className="text-sm text-muted-foreground mb-4">Connect your first repository to start analyzing</p>
          <button
            onClick={() => setShowConnect(true)}
            className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all"
            data-testid="empty-connect-btn"
          >
            Connect Repository
          </button>
        </div>
      )}
    </div>
  );
};

export default RepositoriesPage;