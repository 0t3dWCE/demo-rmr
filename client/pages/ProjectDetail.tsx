import { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, ExternalLink, AlertTriangle, Users, Play } from 'lucide-react';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '../contexts/RoleContext';

type ProjectStatus = 'evaluation' | 'on-approval' | 'in-progress' | 'done' | 'backlog' | 'draft' | 'rejected';
type TaskStatus = 'in-progress' | 'waiting' | 'done' | 'cancelled';
type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'неопределен';
type ArchStatus = 'Новая' | 'На рассмотрении' | 'На уточнении' | 'Требует уточнений' | 'Принято' | 'Отклонено' | '-';

interface ProjectInfo {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  hasRisk?: boolean;
  teams: string[];
}

interface TaskItem {
  id: string;
  team: string;
  priority: 1 | 2 | 3 | 4 | 5;
  name: string;
  size: Size;
  status: TaskStatus;
  arch: ArchStatus;
  dueDate: string;
  evaUrl?: string;
}

const mockProject: ProjectInfo | null = null;
const tasks: TaskItem[] = [];

// Список возможных руководителей проектов (в реальности будет из API)
const availableProjectManagers = [
  'Иванов Иван Иванович',
  'Петров Петр Петрович',
  'Сидоров Сидор Сидорович',
  'Козлова Мария Александровна',
  'Смирнов Алексей Викторович'
];

const statusBadges: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-gray-500' },
  evaluation: { label: 'Оценка', color: 'bg-blue-500' },
  'on-approval': { label: 'Согласование', color: 'bg-purple-500' },
  'in-progress': { label: 'Выполняется', color: 'bg-green-600' },
  done: { label: 'Завершён', color: 'bg-gray-600' },
  backlog: { label: 'Бэклог', color: 'bg-indigo-500' },
  rejected: { label: 'Отклонён', color: 'bg-red-500' }
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { findProject, addComment, submitToRp, rpSendToArchitect, rpMarkApproval, directorApprove, directorReject, approverApprove, approverReject, updateProject, toggleAutoStart, startProject, setProjectManager, createTechCom } = useProjectStore();
  const { currentUser } = useRole();
  const storeProject = findProject(id!);

  const [teamFilter, setTeamFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [archFilter, setArchFilter] = useState<'all' | ArchStatus>('all');
  const [search, setSearch] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editName, setEditName] = useState(storeProject?.name || '');
  const [editStart, setEditStart] = useState(storeProject?.startDate || '');
  const [editEnd, setEditEnd] = useState(storeProject?.endDate || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  
  // Модальное окно создания ТехКома
  const [techComDialogOpen, setTechComDialogOpen] = useState(false);
  const [techComTeam, setTechComTeam] = useState('');
  const [techComTitle, setTechComTitle] = useState('');
  const [techComType, setTechComType] = useState<'онлайн' | 'офлайн'>('онлайн');
  const [techComDate, setTechComDate] = useState('');
  const [techComParticipants, setTechComParticipants] = useState('');

  useEffect(() => {
    setEditName(storeProject?.name || '');
    setEditStart(storeProject?.startDate || '');
    setEditEnd(storeProject?.endDate || '');
  }, [storeProject?.id]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const saveName = () => {
    if (!storeProject) return;
    const newName = editName.trim();
    if (newName && newName !== storeProject.name) {
      updateProject(storeProject.id, { name: newName });
    }
    setIsEditingName(false);
  };

  const onNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditName(storeProject?.name || '');
      setIsEditingName(false);
    }
  };

  const saveDates = () => {
    if (!storeProject) return;
    updateProject(storeProject.id, { startDate: editStart, endDate: editEnd });
  };

  const filtered = useMemo(() => {
    const source = (storeProject?.tasks as unknown as TaskItem[]) || [];
    return source.filter(t => {
      const matchesTeam = teamFilter === 'all' || t.team === teamFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || String(t.priority) === priorityFilter;
      const matchesArch = archFilter === 'all' || t.arch === archFilter;
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      return matchesTeam && matchesStatus && matchesPriority && matchesArch && matchesSearch;
    });
  }, [storeProject, teamFilter, statusFilter, priorityFilter, archFilter, search]);

  const groupedByTeam = useMemo(() => {
    const groups: Record<string, TaskItem[]> = {};
    for (const task of filtered) {
      if (!groups[task.team]) groups[task.team] = [];
      groups[task.team].push(task);
    }
    return groups;
  }, [filtered]);

  const handleCreateTechCom = (teamName: string) => {
    setTechComTeam(teamName);
    setTechComTitle('');
    setTechComType('онлайн');
    setTechComDate('');
    setTechComParticipants('');
    setTechComDialogOpen(true);
  };

  const handleTechComSubmit = () => {
    if (!storeProject || !techComTitle.trim() || !techComDate) return;
    
    const relatedText = `${techComTeam} - ${storeProject.name}`;
    
    createTechCom({
      title: techComTitle.trim(),
      date: techComDate,
      type: techComType,
      related: relatedText,
      participants: techComParticipants.trim() || 'Не указаны'
    });
    
    setTechComDialogOpen(false);
    // Перенаправление на страницу ТехКомов
    navigate('/techcom');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Проекты</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900 font-medium">{storeProject?.name}</span>
          <span className="mx-1">/</span>
          <span className="text-gray-500">{id}</span>
        </div>

        {/* Project summary */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {currentUser.role === 'rp' ? (
                  isEditingName ? (
                    <Input
                      ref={nameInputRef}
                      value={editName}
                      onChange={(e)=> setEditName(e.target.value)}
                      onBlur={saveName}
                      onKeyDown={onNameKeyDown}
                      className="text-2xl font-bold h-10"
                    />
                  ) : (
                    <h1
                      className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 px-1 rounded"
                      onClick={() => setIsEditingName(true)}
                      title="Кликните, чтобы редактировать"
                    >
                      {storeProject?.name}
                    </h1>
                  )
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{storeProject?.name}</h1>
                )}
                {storeProject && (
                  <Badge className={`${statusBadges[storeProject.status].color} text-white`}>
                    {statusBadges[storeProject.status].label}
                  </Badge>
                )}
                {storeProject?.archStatus && (
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Риски
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Прогресс</div>
                  {storeProject && storeProject.tasks.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <Progress value={Math.round((storeProject.tasks.filter(t=>t.status==='done').length / storeProject.tasks.length) * 100)} className="h-2 w-40" />
                      <span className="text-sm font-medium">{Math.round((storeProject.tasks.filter(t=>t.status==='done').length / storeProject.tasks.length) * 100)}%</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">—</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Сроки</div>
                  {currentUser.role === 'rp' ? (
                    <div className="flex items-center text-sm text-gray-800 gap-2">
                      <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                      <Input type="date" value={editStart} onChange={(e)=> setEditStart(e.target.value)} onBlur={saveDates} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); saveDates(); } }} className="h-8 w-40" />
                      <span className="text-gray-500">—</span>
                      <Input type="date" value={editEnd} onChange={(e)=> setEditEnd(e.target.value)} onBlur={saveDates} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); saveDates(); } }} className="h-8 w-40" />
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-800">
                      <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                      {storeProject?.startDate || '—'} — {storeProject?.endDate || '—'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Команды</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(((storeProject?.tasks || []).map(t => t.team)).filter(Boolean))).map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentUser.role === 'rp' || currentUser.role === 'director') && storeProject && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Руководитель проекта</div>
                    <Select 
                      value={storeProject.projectManager || ''} 
                      onValueChange={(value) => setProjectManager(storeProject.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите руководителя проекта" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProjectManagers.map(manager => (
                          <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {currentUser.role === 'rp' && storeProject && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="auto-start" 
                      checked={storeProject.autoStartOnApproval} 
                      onCheckedChange={() => toggleAutoStart(storeProject.id)}
                    />
                    <label htmlFor="auto-start" className="text-sm text-gray-700 cursor-pointer">
                      Автоматически стартовать при согласовании
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-6">
              <div className="flex items-center gap-2">
                {storeProject && currentUser.role === 'rkp' && (
                  <Button size="sm" onClick={()=> rpSendToArchitect(storeProject.id)}>Отправить на архитектурный анализ</Button>
                )}
                {storeProject && currentUser.role === 'rp' && (
                  storeProject.flowStatus === 'waiting-architect-review' ? (
                    <Badge variant="outline" className="text-blue-700 border-blue-300">На архитектурном анализе</Badge>
                  ) : (storeProject.flowStatus === 'waiting-rp-approval' || storeProject.flowStatus === 'draft-created') ? (
                    <Button size="sm" onClick={()=> rpSendToArchitect(storeProject.id)}>Отправить на архитектурный анализ</Button>
                  ) : storeProject.flowStatus === 'waiting-director-approve' ? (
                    storeProject.status === 'on-approval'
                      ? <Badge variant="outline" className="text-purple-700 border-purple-300">На утверждении</Badge>
                      : <Badge variant="outline" className="text-gray-700 border-gray-300">Оценка завершена</Badge>
                  ) : null
                )}
                {storeProject && (currentUser.role === 'director' || currentUser.role === 'rp') && storeProject.flowStatus === 'waiting-director-approve' && (
                  <>
                    {currentUser.role === 'rp' && storeProject.status !== 'on-approval' && (
                      <Button size="sm" onClick={()=> rpMarkApproval(storeProject.id)}>На согласование</Button>
                    )}
                    {currentUser.role === 'director' && storeProject.status === 'on-approval' && (
                      <>
                        <Button size="sm" onClick={()=> directorApprove(storeProject.id)}>Утвердить</Button>
                        <Button size="sm" variant="outline" onClick={()=> directorReject(storeProject.id)}>Отклонить</Button>
                      </>
                    )}
                  </>
                )}
                {storeProject && currentUser.role === 'approver' && storeProject.status === 'on-approval' && storeProject.flowStatus === 'waiting-director-approve' && (
                  <>
                    <Button size="sm" onClick={()=> approverApprove(storeProject.id)}>Утвердить</Button>
                    <Button size="sm" variant="outline" onClick={()=> approverReject(storeProject.id)}>Отклонить</Button>
                  </>
                )}
                {storeProject && (currentUser.role === 'rp' || currentUser.role === 'director') && storeProject.flowStatus === 'approved' && storeProject.status !== 'in-progress' && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={()=> startProject(storeProject.id)}
                    disabled={!storeProject.projectManager}
                    title={!storeProject.projectManager ? 'Необходимо назначить руководителя проекта' : ''}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Старт проекта
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Инлайн-редактирование внедрено в шапку; отдельный блок удалён */}

        {/* Comments block */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Комментарии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {(storeProject?.comments || []).map(c => (
                <div key={c.id} className="p-2 border rounded text-sm">
                  <div className="text-gray-700">{c.text}</div>
                  <div className="text-xs text-gray-500">{c.date} — {c.author} ({c.authorRole})</div>
                </div>
              ))}
              {(!storeProject || (storeProject?.comments||[]).length === 0) && (
                <div className="text-sm text-gray-500">Комментариев пока нет</div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Textarea value={newComment} onChange={(e)=>setNewComment(e.target.value)} rows={3} placeholder="Добавить комментарий" />
              <div>
                <Button size="sm" onClick={()=>{
                  if (!storeProject) return;
                  const text = newComment.trim();
                  if (!text) return;
                  addComment(storeProject.id, { authorRole: currentUser.role as any, author: currentUser.name, text });
                  setNewComment('');
                }}>Отправить</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and grouped tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Задачи проекта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <Input placeholder="Поиск по задаче..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={teamFilter} onValueChange={setTeamFilter as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Команда" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все команды</SelectItem>
                  {(storeProject?.teams || []).map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="in-progress">Выполняется</SelectItem>
                  <SelectItem value="waiting">Ожидается</SelectItem>
                  <SelectItem value="done">Завершено</SelectItem>
                  <SelectItem value="cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
              <Select value={archFilter} onValueChange={setArchFilter as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Арх. оценка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {['Новая','На рассмотрении','На уточнении','Требует уточнений','Принято','Отклонено','-'].map(s => (
                    <SelectItem key={s} value={s as ArchStatus}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedByTeam).map(([team, items]) => (
                <div key={team} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800">Команда {team}</span>
                    {currentUser.role === 'rkp' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCreateTechCom(team)}
                        className="text-xs"
                      >
                        Создать ТехКом
                      </Button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white border-b">
                        <tr>
                          <th className="text-left px-4 py-2 w-16">P</th>
                          <th className="text-left px-4 py-2">Название</th>
                          <th className="text-left px-4 py-2 w-24">Размер</th>
                          <th className="text-left px-4 py-2 w-32">Статус</th>
                          <th className="text-left px-4 py-2 w-40">Решение архитектора</th>
                          <th className="text-left px-4 py-2 w-40">Срок</th>
                          <th className="text-center px-4 py-2 w-20">Светофор</th>
                          <th className="text-right px-4 py-2 w-32">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(t => (
                          <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{t.priority}</td>
                            <td className="px-4 py-2">
                              <div className="text-gray-900 font-medium">{t.name}</div>
                              <div className="text-xs text-gray-500">{t.id}</div>
                            </td>
                            <td className="px-4 py-2">{t.size}</td>
                            <td className="px-4 py-2">
                              {t.status === 'in-progress' && <Badge className="bg-green-600 text-white">Выполняется</Badge>}
                              {t.status === 'waiting' && <Badge variant="outline">Ожидается</Badge>}
                              {t.status === 'done' && <Badge className="bg-gray-600 text-white">Завершено</Badge>}
                              {t.status === 'cancelled' && <Badge variant="outline" className="line-through text-red-600 border-red-300">Отменена</Badge>}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{t.arch}</Badge>
                                <Button variant="ghost" size="sm">Обсуждение</Button>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center text-gray-800">
                                <CalendarDays className="w-4 h-4 mr-2 text-gray-500" /> {t.dueDate}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              {(() => {
                                // ЛОГИКА СВЕТОФОРА для Epic команды в Eva
                                // В реальности эти данные приходят с бэкенда:
                                // - Подсчет всех подзадач epic в Eva
                                // - Учет очереди задач команды (задачи по другим проектам)
                                // - Расчет финальной даты завершения с учетом очереди
                                // - Сравнение с deadline проекта
                                
                                const teamTasks = items;
                                const allEstimated = teamTasks.every(task => task.size !== 'неопределен');
                                
                                // Серый: оценки в Eva еще нет
                                if (!allEstimated) {
                                  return <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto" title="Оценки в Eva еще нет" />;
                                }
                                
                                // Зелёный: все задачи выполнены
                                const allDone = teamTasks.every(task => task.status === 'done');
                                if (allDone) {
                                  return <div className="w-4 h-4 rounded-full bg-green-500 mx-auto" title="Все задачи выполнены" />;
                                }
                                
                                // В реальности здесь будет расчет от бэкенда:
                                // const estimatedCompletion = calculateWithQueue(team, project);
                                // const isOverdue = estimatedCompletion > project.endDate;
                                // const progressPercent = calculateProgress(teamTasks);
                                // const timeToDeadlinePercent = calculateTimePercent(now, endDate);
                                
                                // Для демо: упрощенная логика
                                const completedCount = teamTasks.filter(task => task.status === 'done').length;
                                const totalCount = teamTasks.length;
                                const progressPercent = (completedCount / totalCount) * 100;
                                
                                // Красный: если прогресс < 30% и осталось мало времени (риск не успеть)
                                // В реальности: если estimatedCompletion > deadline
                                if (progressPercent < 30 && storeProject) {
                                  const now = new Date();
                                  const deadline = new Date(storeProject.endDate);
                                  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                  if (daysLeft < 30) {
                                    return <div className="w-4 h-4 rounded-full bg-red-500 mx-auto" title="Риск срыва срока: с учетом очереди команда может не успеть" />;
                                  }
                                }
                                
                                // Жёлтый: осталось > половины задач, но время перевалило за половину до дедлайна
                                if (progressPercent < 50 && storeProject) {
                                  const now = new Date();
                                  const start = new Date(storeProject.startDate);
                                  const deadline = new Date(storeProject.endDate);
                                  const totalTime = deadline.getTime() - start.getTime();
                                  const elapsedTime = now.getTime() - start.getTime();
                                  const timeProgressPercent = (elapsedTime / totalTime) * 100;
                                  
                                  if (timeProgressPercent > 50) {
                                    return <div className="w-4 h-4 rounded-full bg-yellow-500 mx-auto" title="Внимание: выполнено меньше половины, а время прошло больше половины" />;
                                  }
                                }
                                
                                // Зелёный: нормальный прогресс
                                return <div className="w-4 h-4 rounded-full bg-green-500 mx-auto" title="Прогресс в норме" />;
                              })()}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <a href={t.evaUrl} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                  <ExternalLink className="w-4 h-4 mr-1" /> Eva
                                </Button>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {Object.keys(groupedByTeam).length === 0 && (
                <div className="text-center py-12 text-gray-500">Задачи не найдены</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Модальное окно создания ТехКома */}
        <Dialog open={techComDialogOpen} onOpenChange={setTechComDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создание ТехКом</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <Input 
                placeholder="Тема ТехКом" 
                value={techComTitle}
                onChange={(e) => setTechComTitle(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={techComType} onValueChange={(val) => setTechComType(val as 'онлайн' | 'офлайн')}>
                  <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="онлайн">Онлайн</SelectItem>
                    <SelectItem value="офлайн">Офлайн</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  type="datetime-local" 
                  value={techComDate}
                  onChange={(e) => setTechComDate(e.target.value)}
                />
              </div>
              <Input 
                placeholder={`Проект/задача (${techComTeam} - ${storeProject?.name || ''})`}
                value={`${techComTeam} - ${storeProject?.name || ''}`}
                disabled
                className="bg-gray-50"
              />
              <Input 
                placeholder="Участники (через запятую)" 
                value={techComParticipants}
                onChange={(e) => setTechComParticipants(e.target.value)}
              />
              <Button 
                onClick={handleTechComSubmit}
                disabled={!techComTitle.trim() || !techComDate}
              >
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
