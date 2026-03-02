import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Network, Sparkles, Loader2, Box } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ArchitectureDashboard = () => {
  const { workspaceId } = useOutletContext();
  const [architecture, setArchitecture] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArchitecture();
  }, [workspaceId]);

  const fetchArchitecture = async () => {
    try {
      const response = await axios.get(`${API}/architecture/${workspaceId}`);
      if (response.data) {
        setArchitecture(response.data);
      }
    } catch (error) {
      console.error('Error fetching architecture:', error);
    }
  };

  const generateArchitecture = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/analyze`, { workspace_id: workspaceId, analysis_type: 'architecture' });
      toast.success('Architecture analysis complete');
      await fetchArchitecture();
    } catch (error) {
      console.error('Error generating architecture:', error);
      toast.error('Failed to generate architecture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="architecture-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="architecture-title">
            Architecture
          </h1>
          <p className="text-base text-muted-foreground font-mono">System design and component analysis</p>
        </div>
        {!architecture && (
          <button
            onClick={generateArchitecture}
            disabled={loading}
            className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            data-testid="generate-architecture-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                Generate
              </>
            )}
          </button>
        )}
      </div>

      {!architecture && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0A0A0A] border border-white/10 rounded-xl" data-testid="empty-architecture">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Network className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No architecture analysis yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Generate AI-powered architecture insights</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 bg-[#0A0A0A] border border-white/10 rounded-xl" data-testid="loading-architecture">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-sm font-mono text-muted-foreground">Analyzing system architecture...</p>
          </div>
        </div>
      )}

      {architecture && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Architecture Analysis */}
          <div className="md:col-span-12 bg-[#0A0A0A] border border-white/10 rounded-xl p-6" data-testid="architecture-analysis">
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h2 className="text-2xl font-semibold tracking-tight">System Analysis</h2>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">{architecture.analysis}</p>
          </div>

          {/* Tech Stack */}
          <div className="md:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-xl p-6" data-testid="tech-stack">
            <h2 className="text-xl font-semibold tracking-tight mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 gap-3">
              {architecture.tech_stack.map((tech, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary/30 transition-colors"
                  data-testid={`tech-${index}`}
                >
                  <span className="text-sm font-mono">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Components */}
          <div className="md:col-span-5 bg-[#0A0A0A] border border-white/10 rounded-xl p-6" data-testid="components">
            <h2 className="text-xl font-semibold tracking-tight mb-4">Components</h2>
            <div className="space-y-3">
              {architecture.components.map((component, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-secondary/30 transition-colors"
                  data-testid={`component-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <Box className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{component.name}</h3>
                      <p className="text-xs text-muted-foreground">{component.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureDashboard;