import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Folder, Bot, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkspacesPage = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`${API}/workspaces`);
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/workspaces`, newWorkspace);
      setWorkspaces([...workspaces, response.data]);
      setShowCreate(false);
      setNewWorkspace({ name: '', description: '' });
      toast.success('Workspace created successfully');
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="workspaces-title">
              Workspaces
            </h1>
            <p className="text-base text-muted-foreground font-mono">Manage your development environments</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            data-testid="create-workspace-btn"
          >
            <Plus className="w-5 h-5" strokeWidth={1.5} />
            Create
          </button>
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" data-testid="create-workspace-modal">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Create Workspace</h2>
              <input
                type="text"
                placeholder="Workspace Name"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono placeholder:text-white/20 transition-colors mb-4"
                data-testid="workspace-name-input"
              />
              <textarea
                placeholder="Description (optional)"
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono placeholder:text-white/20 transition-colors mb-6 h-24 resize-none"
                data-testid="workspace-description-input"
              />
              <div className="flex gap-3">
                <button
                  onClick={createWorkspace}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md transition-all disabled:opacity-50"
                  data-testid="confirm-create-btn"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-transparent border border-white/20 text-white hover:bg-white/5 font-mono uppercase tracking-wider px-6 py-3 rounded-md transition-all"
                  data-testid="cancel-create-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="workspaces-grid">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => navigate(`/workspace/${workspace.id}/architecture`)}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors cursor-pointer group"
              data-testid={`workspace-card-${workspace.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Folder className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-2">{workspace.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {workspace.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" strokeWidth={1.5} />
                  <span>{workspace.repos_count || 0} Repos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bot className="w-4 h-4" strokeWidth={1.5} />
                  <span>{workspace.agents_count || 0} Agents</span>
                </div>
              </div>
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20" data-testid="empty-state">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first workspace to get started</p>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all"
                data-testid="empty-state-create-btn"
              >
                Create Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspacesPage;