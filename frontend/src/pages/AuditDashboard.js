import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Target, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuditDashboard = () => {
  const { workspaceId } = useOutletContext();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedRepo) {
      fetchAuditMatrix();
    }
  }, [selectedRepo]);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get(`${API}/repositories/${workspaceId}`);
      setRepositories(response.data);
      if (response.data.length > 0) {
        setSelectedRepo(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const fetchAuditMatrix = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/audit/matrix/${workspaceId}/${selectedRepo.id}`);
      setAuditItems(response.data);
    } catch (error) {
      console.error('Error fetching audit matrix:', error);
      toast.error('Failed to load audit matrix');
    } finally {
      setLoading(false);
    }
  };

  const quadrants = [
    {
      id: 'high_value_low_effort',
      title: 'High Value, Low Effort',
      subtitle: 'Quick Wins - Do First',
      icon: Zap,
      color: 'text-success border-success/30',
      bgColor: 'bg-success/10',
    },
    {
      id: 'high_value_high_effort',
      title: 'High Value, High Effort',
      subtitle: 'Major Projects',
      icon: Target,
      color: 'text-primary border-primary/30',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'low_value_low_effort',
      title: 'Low Value, Low Effort',
      subtitle: 'Fill-ins',
      icon: TrendingUp,
      color: 'text-secondary border-secondary/30',
      bgColor: 'bg-secondary/10',
    },
    {
      id: 'low_value_high_effort',
      title: 'Low Value, High Effort',
      subtitle: 'Time Sinks - Avoid',
      icon: AlertTriangle,
      color: 'text-accent border-accent/30',
      bgColor: 'bg-accent/10',
    },
  ];

  const getQuadrantItems = (quadrantId) => {
    return auditItems.filter(item => item.quadrant === quadrantId);
  };

  return (
    <div data-testid="audit-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="audit-title">
            Pre-Sprint Audit
          </h1>
          <p className="text-base text-muted-foreground font-mono">Effort vs. Value Matrix - System Integrity Focus</p>
        </div>
        {selectedRepo && (
          <select
            value={selectedRepo.id}
            onChange={(e) => {
              const repo = repositories.find(r => r.id === e.target.value);
              setSelectedRepo(repo);
            }}
            className="bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono"
            data-testid="audit-repo-selector"
          >
            {repositories.map(repo => (
              <option key={repo.id} value={repo.id}>{repo.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-muted-foreground">Loading audit matrix...</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {quadrants.map((quadrant) => {
              const items = getQuadrantItems(quadrant.id);
              const QuadrantIcon = quadrant.icon;

              return (
                <div
                  key={quadrant.id}
                  className={`bg-[#0A0A0A] border rounded-xl p-6 ${quadrant.color} ${quadrant.bgColor}`}
                  data-testid={`quadrant-${quadrant.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <QuadrantIcon className="w-6 h-6" strokeWidth={1.5} />
                        <h2 className="text-xl font-semibold">{quadrant.title}</h2>
                      </div>
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{quadrant.subtitle}</p>
                    </div>
                    <div className="text-3xl font-black">{items.length}</div>
                  </div>

                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground font-mono">No items in this quadrant</p>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-black/30 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                          data-testid={`audit-item-${item.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-mono font-semibold">{item.file_path}</p>
                            <span className="text-xs font-mono px-2 py-1 bg-white/10 rounded">
                              Priority: {item.priority_score}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs font-mono text-muted-foreground">
                            <span>Effort: {item.effort}</span>
                            <span>•</span>
                            <span>Value: {item.value}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#0A0A0A] border border-destructive/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" strokeWidth={1.5} />
              <h2 className="text-2xl font-semibold">System Integrity Priority</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              RCE (Remote Code Execution) and Injection flaws are automatically categorized as High Value.
              Address these issues first to maintain system security.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Critical Issues</p>
                <p className="text-3xl font-black text-destructive">
                  {auditItems.filter(i => i.priority_score >= 9).length}
                </p>
              </div>
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">High Priority</p>
                <p className="text-3xl font-black text-accent">
                  {auditItems.filter(i => i.priority_score >= 7 && i.priority_score < 9).length}
                </p>
              </div>
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Medium Priority</p>
                <p className="text-3xl font-black text-secondary">
                  {auditItems.filter(i => i.priority_score < 7).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;