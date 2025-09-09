import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarDays, ExternalLink, AlertTriangle, Users } from 'lucide-react';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '../contexts/RoleContext';

type ProjectStatus = 'evaluation' | 'in-progress' | 'done' | 'backlog' | 'draft';
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

const statusBadges: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-gray-500' },
  evaluation: { label: 'Оценка', color: 'bg-blue-500' },
  'in-progress': { label: 'Выполняется', color: 'bg-green-600' },
  done: { label: 'Завершён', color: 'bg-gray-600' },
  backlog: { label: 'Бэклог', color: 'bg-indigo-500' }
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { findProject, addComment, submitToRp, rpSendToArchitect, directorApprove, directorReject } = useProjectStore();
  const { currentUser } = useRole();
  const storeProject = findProject(id!);

  const [teamFilter, setTeamFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [archFilter, setArchFilter] = useState<'all' | ArchStatus>('all');
  const [search, setSearch] = useState('');
  const [newComment, setNewComment] = useState('');

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
                <h1 className="text-2xl font-bold text-gray-900">{storeProject?.name}</h1>
                {storeProject && (
                  <Badge className={`bg-blue-500 text-white`}>
                    {storeProject.status === 'evaluation' ? 'Оценка' : storeProject.status}
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
                  <div className="flex items-center space-x-2">
                    <Progress value={storeProject ? 50 : 0} className="h-2 w-40" />
                    <span className="text-sm font-medium">{storeProject ? '50%' : '0%'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Сроки</div>
                  <div className="flex items-center text-sm text-gray-800">
                    <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                    {storeProject?.startDate} — {storeProject?.endDate}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Команды</div>
                  <div className="flex flex-wrap gap-1">
                    {(storeProject?.teams || []).map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Участники</span>
                </Button>
                {storeProject && currentUser.role === 'prp' && storeProject.flowStatus === 'draft-created' && (
                  <Button size="sm" variant="outline" onClick={()=> submitToRp(storeProject.id)}>Отправить на согласование РП</Button>
                )}
                {storeProject && currentUser.role === 'rp' && storeProject.flowStatus === 'waiting-rp-approval' && (
                  <Button size="sm" onClick={()=> rpSendToArchitect(storeProject.id)}>Отправить на архитектурный анализ</Button>
                )}
                {storeProject && (currentUser.role === 'director' || currentUser.role === 'rp') && storeProject.flowStatus === 'waiting-director-approve' && (
                  <>
                    <Button size="sm" onClick={()=> directorApprove(storeProject.id)}>Утвердить</Button>
                    <Button size="sm" variant="outline" onClick={()=> directorReject(storeProject.id)}>Отклонить</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

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
                <Button size="sm" onClick={()=>{ if(!storeProject || !newComment.trim()) return; addComment(storeProject.id, { authorRole: 'rp', author: 'Руководитель БП', text: newComment.trim() }); setNewComment(''); }}>Отправить от РП</Button>
                <Button size="sm" variant="outline" className="ml-2" onClick={()=>{ if(!storeProject || !newComment.trim()) return; addComment(storeProject.id, { authorRole: 'prp', author: 'Помощник РП', text: newComment.trim() }); setNewComment(''); }}>Отправить от ПРП</Button>
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
                  <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-800">Команда {team}</div>
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
      </div>
    </Layout>
  );
}
