import Layout from '../components/Layout';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function DirectorApprove() {
  const { projects, directorApprove, directorReject } = useProjectStore();
  const waiting = projects.filter(p => p.flowStatus === 'waiting-director-approve');

  const calcSummary = (pid: string) => {
    const p = projects.find(pp => pp.id === pid);
    if (!p) return { total: 0, bySize: {} as Record<string, number> };
    const done = p.tasks.filter(t => t.size !== 'неопределен');
    const total = done.length;
    const bySize: Record<string, number> = {};
    done.forEach(t => { bySize[t.size] = (bySize[t.size] || 0) + 1; });
    return { total, bySize };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Утверждение проектов</h1>
        {waiting.map(p => {
          const summary = calcSummary(p.id);
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{p.id}</div>
                  <div className="text-lg font-medium text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-700 mt-1">Оценок: {summary.total} — {Object.entries(summary.bySize).map(([k,v]) => `${k}:${v}`).join(', ') || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Статус: ожидание утверждения</Badge>
                  <Link to={`/projects/${p.id}`}>
                    <Button variant="outline">Открыть проект</Button>
                  </Link>
                  <Button onClick={()=> directorApprove(p.id)}>Утвердить</Button>
                  <Button variant="outline" onClick={()=> directorReject(p.id)}>Отклонить</Button>
                </div>
              </div>
            </Card>
          );
        })}
        {waiting.length === 0 && (
          <div className="p-8 text-center text-gray-500">Нет проектов, ожидающих утверждение</div>
        )}
      </div>
    </Layout>
  );
}


