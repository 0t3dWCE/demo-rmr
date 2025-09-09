import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { Link } from 'react-router-dom';

type ReviewStatus = 'Новая' | 'На рассмотрении' | 'На уточнении' | 'Принято' | 'Отклонено' | 'Требует уточнений';

interface ReviewItem {
  id: string;
  name: string;
  customer: string;
  submitted: string;
  status: ReviewStatus;
  priority: 1 | 2 | 3 | 4 | 5;
}

const incoming: ReviewItem[] = [
  { id: 'TASK-101', name: 'Интеграция платежей', customer: 'РП Платежи', submitted: '2025-10-01', status: 'Новая', priority: 1 },
  { id: 'TASK-102', name: 'Уведомления v2', customer: 'Д Бизнес', submitted: '2025-10-02', status: 'На рассмотрении', priority: 2 },
];

const completed: ReviewItem[] = [
  { id: 'TASK-090', name: 'ЛК партнёра', customer: 'РП LKK', submitted: '2025-09-25', status: 'Принято', priority: 2 },
  { id: 'TASK-091', name: 'СМЭВ интеграция', customer: 'РП DV', submitted: '2025-09-20', status: 'Отклонено', priority: 3 },
];

export default function ArchitectActivity() {
  const { projects } = useProjectStore();
  const [qIncoming, setQIncoming] = useState('');
  const [qCompleted, setQCompleted] = useState('');
  const [status, setStatus] = useState<'all' | ReviewStatus>('all');
  const [priority, setPriority] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  const incomingFromStore = useMemo(() => (
    projects
      .filter(p => ['waiting-architect-review','architect-decomposing','waiting-team-estimates','architect-aggregating'].includes((p as any).flowStatus))
      .map(p => ({ id: p.id, name: p.name, customer: p.department, submitted: p.startDate, status: (p.archStatus || 'Новая') as ReviewStatus, priority: p.priority as 1|2|3|4|5 }))
  ), [projects]);

  const completedFromStore = useMemo(() => (
    projects
      .filter(p => ['approved','rejected'].includes((p as any).flowStatus))
      .map(p => ({ id: p.id, name: p.name, customer: p.department, submitted: p.startDate, status: (p.archStatus || 'Принято') as ReviewStatus, priority: p.priority as 1|2|3|4|5 }))
  ), [projects]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Активность архитектора</h1>
        <Tabs defaultValue="incoming">
          <TabsList>
            <TabsTrigger value="incoming">Входящие/Активные</TabsTrigger>
            <TabsTrigger value="completed">Завершённые/Отклонённые</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Input placeholder="Поиск по задаче/заказчику..." value={qIncoming} onChange={(e) => setQIncoming(e.target.value)} />
              </div>
              <Select value={status} onValueChange={setStatus as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {(['Новая','На рассмотрении','На уточнении'] as ReviewStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {[1,2,3,4,5].map(p => (
                    <SelectItem key={p} value={String(p)}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {incomingFromStore
              .filter(i => (i.name.toLowerCase().includes(qIncoming.toLowerCase()) || i.customer.toLowerCase().includes(qIncoming.toLowerCase())))
              .filter(i => status === 'all' || i.status === status)
              .filter(i => priority === 'all' || String(i.priority) === priority)
              .map(i => (
                <Card key={i.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{i.name} <span className="text-xs text-gray-500">({i.id})</span></div>
                    <div className="text-sm text-gray-600">{i.customer} • от {i.submitted}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{i.status}</Badge>
                    <Badge variant="outline">P{i.priority}</Badge>
                    <Link to={`/architect-activity/${i.id}`}>
                      <Button variant="outline" size="sm">Открыть</Button>
                    </Link>
                  </div>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Input placeholder="Поиск по задаче/заказчику..." value={qCompleted} onChange={(e) => setQCompleted(e.target.value)} />
              </div>
              <div className="md:col-span-2" />
            </div>
            {completedFromStore
              .filter(i => i.name.toLowerCase().includes(qCompleted.toLowerCase()) || i.customer.toLowerCase().includes(qCompleted.toLowerCase()))
              .map(i => (
                <Card key={i.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{i.name} <span className="text-xs text-gray-500">({i.id})</span></div>
                    <div className="text-sm text-gray-600">{i.customer} • отправлено {i.submitted}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{i.status}</Badge>
                    <Badge variant="outline">P{i.priority}</Badge>
                    <Button variant="outline" size="sm">Детали</Button>
                  </div>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}


