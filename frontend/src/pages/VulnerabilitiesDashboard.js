import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Shield, Sparkles, Loader2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VulnerabilitiesDashboard = () => {
  const { workspaceId } = useOutletContext();
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVulnerabilities();
  }, [workspaceId]);

  const fetchVulnerabilities = async () => {
    try {
      const response = await axios.get(`${API}/vulnerabilities/${workspaceId}`);
      setVulnerabilities(response.data);
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    }
  };

  const scanVulnerabilities = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/analyze`, { workspace_id: workspaceId, analysis_type: 'vulnerabilities' });
      toast.success('Security scan complete');
      await fetchVulnerabilities();
    } catch (error) {
      console.error('Error scanning vulnerabilities:', error);
      toast.error('Failed to scan vulnerabilities');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-destructive border-destructive/30';
      case 'medium':
        return 'text-accent border-accent/30';
      case 'low':
        return 'text-secondary border-secondary/30';
      default:
        return 'text-muted-foreground border-white/10';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" strokeWidth={1.5} />;
      case 'low':
        return <Info className="w-5 h-5" strokeWidth={1.5} />;
      default:
        return <Info className="w-5 h-5" strokeWidth={1.5} />;
    }
  };

  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;

  return (
    <div data-testid="vulnerabilities-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="vulnerabilities-title">
            Security
          </h1>
          <p className="text-base text-muted-foreground font-mono">Vulnerability detection and analysis</p>
        </div>
        {vulnerabilities.length === 0 && (
          <button
            onClick={scanVulnerabilities}
            disabled={loading}
            className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            data-testid="scan-vulnerabilities-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                Scan
              </>
            )}
          </button>
        )}
      </div>

      {vulnerabilities.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0A0A0A] border border-white/10 rounded-xl" data-testid="empty-vulnerabilities">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No security scan yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Run a security scan to detect vulnerabilities</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 bg-[#0A0A0A] border border-white/10 rounded-xl" data-testid="loading-vulnerabilities">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-sm font-mono text-muted-foreground">Scanning for vulnerabilities...</p>
          </div>
        </div>
      )}

      {vulnerabilities.length > 0 && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="vulnerability-summary">
            <div className="bg-[#0A0A0A] border border-destructive/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" strokeWidth={1.5} />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">High</span>
              </div>
              <div className="text-4xl font-black tracking-tighter mb-2" data-testid="high-count">{highCount}</div>
              <p className="text-sm text-muted-foreground font-mono">Critical Issues</p>
            </div>

            <div className="bg-[#0A0A0A] border border-accent/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 text-accent" strokeWidth={1.5} />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Medium</span>
              </div>
              <div className="text-4xl font-black tracking-tighter mb-2" data-testid="medium-count">{mediumCount}</div>
              <p className="text-sm text-muted-foreground font-mono">Moderate Issues</p>
            </div>

            <div className="bg-[#0A0A0A] border border-secondary/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Info className="w-8 h-8 text-secondary" strokeWidth={1.5} />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Low</span>
              </div>
              <div className="text-4xl font-black tracking-tighter mb-2" data-testid="low-count">{lowCount}</div>
              <p className="text-sm text-muted-foreground font-mono">Minor Issues</p>
            </div>
          </div>

          {/* Vulnerabilities List */}
          <div className="space-y-3" data-testid="vulnerabilities-list">
            {vulnerabilities.map((vuln) => (
              <div
                key={vuln.id}
                className={`bg-[#0A0A0A] border rounded-xl p-6 hover:border-opacity-50 transition-colors ${getSeverityColor(vuln.severity)}`}
                data-testid={`vulnerability-${vuln.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className={getSeverityColor(vuln.severity)}>
                    {getSeverityIcon(vuln.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold tracking-tight">{vuln.title}</h3>
                      <span className={`text-xs font-mono uppercase px-2 py-1 bg-white/5 border rounded ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{vuln.description}</p>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                      <span>📄 {vuln.file_path}</span>
                      {vuln.line_number && <span>Line {vuln.line_number}</span>}
                      <span className="ml-auto capitalize">{vuln.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VulnerabilitiesDashboard;