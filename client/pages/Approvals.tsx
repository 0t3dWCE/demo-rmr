import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { useRole } from '../contexts/RoleContext';

export default function Approvals() {
  const { projects } = useProjectStore();
  const { currentUser } = useRole();
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState<'all' | string>('all');
  const [status, setStatus] = useState<'on-approval'>('on-approval');

  const allTeams = useMemo(() => Array.from(new Set(projects.flatMap(p => p.teams))), [projects]);

  const source = projects.filter(p => p.status === 'on-approval');

  const filtered = source.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = team === 'all' || p.teams.includes(team);
    return matchesSearch && matchesTeam;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Проекты на согласование</h1>
            <p className="text-gray-600 mt-1">Список проектов в статусе «Согласование»</p>
          </div>
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
          <Select value={status} onValueChange={() => {}}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on-approval">Согласование</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-2 text-xs text-gray-500 border-b">
            <div className="col-span-4">Проект</div>
            <div className="col-span-3">Команды</div>
            <div className="col-span-2">Статус</div>
            <div className="col-span-3">Срок</div>
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
                      <Badge variant="outline">Согласование</Badge>
                    </div>
                    <div className="col-span-3 text-sm text-gray-700">{p.endDate}</div>
                  </div>
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


