import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Code2, Sparkles, Loader2, TrendingUp, Gauge, FileCode } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalysisDashboard = () => {
  const { workspaceId } = useOutletContext();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [workspaceId]);

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get(`${API}/code-analysis/${workspaceId}`);
      if (response.data) {
        setAnalysis(response.data);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/analyze`, { workspace_id: workspaceId, analysis_type: 'code' });
      toast.success('Code analysis complete');
      await fetchAnalysis();
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="analysis-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="analysis-title">
            Code Analysis
          </h1>
          <p className="text-base text-muted-foreground font-mono">Quality metrics and insights</p>
        </div>
        {!analysis && (
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            data-testid="generate-analysis-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                Analyze
              </>
            )}
          </button>
        )}
      </div>

      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0A0A0A] border border-white/10 rounded-xl" data-testid="empty-analysis">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Code2 className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No code analysis yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Analyze your codebase for quality insights</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 bg-[#0A0A0A] border border-white/10 rounded-xl" data-testid="loading-analysis">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-sm font-mono text-muted-foreground">Analyzing code quality...</p>
          </div>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Metrics Cards */}
          <div className="md:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-colors" data-testid="files-analyzed-metric">
            <div className="flex items-center justify-between mb-4">
              <FileCode className="w-8 h-8 text-primary" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Files</span>
            </div>
            <div className="text-4xl font-black tracking-tighter mb-2">{analysis.files_analyzed}</div>
            <p className="text-sm text-muted-foreground font-mono">Files Analyzed</p>
          </div>

          <div className="md:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-secondary/30 transition-colors" data-testid="quality-score-metric">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-secondary" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Quality</span>
            </div>
            <div className="text-4xl font-black tracking-tighter mb-2">{analysis.code_quality_score}/10</div>
            <p className="text-sm text-muted-foreground font-mono">Code Quality</p>
          </div>

          <div className="md:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-accent/30 transition-colors" data-testid="complexity-score-metric">
            <div className="flex items-center justify-between mb-4">
              <Gauge className="w-8 h-8 text-accent" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Complexity</span>
            </div>
            <div className="text-4xl font-black tracking-tighter mb-2">{analysis.complexity_score}/10</div>
            <p className="text-sm text-muted-foreground font-mono">Complexity Score</p>
          </div>

          {/* Insights */}
          <div className="md:col-span-12 bg-[#0A0A0A] border border-white/10 rounded-xl p-6" data-testid="insights-section">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-success" strokeWidth={1.5} />
              <h2 className="text-2xl font-semibold tracking-tight">Key Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-success/30 transition-colors"
                  data-testid={`insight-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm font-mono leading-relaxed">{insight}</p>
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

export default AnalysisDashboard;