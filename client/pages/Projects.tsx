import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Search, Plus, Clock, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { useRole } from '../contexts/RoleContext';

type ProjectStatus = 'draft' | 'evaluation' | 'in-progress' | 'done' | 'backlog';

const statusLabel: Record<ProjectStatus, string> = {
  draft: 'Черновик',
  evaluation: 'Оценка',
  'in-progress': 'Выполняется',
  done: 'Завершён',
  backlog: 'Бэклог'
};

export default function Projects() {
  const { projects, submitToRp, rpSendToArchitect } = useProjectStore();
  const { currentUser } = useRole();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | ProjectStatus>('all');
  const [team, setTeam] = useState<'all' | string>('all');

  const allTeams = useMemo(() => Array.from(new Set(projects.flatMap(p => p.teams))), [projects]);

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || p.status === status;
    const matchesTeam = team === 'all' || p.teams.includes(team);
    return matchesSearch && matchesStatus && matchesTeam;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Проекты</h1>
            <p className="text-gray-600 mt-1">Список проектов с фильтрами и статусами</p>
          </div>
          {(currentUser.role === 'director' || currentUser.role === 'rp' || currentUser.role === 'prp') && (
            <Link to="/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать проект
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск по названию проекта..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={team} onValueChange={setTeam as any}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Команда" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все команды</SelectItem>
              {allTeams.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus as any}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="draft">Черновик</SelectItem>
              <SelectItem value="evaluation">Оценка</SelectItem>
              <SelectItem value="in-progress">Выполняется</SelectItem>
              <SelectItem value="done">Завершён</SelectItem>
              <SelectItem value="backlog">Бэклог</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Экспорт
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-2 text-xs text-gray-500 border-b">
            <div className="col-span-4">Проект</div>
            <div className="col-span-3">Команды</div>
            <div className="col-span-2">Статус</div>
            <div className="col-span-2">Срок</div>
            <div className="col-span-1 text-right">Индикаторы</div>
          </div>
          <div>
            {filtered.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <Card className="rounded-none shadow-none border-0 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-0 px-4 py-3 items-center">
                    <div className="col-span-4 flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <span className="text-xs text-gray-500">({p.id})</span>
                    </div>
                    <div className="col-span-3 space-x-1">
                      {p.teams.map(t => (
                        <Badge key={t} variant="outline" className="mr-1 text-[10px]">{t}</Badge>
                      ))}
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">{statusLabel[p.status]}</Badge>
                    </div>
                    <div className="col-span-2 text-sm text-gray-700">{p.endDate}</div>
                    <div className="col-span-1 flex justify-end">
                      {p.status === 'evaluation' && p.archStatus && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>
                  {p.status === 'evaluation' && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">Статус архитектурной оценки: {p.archStatus || '-'}</div>
                      <div className="mt-2 flex gap-2">
                        {currentUser.role === 'prp' && p.flowStatus === 'draft-created' && (
                          <Button size="sm" variant="outline" onClick={(e)=>{e.preventDefault(); submitToRp(p.id);}}>Отправить на согласование РП</Button>
                        )}
                        {currentUser.role === 'rp' && p.flowStatus === 'waiting-rp-approval' && (
                          <Button size="sm" onClick={(e)=>{e.preventDefault(); rpSendToArchitect(p.id);}}>Отправить на архитектурный анализ</Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-500">Проекты не найдены</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


