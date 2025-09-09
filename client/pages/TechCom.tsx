import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface TechComItem {
  id: string;
  title: string;
  date: string;
  type: 'онлайн' | 'офлайн';
  related: string; // PRJ-xxx
  participants: number;
  resolution?: string;
}

const mock: TechComItem[] = [
  { id: 'TECH-001', title: 'Приоритизация Q4', date: '2025-11-15 14:00', type: 'онлайн', related: 'PRJ-001', participants: 6, resolution: 'PRJ-001 (2 → 3)' },
  { id: 'TECH-002', title: 'Очередность задач IC', date: '2025-11-20 10:00', type: 'офлайн', related: 'PRJ-002', participants: 4 },
];

export default function TechCom() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | 'онлайн' | 'офлайн'>('all');
  const [open, setOpen] = useState(false);

  const filtered = mock.filter(item => {
    const matchesQ = item.title.toLowerCase().includes(q.toLowerCase()) || item.related.toLowerCase().includes(q.toLowerCase());
    const matchesType = type === 'all' || item.type === type;
    return matchesQ && matchesType;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">ТехКом — Технический комитет</h1>
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
          <Input placeholder="Поиск по теме или проекту..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={type} onValueChange={setType as any}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="онлайн">Онлайн</SelectItem>
              <SelectItem value="офлайн">Офлайн</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Создать ТехКом</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создание ТехКом</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Input placeholder="Тема ТехКом" />
                <div className="grid grid-cols-2 gap-3">
                  <Select defaultValue="онлайн">
                    <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="онлайн">Онлайн</SelectItem>
                      <SelectItem value="офлайн">Офлайн</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="datetime-local" />
                </div>
                <Input placeholder="Проект/задача (PRJ-..., EVA-...)" />
                <Input placeholder="Участники (через запятую)" />
                <Button onClick={() => setOpen(false)}>Создать</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-2 text-xs text-gray-500 border-b">
            <div className="col-span-4">Тема</div>
            <div className="col-span-2">Дата</div>
            <div className="col-span-2">Тип</div>
            <div className="col-span-2">Проект</div>
            <div className="col-span-2">Резолюция</div>
          </div>
          {filtered.map(i => (
            <Link to={`/techcom/${i.id}`}>
              <Card className="rounded-none shadow-none border-0 border-b last:border-b-0 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-0 px-4 py-3 items-center">
                  <div className="col-span-4 text-sm font-medium text-gray-900">{i.title}</div>
                  <div className="col-span-2 text-sm">{i.date}</div>
                  <div className="col-span-2"><Badge variant="outline">{i.type}</Badge></div>
                  <div className="col-span-2 text-sm">{i.related}</div>
                  <div className="col-span-2 text-sm text-gray-700">{i.resolution || '-'}</div>
                </div>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">Нет записей</div>
          )}
        </div>
      </div>
    </Layout>
  );
}


