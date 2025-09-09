import Layout from '../components/Layout';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { useRole } from '../contexts/RoleContext';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

export default function TaskEstimates() {
  const { projects, teamSetEstimate } = useProjectStore();
  const { currentUser } = useRole();
  const [q, setQ] = useState('');
  const [team, setTeam] = useState<'all' | string>('all');
  const [status, setStatus] = useState<'all' | 'waiting' | 'in-progress' | 'done'>('all');

  const allTeams = useMemo(() => Array.from(new Set(projects.flatMap(p => p.teams))), [projects]);
  const items = useMemo(() => {
    return projects.flatMap(p => p.tasks.map(t => ({ project: p, task: t })))
      .filter(it => it.project.flowStatus === 'waiting-team-estimates' || it.task.status === 'waiting')
      .filter(it => it.task.name.toLowerCase().includes(q.toLowerCase()) || it.project.name.toLowerCase().includes(q.toLowerCase()))
      .filter(it => team === 'all' || it.task.team === team)
      .filter(it => status === 'all' || it.task.status === status);
  }, [projects, q, team, status]);

  const canEstimate = currentUser.role === 'tl' || currentUser.role === 'rkp';

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Оценка задач</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border">
          <Input placeholder="Поиск по проекту/задаче..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <Select value={team} onValueChange={setTeam as any}>
            <SelectTrigger><SelectValue placeholder="Команда" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все команды</SelectItem>
              {allTeams.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus as any}>
            <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="waiting">Ожидается</SelectItem>
              <SelectItem value="in-progress">В работе</SelectItem>
              <SelectItem value="done">Готово</SelectItem>
            </SelectContent>
          </Select>
          <div />
        </div>

        <div className="space-y-3">
          {items.map(({ project, task }) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{project.name} • {project.id}</div>
                  <div className="font-medium text-gray-900">[{task.team}] {task.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{task.status}</Badge>
                  {canEstimate && (
                    <Select defaultValue={task.size} onValueChange={(v)=> teamSetEstimate(project.id, task.id, v as any)}>
                      <SelectTrigger className="w-28"><SelectValue placeholder="Размер" /></SelectTrigger>
                      <SelectContent>
                        {['S','M','L','XL','XXL','неопределен'].map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {items.length === 0 && (<div className="p-8 text-center text-gray-500">Нет задач для оценки</div>)}
        </div>
      </div>
    </Layout>
  );
}


