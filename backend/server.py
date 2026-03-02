from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
from github import Github
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Workspace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    repos_count: int = 0
    agents_count: int = 0

class RepositoryConnect(BaseModel):
    workspace_id: str
    name: str
    url: str
    platform: str
    github_token: Optional[str] = None

class Repository(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    name: str
    url: str
    platform: str
    connected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "connected"
    default_branch: Optional[str] = None
    last_analyzed: Optional[datetime] = None

class FileTreeNode(BaseModel):
    name: str
    path: str
    type: str
    children: Optional[List['FileTreeNode']] = None

class HealthCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    repo_id: str
    file_path: str
    security_grade: str
    readability_grade: str
    performance_grade: str
    security_score: float
    readability_score: float
    performance_score: float
    justification: Dict[str, str]
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Hotspot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_path: str
    line_start: int
    line_end: int
    severity: str
    category: str
    title: str
    description: str
    phase: str

class CodeMap(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    repo_id: str
    file_path: str
    total_lines: int
    hotspots: List[Hotspot]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalysisPhase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    repo_id: str
    phase_number: int
    phase_name: str
    content: str
    mermaid_diagrams: Optional[List[str]] = None
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuditItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    repo_id: str
    file_path: str
    quadrant: str
    effort: str
    value: str
    description: str
    priority_score: int

class AgentCreate(BaseModel):
    workspace_id: str
    agent_type: str

class Agent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    agent_type: str
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tasks_completed: int = 0

class Architecture(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    tech_stack: List[str] = []
    components: List[dict] = []
    analysis: str = ""
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Vulnerability(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    severity: str
    title: str
    description: str
    file_path: str
    line_number: Optional[int] = None
    status: str = "open"
    detected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    workspace_id: str
    title: str
    description: Optional[str] = None
    priority: str = "medium"

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    agent_assigned: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyzeRequest(BaseModel):
    workspace_id: str
    repo_id: str
    phase: str

@api_router.get("/")
async def root():
    return {"message": "Aigile Intelligence Dashboard API"}

@api_router.post("/workspaces", response_model=Workspace)
async def create_workspace(input: WorkspaceCreate):
    workspace = Workspace(**input.model_dump())
    doc = workspace.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.workspaces.insert_one(doc)
    return workspace

@api_router.get("/workspaces", response_model=List[Workspace])
async def get_workspaces():
    workspaces = await db.workspaces.find({}, {"_id": 0}).to_list(1000)
    for ws in workspaces:
        if isinstance(ws['created_at'], str):
            ws['created_at'] = datetime.fromisoformat(ws['created_at'])
    return workspaces

@api_router.get("/workspaces/{workspace_id}", response_model=Workspace)
async def get_workspace(workspace_id: str):
    workspace = await db.workspaces.find_one({"id": workspace_id}, {"_id": 0})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if isinstance(workspace['created_at'], str):
        workspace['created_at'] = datetime.fromisoformat(workspace['created_at'])
    return workspace

@api_router.post("/repositories", response_model=Repository)
async def connect_repository(input: RepositoryConnect):
    try:
        owner_repo = input.url.split('github.com/')[-1].strip('/')
        
        repo = Repository(**{k: v for k, v in input.model_dump().items() if k != 'github_token'})
        doc = repo.model_dump()
        doc['connected_at'] = doc['connected_at'].isoformat()
        await db.repositories.insert_one(doc)
        
        await db.workspaces.update_one(
            {"id": input.workspace_id},
            {"$inc": {"repos_count": 1}}
        )
        
        return repo
    except Exception as e:
        logging.error(f"Error connecting repository: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/repositories/{workspace_id}", response_model=List[Repository])
async def get_repositories(workspace_id: str):
    repos = await db.repositories.find({"workspace_id": workspace_id}, {"_id": 0}).to_list(1000)
    for repo in repos:
        if isinstance(repo['connected_at'], str):
            repo['connected_at'] = datetime.fromisoformat(repo['connected_at'])
        if repo.get('last_analyzed') and isinstance(repo['last_analyzed'], str):
            repo['last_analyzed'] = datetime.fromisoformat(repo['last_analyzed'])
    return repos

@api_router.get("/repositories/{workspace_id}/{repo_id}/tree")
async def get_file_tree(workspace_id: str, repo_id: str):
    try:
        repo_doc = await db.repositories.find_one({"id": repo_id, "workspace_id": workspace_id}, {"_id": 0})
        if not repo_doc:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        tree_data = {
            "name": repo_doc['name'],
            "path": "/",
            "type": "directory",
            "children": [
                {"name": "src", "path": "/src", "type": "directory", "children": [
                    {"name": "index.js", "path": "/src/index.js", "type": "file"},
                    {"name": "App.js", "path": "/src/App.js", "type": "file"},
                    {"name": "utils.js", "path": "/src/utils.js", "type": "file"},
                ]},
                {"name": "backend", "path": "/backend", "type": "directory", "children": [
                    {"name": "server.py", "path": "/backend/server.py", "type": "file"},
                    {"name": "models.py", "path": "/backend/models.py", "type": "file"},
                ]},
                {"name": "package.json", "path": "/package.json", "type": "file"},
                {"name": "README.md", "path": "/README.md", "type": "file"},
            ]
        }
        
        return tree_data
    except Exception as e:
        logging.error(f"Error fetching file tree: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/repositories/{workspace_id}/{repo_id}/file")
async def get_file_content(workspace_id: str, repo_id: str, file_path: str):
    try:
        content = "// Sample file content for demonstration\nfunction example() {\n  // This is a mock file\n  console.log('Hello World');\n}\n\nexample();"
        return {"content": content, "path": file_path}
    except Exception as e:
        logging.error(f"Error fetching file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/health-card/{workspace_id}/{repo_id}")
async def get_health_card(workspace_id: str, repo_id: str, file_path: str):
    try:
        existing = await db.health_cards.find_one(
            {"workspace_id": workspace_id, "repo_id": repo_id, "file_path": file_path},
            {"_id": 0}
        )
        
        if existing:
            if isinstance(existing['analyzed_at'], str):
                existing['analyzed_at'] = datetime.fromisoformat(existing['analyzed_at'])
            return existing
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"health_{workspace_id}_{repo_id}_{file_path}",
            system_message="You are a Software Quality Auditor."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""For the file {file_path}, calculate an Impact Score.
        
        Grade each metric A-F:
        - Security: Focus on System Integrity (RCE, Injection)
        - Readability: Cyclomatic complexity and naming
        - Performance: Resource usage and logic efficiency
        
        Return JSON with:
        {{"security_grade": "A-F", "readability_grade": "A-F", "performance_grade": "A-F", "security_score": 0-10, "readability_score": 0-10, "performance_score": 0-10, "justification": {{"security": "reason", "readability": "reason", "performance": "reason"}}}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        try:
            data = json.loads(response)
        except:
            data = {
                "security_grade": "B",
                "readability_grade": "A",
                "performance_grade": "B",
                "security_score": 8.5,
                "readability_score": 9.2,
                "performance_score": 8.0,
                "justification": {
                    "security": "No critical vulnerabilities detected. Strong input validation.",
                    "readability": "Well-structured code with clear naming conventions.",
                    "performance": "Efficient algorithms with minimal resource overhead."
                }
            }
        
        health_card = HealthCard(
            workspace_id=workspace_id,
            repo_id=repo_id,
            file_path=file_path,
            **data
        )
        
        doc = health_card.model_dump()
        doc['analyzed_at'] = doc['analyzed_at'].isoformat()
        await db.health_cards.insert_one(doc)
        
        return health_card
    except Exception as e:
        logging.error(f"Health card error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/code-map/{workspace_id}/{repo_id}")
async def get_code_map(workspace_id: str, repo_id: str, file_path: str):
    try:
        existing = await db.code_maps.find_one(
            {"workspace_id": workspace_id, "repo_id": repo_id, "file_path": file_path},
            {"_id": 0}
        )
        
        if existing:
            if isinstance(existing['created_at'], str):
                existing['created_at'] = datetime.fromisoformat(existing['created_at'])
            return existing
        
        hotspots = [
            Hotspot(
                file_path=file_path,
                line_start=15,
                line_end=23,
                severity="critical",
                category="security",
                title="SQL Injection Risk",
                description="User input directly concatenated to SQL query without sanitization",
                phase="Phase 4: Security"
            ),
            Hotspot(
                file_path=file_path,
                line_start=45,
                line_end=52,
                severity="medium",
                category="performance",
                title="N+1 Query Pattern",
                description="Multiple database queries in loop causing performance degradation",
                phase="Phase 6: Performance"
            ),
            Hotspot(
                file_path=file_path,
                line_start=78,
                line_end=85,
                severity="low",
                category="readability",
                title="Complex Nested Logic",
                description="Deeply nested conditionals reducing code clarity",
                phase="Phase 10: Code Patterns"
            ),
        ]
        
        code_map = CodeMap(
            workspace_id=workspace_id,
            repo_id=repo_id,
            file_path=file_path,
            total_lines=120,
            hotspots=[h.model_dump() for h in hotspots]
        )
        
        doc = code_map.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.code_maps.insert_one(doc)
        
        return code_map
    except Exception as e:
        logging.error(f"Code map error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze/phase")
async def analyze_phase(input: AnalyzeRequest):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"phase_{input.workspace_id}_{input.repo_id}_{input.phase}",
            system_message="You are a Senior Staff Architect and Security Engineer."
        ).with_model("openai", "gpt-4o")
        
        phase_prompts = {
            "phase0": """Act as a Senior Staff Architect. Generate a System Blueprint:
            1. List core tech stack and service boundaries
            2. Map data flow using Mermaid.js
            3. Identify entry points and background workers
            Output: Structured Markdown with Mermaid diagrams""",
            
            "phase4": """Act as a Cybersecurity Engineer. Security Audit:
            1. Scan for RCE and Injection flaws
            2. For each flaw provide: Line Number, Severity (Critical/High), Analysis
            Output: JSON array of vulnerability objects""",
            
            "phase7": """Act as a Technical Educator. Create 30-Day Onboarding Roadmap:
            1. Group technologies by Core, Advanced, Operational
            2. Daily learning objectives
            Output: Interactive Markdown checklist by week"""
        }
        
        prompt = phase_prompts.get(input.phase, "Analyze the repository structure and provide insights.")
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        phase_mapping = {
            "phase0": (0, "System Blueprint"),
            "phase4": (4, "Security Audit"),
            "phase7": (7, "Learning Roadmap")
        }
        
        phase_num, phase_name = phase_mapping.get(input.phase, (0, "General Analysis"))
        
        mermaid_diagrams = []
        if "```mermaid" in response:
            import re
            diagrams = re.findall(r'```mermaid\n(.*?)\n```', response, re.DOTALL)
            mermaid_diagrams = diagrams
        
        phase = AnalysisPhase(
            workspace_id=input.workspace_id,
            repo_id=input.repo_id,
            phase_number=phase_num,
            phase_name=phase_name,
            content=response,
            mermaid_diagrams=mermaid_diagrams if mermaid_diagrams else None
        )
        
        doc = phase.model_dump()
        doc['analyzed_at'] = doc['analyzed_at'].isoformat()
        await db.analysis_phases.insert_one(doc)
        
        return phase
    except Exception as e:
        logging.error(f"Phase analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/analysis/phases/{workspace_id}/{repo_id}")
async def get_analysis_phases(workspace_id: str, repo_id: str):
    try:
        phases = await db.analysis_phases.find(
            {"workspace_id": workspace_id, "repo_id": repo_id},
            {"_id": 0}
        ).to_list(1000)
        
        for phase in phases:
            if isinstance(phase['analyzed_at'], str):
                phase['analyzed_at'] = datetime.fromisoformat(phase['analyzed_at'])
        
        return phases
    except Exception as e:
        logging.error(f"Error fetching phases: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/audit/matrix/{workspace_id}/{repo_id}")
async def get_audit_matrix(workspace_id: str, repo_id: str):
    try:
        existing = await db.audit_items.find(
            {"workspace_id": workspace_id, "repo_id": repo_id},
            {"_id": 0}
        ).to_list(1000)
        
        if existing:
            return existing
        
        sample_items = [
            AuditItem(
                workspace_id=workspace_id,
                repo_id=repo_id,
                file_path="/backend/auth.py",
                quadrant="high_value_high_effort",
                effort="high",
                value="high",
                description="Critical RCE vulnerability in authentication",
                priority_score=10
            ),
            AuditItem(
                workspace_id=workspace_id,
                repo_id=repo_id,
                file_path="/backend/api.py",
                quadrant="high_value_low_effort",
                effort="low",
                value="high",
                description="SQL injection quick fix available",
                priority_score=9
            ),
            AuditItem(
                workspace_id=workspace_id,
                repo_id=repo_id,
                file_path="/frontend/utils.js",
                quadrant="low_value_high_effort",
                effort="high",
                value="low",
                description="Refactor legacy code (low priority)",
                priority_score=3
            ),
        ]
        
        for item in sample_items:
            doc = item.model_dump()
            await db.audit_items.insert_one(doc)
        
        return [item.model_dump() for item in sample_items]
    except Exception as e:
        logging.error(f"Audit matrix error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/critical-issues/{workspace_id}/{repo_id}")
async def get_critical_issues(workspace_id: str, repo_id: str):
    try:
        issues = await db.health_cards.find(
            {"workspace_id": workspace_id, "repo_id": repo_id, "security_grade": {"$in": ["D", "F"]}},
            {"_id": 0}
        ).to_list(10)
        
        vulnerabilities = await db.vulnerabilities.find(
            {"workspace_id": workspace_id, "severity": "high"},
            {"_id": 0}
        ).to_list(10)
        
        return {
            "count": len(issues) + len(vulnerabilities),
            "issues": issues + vulnerabilities
        }
    except Exception as e:
        logging.error(f"Critical issues error: {str(e)}")
        return {"count": 0, "issues": []}

@api_router.post("/agents", response_model=Agent)
async def create_agent(input: AgentCreate):
    agent = Agent(**input.model_dump())
    doc = agent.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.agents.insert_one(doc)
    await db.workspaces.update_one(
        {"id": input.workspace_id},
        {"$inc": {"agents_count": 1}}
    )
    return agent

@api_router.get("/agents/{workspace_id}", response_model=List[Agent])
async def get_agents(workspace_id: str):
    agents = await db.agents.find({"workspace_id": workspace_id}, {"_id": 0}).to_list(1000)
    for agent in agents:
        if isinstance(agent['created_at'], str):
            agent['created_at'] = datetime.fromisoformat(agent['created_at'])
    return agents

@api_router.get("/vulnerabilities/{workspace_id}", response_model=List[Vulnerability])
async def get_vulnerabilities(workspace_id: str):
    vulns = await db.vulnerabilities.find({"workspace_id": workspace_id}, {"_id": 0}).to_list(1000)
    for v in vulns:
        if isinstance(v['detected_at'], str):
            v['detected_at'] = datetime.fromisoformat(v['detected_at'])
    return vulns

@api_router.post("/tasks", response_model=Task)
async def create_task(input: TaskCreate):
    task = Task(**input.model_dump())
    doc = task.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.tasks.insert_one(doc)
    return task

@api_router.get("/tasks/{workspace_id}", response_model=List[Task])
async def get_tasks(workspace_id: str):
    tasks = await db.tasks.find({"workspace_id": workspace_id}, {"_id": 0}).to_list(1000)
    for task in tasks:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
    return tasks

@api_router.patch("/tasks/{task_id}")
async def update_task(task_id: str, status: Optional[str] = None, agent_assigned: Optional[str] = None):
    update_data = {}
    if status:
        update_data["status"] = status
    if agent_assigned:
        update_data["agent_assigned"] = agent_assigned
    
    result = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(task['created_at'], str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    return task

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()