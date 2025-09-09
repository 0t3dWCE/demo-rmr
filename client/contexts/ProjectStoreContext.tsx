import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type ProjectStatus = 'draft' | 'evaluation' | 'in-progress' | 'done' | 'backlog';
export type ArchStatus = 'Новая' | 'На рассмотрении' | 'На уточнении' | 'Требует уточнений' | 'Принято' | 'Отклонено' | null;
export type TaskStatus = 'in-progress' | 'waiting' | 'done' | 'cancelled';
export type TaskSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'неопределен';

// Новый статусор для бизнес-флоу
export type FlowStatus =
  | 'draft-created'              // черновик помощника
  | 'waiting-rp-approval'        // отправлено РП
  | 'waiting-architect-review'   // отправлено архитектору
  | 'architect-decomposing'      // архитектор декомпозирует задачи
  | 'waiting-team-estimates'     // ждём оценки команд
  | 'architect-aggregating'      // архитектор агрегирует
  | 'waiting-director-approve'   // направлено на утверждение директору
  | 'approved'                   // утверждено
  | 'rejected';                  // отклонено

export interface ProjectTask {
  id: string;
  team: string;
  name: string;
  priority: 1 | 2 | 3 | 4 | 5;
  size: TaskSize;
  status: TaskStatus;
  arch: '-' | 'Принято' | 'Отклонено';
  dueDate: string;
  evaUrl?: string;
}

export interface ProjectComment {
  id: string;
  authorRole: 'prp' | 'rp' | 'rkp' | 'tl' | 'architect' | 'director';
  author: string;
  text: string;
  date: string;
}

export interface ProjectItem {
  id: string; // PRJ-xxx
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  priority: 1 | 2 | 3 | 4 | 5;
  department: string;
  systems: string[];
  requiresArch: boolean;
  archStatus: ArchStatus; // для отображения статуса "Оценка архитектора"/решений
  archRejectionReason?: string;
  teams: string[]; // команды-участники проекта
  tasks: ProjectTask[];
  flowStatus: FlowStatus; // бизнес-флоу
  comments: ProjectComment[];
}

interface CreateProjectInput {
  name: string;
  startDate: string;
  endDate: string;
  priority: number;
  department: string;
  systems: string[];
  requiresArch: boolean;
  comment: string;
}

interface ProjectStore {
  projects: ProjectItem[];
  createProject: (input: CreateProjectInput) => ProjectItem;
  setArchStatus: (projectId: string, status: Exclude<ArchStatus, null>, reason?: string) => void;
  architectApprove: (projectId: string, teams: string[]) => void;
  architectAddTasks: (projectId: string, items: Array<{ team: string; name: string; dueDate: string }>) => void;
  findProject: (projectId: string) => ProjectItem | undefined;
  // переходы флоу
  submitToRp: (projectId: string) => void;
  rpSendToArchitect: (projectId: string) => void;
  architectStartDecompose: (projectId: string) => void;
  architectRequestEstimates: (projectId: string, teams: string[]) => void;
  teamSetEstimate: (projectId: string, taskId: string, size: TaskSize) => void;
  architectAggregateAndSendToDirector: (projectId: string) => void;
  directorApprove: (projectId: string) => void;
  directorReject: (projectId: string) => void;
  addComment: (projectId: string, c: Omit<ProjectComment, 'id' | 'date'>) => void;
}

const ProjectStoreContext = createContext<ProjectStore | undefined>(undefined);

let counter = 5; // начальные демо

const initialProjects: ProjectItem[] = [
  {
    id: 'PRJ-001',
    name: 'Интеграция с 1С',
    status: 'in-progress',
    startDate: '2025-09-01',
    endDate: '2025-10-15',
    priority: 2,
    department: '1C',
    systems: ['1C','LKK','BIM'],
    requiresArch: false,
    archStatus: null,
    teams: ['1C','LKK','BIM'],
    flowStatus: 'approved',
    comments: [
      { id: 'c1', authorRole: 'rp', author: 'Руководитель БП', text: 'Стартуем интеграцию, важно успеть к релизу Q4.', date: '2025-09-01' }
    ],
    tasks: [
      { id: 'TASK-101', team: '1C', name: 'Импорт справочников', priority: 1, size: 'M', status: 'in-progress', arch: 'Принято', dueDate: '2025-09-25', evaUrl: '#' },
      { id: 'TASK-201', team: 'LKK', name: 'UI интеграция', priority: 2, size: 'S', status: 'in-progress', arch: 'Принято', dueDate: '2025-10-05', evaUrl: '#' },
    ]
  },
  {
    id: 'PRJ-002',
    name: 'Платежный шлюз',
    status: 'evaluation',
    startDate: '2025-10-20',
    endDate: '2025-11-05',
    priority: 1,
    department: 'IC',
    systems: ['IC','DV'],
    requiresArch: true,
    archStatus: 'Новая',
    teams: [],
    flowStatus: 'draft-created',
    comments: [],
    tasks: []
  }
];

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);

  const createProject = (input: CreateProjectInput): ProjectItem => {
    counter += 1;
    const id = `PRJ-0${counter}`;
    const project: ProjectItem = {
      id,
      name: input.name,
      status: 'evaluation',
      startDate: input.startDate,
      endDate: input.endDate,
      priority: (input.priority as 1|2|3|4|5) || 3,
      department: input.department,
      systems: input.systems,
      requiresArch: input.requiresArch,
      archStatus: input.requiresArch ? 'Новая' : null,
      teams: [],
      flowStatus: 'draft-created',
      tasks: [],
      comments: input.comment ? [
        { id: `pc-${Date.now()}`, authorRole: 'prp', author: 'Помощник РП', text: input.comment, date: new Date().toISOString().slice(0,10) }
      ] : []
    };
    setProjects(prev => [project, ...prev]);
    return project;
  };

  const findProject = (projectId: string) => projects.find(p => p.id === projectId);

  const setArchStatus = (projectId: string, status: Exclude<ArchStatus, null>, reason?: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, archStatus: status, archRejectionReason: status === 'Отклонено' ? (reason || '') : undefined } : p));
  };

  const architectApprove = (projectId: string, teams: string[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      // Создаем задачи по выбранным командам
      const newTasks: ProjectTask[] = teams.map((t, idx) => ({
        id: `TASK-${projectId}-${idx+1}`,
        team: t,
        name: `Оценка и создание тикета ${t}`,
        priority: 2,
        size: 'неопределен',
        status: 'waiting',
        arch: 'Принято',
        dueDate: p.endDate,
        evaUrl: '#'
      }));
      return { ...p, archStatus: 'Принято', teams, tasks: [...p.tasks, ...newTasks], flowStatus: 'waiting-team-estimates' };
    }));
  };

  const architectAddTasks = (projectId: string, items: Array<{ team: string; name: string; dueDate: string }>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const nextIdx = p.tasks.length;
      const newTasks: ProjectTask[] = items.map((it, i) => ({
        id: `TASK-${projectId}-ADD-${nextIdx + i + 1}`,
        team: it.team,
        name: it.name,
        priority: 3,
        size: 'неопределен',
        status: 'waiting',
        arch: '-',
        dueDate: it.dueDate || p.endDate
      }));
      return { ...p, tasks: [...p.tasks, ...newTasks], flowStatus: 'waiting-team-estimates' };
    }));
  };

  // Переходы флоу
  const submitToRp = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'waiting-rp-approval' } : p));
  const rpSendToArchitect = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'waiting-architect-review', status: 'evaluation' } : p));
  const architectStartDecompose = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'architect-decomposing' } : p));
  const architectRequestEstimates = (projectId: string, teams: string[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const missingTeams = teams.filter(t => !p.teams.includes(t));
      const newTasks: ProjectTask[] = missingTeams.map((t, idx) => ({
        id: `TASK-${projectId}-NEW-${idx+1}`,
        team: t,
        name: `Оценка по системе ${t}`,
        priority: 3,
        size: 'неопределен',
        status: 'waiting',
        arch: '-',
        dueDate: p.endDate
      }));
      return { ...p, teams: [...p.teams, ...missingTeams], tasks: [...p.tasks, ...newTasks], flowStatus: 'waiting-team-estimates' };
    }));
  };
  const teamSetEstimate = (projectId: string, taskId: string, size: TaskSize) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const tasks: ProjectTask[] = p.tasks.map((t): ProjectTask => (
        t.id === taskId ? { ...t, size, status: 'done' as TaskStatus } : t
      ));
      return { ...p, tasks };
    }));
  };
  const architectAggregateAndSendToDirector = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'waiting-director-approve' } : p));
  const directorApprove = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'approved', status: 'in-progress' } : p));
  const directorReject = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'rejected' } : p));

  const addComment = (projectId: string, c: Omit<ProjectComment, 'id' | 'date'>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, comments: [...(p.comments || []), { ...c, id: `pc-${Date.now()}`, date: new Date().toISOString().slice(0,10) }] } : p));
  };

  const value: ProjectStore = useMemo(() => ({
    projects,
    createProject,
    setArchStatus,
    architectApprove,
    architectAddTasks,
    findProject,
    submitToRp,
    rpSendToArchitect,
    architectStartDecompose,
    architectRequestEstimates,
    teamSetEstimate,
    architectAggregateAndSendToDirector,
    directorApprove,
    directorReject,
    addComment
  }), [projects]);

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore() {
  const ctx = useContext(ProjectStoreContext);
  if (!ctx) throw new Error('useProjectStore must be used within ProjectStoreProvider');
  return ctx;
}


