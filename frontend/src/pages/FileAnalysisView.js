import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FileText, Folder, ChevronRight, ChevronDown, Shield, BookOpen, Gauge, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import mermaid from 'mermaid';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

const FileTreeNode = ({ node, onFileSelect, selectedPath }) => {
  const [expanded, setExpanded] = useState(true);
  const isDirectory = node.type === 'directory';
  const isSelected = selectedPath === node.path;

  return (
    <div>
      <div
        onClick={() => {
          if (isDirectory) {
            setExpanded(!expanded);
          } else {
            onFileSelect(node.path);
          }
        }}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors ${
          isSelected ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'
        }`}
        data-testid={`file-tree-${node.path}`}
      >
        {isDirectory && (
          <span className="w-4">
            {expanded ? <ChevronDown className="w-4 h-4" strokeWidth={1.5} /> : <ChevronRight className="w-4 h-4" strokeWidth={1.5} />}
          </span>
        )}
        {!isDirectory && <span className="w-4" />}
        {isDirectory ? <Folder className="w-4 h-4" strokeWidth={1.5} /> : <FileText className="w-4 h-4" strokeWidth={1.5} />}
        <span className="text-sm font-mono">{node.name}</span>
      </div>
      {isDirectory && expanded && node.children && (
        <div className="ml-4">
          {node.children.map((child, idx) => (
            <FileTreeNode key={idx} node={child} onFileSelect={onFileSelect} selectedPath={selectedPath} />
          ))}
        </div>
      )}
    </div>
  );
};

const HealthCard = ({ data }) => {
  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'B') return 'text-success border-success/30';
    if (grade === 'C') return 'text-accent border-accent/30';
    return 'text-destructive border-destructive/30';
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6" data-testid="health-card">
      <div className={`bg-[#0A0A0A] border rounded-xl p-4 ${getGradeColor(data.security_grade)}`}>
        <div className="flex items-center justify-between mb-2">
          <Shield className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-3xl font-black">{data.security_grade}</span>
        </div>
        <p className="text-xs font-mono uppercase">Security</p>
        <p className="text-xs text-muted-foreground mt-2">{data.justification.security}</p>
      </div>

      <div className={`bg-[#0A0A0A] border rounded-xl p-4 ${getGradeColor(data.readability_grade)}`}>
        <div className="flex items-center justify-between mb-2">
          <BookOpen className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-3xl font-black">{data.readability_grade}</span>
        </div>
        <p className="text-xs font-mono uppercase">Readability</p>
        <p className="text-xs text-muted-foreground mt-2">{data.justification.readability}</p>
      </div>

      <div className={`bg-[#0A0A0A] border rounded-xl p-4 ${getGradeColor(data.performance_grade)}`}>
        <div className="flex items-center justify-between mb-2">
          <Gauge className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-3xl font-black">{data.performance_grade}</span>
        </div>
        <p className="text-xs font-mono uppercase">Performance</p>
        <p className="text-xs text-muted-foreground mt-2">{data.justification.performance}</p>
      </div>
    </div>
  );
};

const CodeMap = ({ data, onHotspotClick }) => {
  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-destructive';
    if (severity === 'high') return 'bg-accent';
    if (severity === 'medium') return 'bg-secondary';
    return 'bg-white/20';
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6" data-testid="code-map">
      <h3 className="text-lg font-semibold mb-4">Interactive Code Map</h3>
      <div className="relative h-96 bg-black/50 rounded-lg border border-white/10 p-4">
        <div className="absolute left-4 top-4 bottom-4 w-1 bg-white/10" />
        {data.hotspots.map((hotspot, idx) => {
          const topPercent = (hotspot.line_start / data.total_lines) * 100;
          const heightPercent = ((hotspot.line_end - hotspot.line_start) / data.total_lines) * 100;
          
          return (
            <div
              key={idx}
              onClick={() => onHotspotClick(hotspot)}
              className={`absolute left-4 w-2 rounded cursor-pointer hover:w-4 transition-all ${
                getSeverityColor(hotspot.severity)
              } ${hotspot.severity === 'critical' ? 'animate-pulse-glow' : ''}`}
              style={{
                top: `${topPercent}%`,
                height: `${Math.max(heightPercent, 2)}%`,
              }}
              data-testid={`hotspot-${idx}`}
              title={hotspot.title}
            />
          );
        })}
        <div className="ml-8 space-y-2">
          {data.hotspots.map((hotspot, idx) => (
            <div
              key={idx}
              onClick={() => onHotspotClick(hotspot)}
              className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10"
              data-testid={`hotspot-item-${idx}`}
            >
              <AlertCircle className={`w-5 h-5 ${hotspot.severity === 'critical' ? 'text-destructive' : hotspot.severity === 'high' ? 'text-accent' : 'text-secondary'}`} strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{hotspot.title}</p>
                <p className="text-xs text-muted-foreground">Lines {hotspot.line_start}-{hotspot.line_end}</p>
              </div>
              <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${getSeverityColor(hotspot.severity)} bg-opacity-20`}>
                {hotspot.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FileAnalysisView = () => {
  const { workspaceId } = useOutletContext();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [fileTree, setFileTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [healthCard, setHealthCard] = useState(null);
  const [codeMap, setCodeMap] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedRepo) {
      fetchFileTree();
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

  const fetchFileTree = async () => {
    try {
      const response = await axios.get(`${API}/repositories/${workspaceId}/${selectedRepo.id}/tree`);
      setFileTree(response.data);
    } catch (error) {
      console.error('Error fetching file tree:', error);
      toast.error('Failed to load file tree');
    }
  };

  const handleFileSelect = async (filePath) => {
    setSelectedFile(filePath);
    setLoading(true);
    try {
      const [healthResponse, mapResponse] = await Promise.all([
        axios.get(`${API}/health-card/${workspaceId}/${selectedRepo.id}?file_path=${encodeURIComponent(filePath)}`),
        axios.get(`${API}/code-map/${workspaceId}/${selectedRepo.id}?file_path=${encodeURIComponent(filePath)}`)
      ]);
      setHealthCard(healthResponse.data);
      setCodeMap(mapResponse.data);
    } catch (error) {
      console.error('Error fetching file analysis:', error);
      toast.error('Failed to analyze file');
    } finally {
      setLoading(false);
    }
  };

  const handleHotspotClick = (hotspot) => {
    setSelectedHotspot(hotspot);
  };

  return (
    <div data-testid="file-analysis-view" className="h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="file-analysis-title">
            Code Analysis
          </h1>
          <p className="text-base text-muted-foreground font-mono">Folder-first navigation with AI insights</p>
        </div>
        {selectedRepo && (
          <select
            value={selectedRepo.id}
            onChange={(e) => {
              const repo = repositories.find(r => r.id === e.target.value);
              setSelectedRepo(repo);
            }}
            className="bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono"
            data-testid="repo-selector"
          >
            {repositories.map(repo => (
              <option key={repo.id} value={repo.id}>{repo.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-4 h-full">
        <div className="w-80 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 overflow-y-auto" data-testid="file-tree-panel">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">File Tree</h3>
          {fileTree ? (
            <FileTreeNode node={fileTree} onFileSelect={handleFileSelect} selectedPath={selectedFile} />
          ) : (
            <p className="text-xs text-muted-foreground font-mono">Loading...</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedFile ? (
            loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-mono text-muted-foreground">Analyzing file...</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-1">{selectedFile}</h2>
                  <p className="text-sm text-muted-foreground font-mono">Impact Score & Health Card</p>
                </div>

                {healthCard && <HealthCard data={healthCard} />}
                {codeMap && <CodeMap data={codeMap} onHotspotClick={handleHotspotClick} />}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-20 h-20 text-muted-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold mb-2">Select a file to analyze</h3>
              <p className="text-sm text-muted-foreground">Choose a file from the tree to view its health card and code map</p>
            </div>
          )}
        </div>
      </div>

      {selectedHotspot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedHotspot(null)}>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()} data-testid="hotspot-modal">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedHotspot.title}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${
                    selectedHotspot.severity === 'critical' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                    selectedHotspot.severity === 'high' ? 'bg-accent/20 text-accent border border-accent/30' :
                    'bg-secondary/20 text-secondary border border-secondary/30'
                  }`}>
                    {selectedHotspot.severity}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{selectedHotspot.phase}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-muted-foreground hover:text-white"
                data-testid="close-modal-btn"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground font-mono mb-2">Lines {selectedHotspot.line_start}-{selectedHotspot.line_end}</p>
              <p className="text-base leading-relaxed">{selectedHotspot.description}</p>
            </div>
            <div className="bg-black/50 rounded-lg p-4 border border-white/10">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Category</p>
              <p className="text-sm font-mono capitalize">{selectedHotspot.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAnalysisView;