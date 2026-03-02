import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Bot, Shield, Code2, Zap, Github, Gitlab } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      
      <nav className="relative z-10 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center neon-glow" data-testid="logo">
            <Bot className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">AI-GILE</span>
        </div>
        <button
          onClick={() => navigate('/workspaces')}
          className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all hover:scale-105 active:scale-95"
          data-testid="get-started-btn"
        >
          Get Started
        </button>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-20 md:pt-32 pb-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-secondary px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              Revolutionary AI Framework
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent" data-testid="hero-title">
            Build Products at<br />Lightning Speed
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto mb-12">
            Transform 6-month development cycles into single iterations with AI-powered agents.
            Architecture, coding, testing, and deployment—all automated.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/workspaces')}
              className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-8 py-4 rounded-md neon-glow transition-all hover:scale-105 active:scale-95"
              data-testid="cta-btn"
            >
              Launch Platform
            </button>
            <button
              className="bg-transparent border border-secondary text-secondary hover:bg-secondary/10 font-mono uppercase tracking-wider px-8 py-4 rounded-md transition-all"
              data-testid="demo-btn"
            >
              View Demo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors relative overflow-hidden group" data-testid="feature-architecture">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <Network className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold tracking-tight mb-2">Architecture AI</h3>
              <p className="text-sm text-muted-foreground">Auto-generate system architecture from repositories</p>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors relative overflow-hidden group" data-testid="feature-analysis">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <Code2 className="w-8 h-8 text-secondary mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold tracking-tight mb-2">Code Analysis</h3>
              <p className="text-sm text-muted-foreground">Deep insights into code quality and complexity</p>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors relative overflow-hidden group" data-testid="feature-security">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <Shield className="w-8 h-8 text-accent mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold tracking-tight mb-2">Security Scan</h3>
              <p className="text-sm text-muted-foreground">Detect vulnerabilities before deployment</p>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors relative overflow-hidden group" data-testid="feature-agents">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <Bot className="w-8 h-8 text-success mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold tracking-tight mb-2">AI Agents</h3>
              <p className="text-sm text-muted-foreground">DevOps, Testing, Design, and more agents</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 md:p-12 relative overflow-hidden" data-testid="integrations-section">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent" />
          <div className="relative">
            <div className="text-center mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Integrations</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4">Connect Your Workflow</h2>
              <p className="text-base text-muted-foreground">Seamless integration with your favorite tools</p>
            </div>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors" data-testid="github-integration">
                <Github className="w-8 h-8" strokeWidth={1.5} />
                <span className="font-mono text-sm">GitHub</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors" data-testid="gitlab-integration">
                <Gitlab className="w-8 h-8" strokeWidth={1.5} />
                <span className="font-mono text-sm">GitLab</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors" data-testid="ai-integration">
                <Zap className="w-8 h-8" strokeWidth={1.5} />
                <span className="font-mono text-sm">AI Models</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <p className="text-center text-sm font-mono text-muted-foreground">
            © 2026 AI-gile Framework. Revolutionizing development workflows.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;