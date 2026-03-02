import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Network, Code2, Shield, Trello, GitBranch, Bot, Menu, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardLayout = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [workspace, setWorkspace] = useState(null);
  const [agents, setAgents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [criticalIssues, setCriticalIssues] = useState(0);

  useEffect(() => {
    fetchWorkspace();
    fetchAgents();
    fetchCriticalIssues();
  }, [workspaceId]);

  const fetchCriticalIssues = async () => {
    try {
      const reposResponse = await axios.get(`${API}/repositories/${workspaceId}`);
      if (reposResponse.data.length > 0) {
        const issuesResponse = await axios.get(`${API}/critical-issues/${workspaceId}/${reposResponse.data[0].id}`);
        setCriticalIssues(issuesResponse.data.count);
      }
    } catch (error) {
      console.error('Error fetching critical issues:', error);
    }
  };

  const fetchWorkspace = async () => {
    try {
      const response = await axios.get(`${API}/workspaces/${workspaceId}`);
      setWorkspace(response.data);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      toast.error('Failed to load workspace');
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API}/agents/${workspaceId}`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const createAgent = async (agentType) => {
    try {
      await axios.post(`${API}/agents`, { workspace_id: workspaceId, agent_type: agentType });
      toast.success(`${agentType} agent activated`);
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to activate agent');
    }
  };

  const navItems = [
    { path: 'audit', icon: Shield, label: 'Pre-Sprint Audit', testId: 'nav-audit' },
    { path: 'architecture', icon: Network, label: 'Architecture', testId: 'nav-architecture' },
    { path: 'analysis', icon: Code2, label: 'Code Metrics', testId: 'nav-analysis' },
    { path: 'vulnerabilities', icon: Shield, label: 'Security Scan', testId: 'nav-security' },
    { path: 'board', icon: Trello, label: 'Task Board', testId: 'nav-board' },
    { path: 'repos', icon: GitBranch, label: 'Repositories', testId: 'nav-repos' },
  ];

  const agentTypes = ['DevOps', 'Testing', 'Coding', 'Design', 'Tech Planning', 'System Architect', 'Scrum Master'];

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      
      {/* Sidebar */}
      <div className={`relative z-20 bg-[#0A0A0A] border-r border-white/10 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center neon-glow">
                <Bot className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">AI-GILE</span>
            </div>
          </div>

          {workspace && (
            <div className="mb-8 pb-6 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Workspace</span>
              <h2 className="text-lg font-semibold mt-1" data-testid="workspace-name">{workspace.name}</h2>
            </div>
          )}

          <nav className="space-y-2 mb-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(`/workspace/${workspaceId}/${item.path}`)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                  isActive(item.path)
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
                data-testid={item.testId}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-mono text-sm">{item.label}</span>
                {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" strokeWidth={1.5} />}
              </button>
            ))}
          </nav>

          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Active Agents</span>
          </div>
          <div className="space-y-2" data-testid="agents-list">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-md"
                data-testid={`agent-${agent.agent_type}`}
              >
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm font-mono">{agent.agent_type}</span>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-xs text-muted-foreground font-mono px-4" data-testid="no-agents">No active agents</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Critical Issues Ticker */}
        {criticalIssues > 0 && (
          <div className="bg-destructive/20 border-b border-destructive/30 px-6 py-3" data-testid="critical-issues-ticker">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" strokeWidth={1.5} />
              <p className="text-sm font-mono">
                <span className="font-bold text-destructive">{criticalIssues}</span> critical system integrity issue{criticalIssues !== 1 ? 's' : ''} detected
              </p>
              <button
                onClick={() => navigate(`/workspace/${workspaceId}/vulnerabilities`)}
                className="ml-auto text-xs font-mono uppercase px-3 py-1 bg-destructive hover:bg-destructive/80 text-white rounded transition-colors"
                data-testid="view-issues-btn"
              >
                View Issues
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-white transition-colors"
            data-testid="toggle-sidebar-btn"
          >
            {sidebarOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => navigate('/workspaces')}
            className="text-sm font-mono text-muted-foreground hover:text-white transition-colors"
            data-testid="back-to-workspaces-btn"
          >
            ← Back to Workspaces
          </button>
        </div>
        
        <div className="p-6">
          <Outlet context={{ workspaceId, agents, createAgent, agentTypes }} />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;