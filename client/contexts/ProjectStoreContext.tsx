import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import type { UserRole, User } from './RoleContext';

export type ProjectStatus = 'draft' | 'evaluation' | 'on-approval' | 'in-progress' | 'done' | 'backlog';
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

export interface TechComItem {
  id: string; // TECH-xxx
  title: string;
  date: string;
  type: 'онлайн' | 'офлайн';
  related: string; // PRJ-xxx или название команды + название проекта
  participants: string; // участники через запятую
  resolution?: string;
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
  createdBy?: Pick<User, 'role' | 'email' | 'name'>;
  autoStartOnApproval: boolean; // Автоматически стартовать при согласовании
  projectManager?: string; // Руководитель проекта (имя или email)
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
  createdBy?: Pick<User, 'role' | 'email' | 'name'>;
}

interface ProjectStore {
  projects: ProjectItem[];
  techComs: TechComItem[];
  createProject: (input: CreateProjectInput) => ProjectItem;
  updateProject: (projectId: string, fields: Partial<Pick<ProjectItem, 'name' | 'startDate' | 'endDate'>>) => void;
  setArchStatus: (projectId: string, status: Exclude<ArchStatus, null>, reason?: string) => void;
  architectApprove: (projectId: string, teams: string[]) => void;
  architectAddTasks: (projectId: string, items: Array<{ team: string; name: string; dueDate: string }>) => void;
  findProject: (projectId: string) => ProjectItem | undefined;
  // переходы флоу
  submitToRp: (projectId: string) => void;
  rpSendToArchitect: (projectId: string) => void;
  rpMarkApproval: (projectId: string) => void;
  architectStartDecompose: (projectId: string) => void;
  architectRequestEstimates: (projectId: string, teams: string[]) => void;
  teamSetEstimate: (projectId: string, taskId: string, size: TaskSize) => void;
  architectAggregateAndSendToDirector: (projectId: string) => void;
  directorApprove: (projectId: string) => void;
  directorReject: (projectId: string) => void;
  approverApprove: (projectId: string) => void;
  approverReject: (projectId: string) => void;
  addComment: (projectId: string, c: Omit<ProjectComment, 'id' | 'date'>) => void;
  toggleAutoStart: (projectId: string) => void;
  startProject: (projectId: string) => void;
  setProjectManager: (projectId: string, manager: string) => void;
  // ТехКомы
  createTechCom: (input: { title: string; date: string; type: 'онлайн' | 'офлайн'; related: string; participants: string }) => TechComItem;
}

const ProjectStoreContext = createContext<ProjectStore | undefined>(undefined);

let counter = 5; // начальные демо
let techComCounter = 2; // начальные демо техкомы

const initialTechComs: TechComItem[] = [
  { id: 'TECH-001', title: 'Приоритизация Q4', date: '2025-11-15 14:00', type: 'онлайн', related: 'PRJ-001', participants: '6 участников', resolution: 'PRJ-001 (2 → 3)' },
  { id: 'TECH-002', title: 'Очередность задач IC', date: '2025-11-20 10:00', type: 'офлайн', related: 'PRJ-002', participants: '4 участника' },
];

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
    autoStartOnApproval: true,
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
    autoStartOnApproval: false,
    comments: [],
    tasks: []
  },
  {
    id: 'PRJ-003',
    name: 'Модернизация CRM системы',
    status: 'on-approval',
    startDate: '2025-11-01',
    endDate: '2025-12-20',
    priority: 1,
    department: 'IT',
    systems: ['CRM', 'Analytics'],
    requiresArch: true,
    archStatus: 'Принято',
    teams: ['CRM', 'Analytics'],
    flowStatus: 'waiting-director-approve',
    autoStartOnApproval: false,
    comments: [
      { id: 'c2', authorRole: 'rp', author: 'Руководитель БП', text: 'Проект готов к согласованию. Архитектор провел оценку и выделил команды.', date: '2025-10-15' }
    ],
    tasks: [
      { id: 'TASK-301', team: 'CRM', name: 'Обновление интерфейса', priority: 1, size: 'L', status: 'done', arch: 'Принято', dueDate: '2025-11-30', evaUrl: '#' },
      { id: 'TASK-302', team: 'Analytics', name: 'Интеграция аналитики', priority: 2, size: 'M', status: 'done', arch: 'Принято', dueDate: '2025-12-10', evaUrl: '#' },
    ]
  }
];

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [techComs, setTechComs] = useState<TechComItem[]>(initialTechComs);

  const createProject = (input: CreateProjectInput): ProjectItem => {
    counter += 1;
    const id = `PRJ-0${counter}`;
    const project: ProjectItem = {
      id,
      name: input.name,
      status: 'draft',
      startDate: input.startDate,
      endDate: input.endDate,
      priority: (input.priority as 1|2|3|4|5) || 3,
      department: input.department,
      systems: input.systems,
      requiresArch: input.requiresArch,
      archStatus: null,
      teams: [],
      flowStatus: 'draft-created',
      autoStartOnApproval: false,
      tasks: [],
      comments: input.comment ? [
        { id: `pc-${Date.now()}`, authorRole: 'prp', author: 'Помощник РП', text: input.comment, date: new Date().toISOString().slice(0,10) }
      ] : [],
      createdBy: input.createdBy
    };
    setProjects(prev => [project, ...prev]);
    return project;
  };

  const findProject = (projectId: string) => projects.find(p => p.id === projectId);

  const updateProject = (projectId: string, fields: Partial<Pick<ProjectItem, 'name' | 'startDate' | 'endDate'>>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...fields } : p));
  };

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
  const rpMarkApproval = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'waiting-director-approve', status: 'on-approval' } : p));
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
  
  const directorApprove = (projectId: string) => setProjects(prev => prev.map(p => {
    if (p.id !== projectId) return p;
    // Если автостарт включен, сразу запускаем проект, иначе переводим в статус "approved" (ожидает старт)
    return p.autoStartOnApproval 
      ? { ...p, flowStatus: 'approved', status: 'in-progress' }
      : { ...p, flowStatus: 'approved', status: 'evaluation' }; // Используем evaluation как "согласован, ожидает старт"
  }));
  
  const directorReject = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'rejected', status: 'rejected' } : p));
  
  const approverApprove = (projectId: string) => setProjects(prev => prev.map(p => {
    if (p.id !== projectId) return p;
    // Если автостарт включен, сразу запускаем проект, иначе переводим в статус "approved" (ожидает старт)
    return p.autoStartOnApproval 
      ? { ...p, flowStatus: 'approved', status: 'in-progress' }
      : { ...p, flowStatus: 'approved', status: 'evaluation' }; // Используем evaluation как "согласован, ожидает старт"
  }));
  
  const approverReject = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, flowStatus: 'rejected', status: 'rejected' } : p));

  const toggleAutoStart = (projectId: string) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, autoStartOnApproval: !p.autoStartOnApproval } : p));

  const startProject = (projectId: string) => {
    // Создание контрольной точки в Eva и старт проекта
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      // Добавляем комментарий о создании контрольной точки
      const newComment: ProjectComment = {
        id: `pc-${Date.now()}`,
        authorRole: 'rp',
        author: 'Система',
        text: `Проект запущен. Контрольная точка создана в Eva: ${p.endDate}`,
        date: new Date().toISOString().slice(0,10)
      };
      return { ...p, status: 'in-progress', comments: [...(p.comments || []), newComment] };
    }));
  };

  const addComment = (projectId: string, c: Omit<ProjectComment, 'id' | 'date'>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, comments: [...(p.comments || []), { ...c, id: `pc-${Date.now()}`, date: new Date().toISOString().slice(0,10) }] } : p));
  };

  const setProjectManager = (projectId: string, manager: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, projectManager: manager } : p));
  };

  const createTechCom = (input: { title: string; date: string; type: 'онлайн' | 'офлайн'; related: string; participants: string }): TechComItem => {
    techComCounter += 1;
    const id = `TECH-${String(techComCounter).padStart(3, '0')}`;
    const techCom: TechComItem = {
      id,
      title: input.title,
      date: input.date,
      type: input.type,
      related: input.related,
      participants: input.participants
    };
    setTechComs(prev => [techCom, ...prev]);
    return techCom;
  };

  const value: ProjectStore = useMemo(() => ({
    projects,
    techComs,
    createProject,
    updateProject,
    setArchStatus,
    architectApprove,
    architectAddTasks,
    findProject,
    submitToRp,
    rpSendToArchitect,
    rpMarkApproval,
    architectStartDecompose,
    architectRequestEstimates,
    teamSetEstimate,
    architectAggregateAndSendToDirector,
    directorApprove,
    directorReject,
    approverApprove,
    approverReject,
    addComment,
    toggleAutoStart,
    startProject,
    setProjectManager,
    createTechCom
  }), [projects, techComs]);

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


