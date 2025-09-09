import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../contexts/ProjectStoreContext';

export default function CreateProject() {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<string>('3');
  const [department, setDepartment] = useState('');
  const [systems, setSystems] = useState<string[]>([]);
  const [requiresArch, setRequiresArch] = useState(true);
  const [comment, setComment] = useState('');

  const canSubmit = name.length >= 5 && name.length <= 200 && startDate && endDate && comment.length >= 50 && department && systems.length > 0;

  const priorityHint = useMemo(() => {
    if (priority === '1' || priority === '2') return 'Высокий приоритет — архитектурная оценка включена по умолчанию';
    return 'Можно отключить архитектурную оценку при необходимости';
  }, [priority]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const proj = createProject({
      name,
      startDate,
      endDate,
      priority: Number(priority),
      department,
      systems,
      requiresArch,
      comment
    });
    navigate(`/projects/${proj.id}`);
  };

  const toggleSystem = (sys: string) => {
    setSystems(prev => prev.includes(sys) ? prev.filter(s => s !== sys) : [...prev, sys]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Создание проекта</h1>

        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Название проекта</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Минимум 5 символов" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Дата начала</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Дата окончания</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Приоритет</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500 mt-1">{priorityHint}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Департамент-исполнитель</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите департамент" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1C">1C</SelectItem>
                    <SelectItem value="LKK">LKK</SelectItem>
                    <SelectItem value="DV">DV</SelectItem>
                    <SelectItem value="IC">IC</SelectItem>
                    <SelectItem value="BIM">BIM</SelectItem>
                    <SelectItem value="TNGL">TNGL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Системы взаимодействия</label>
                <div className="flex flex-wrap gap-2">
                  {['1C','LKK','DV','IC','BIM','TNGL'].map(s => (
                    <Button key={s} type="button" variant={systems.includes(s) ? 'default' : 'outline'} size="sm" onClick={() => toggleSystem(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input id="requiresArch" type="checkbox" checked={requiresArch} onChange={(e) => setRequiresArch(e.target.checked)} />
              <label htmlFor="requiresArch" className="text-sm text-gray-700">Требует архитектурной оценки (по умолчанию для приоритетов 1-2)</label>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Комментарий (описание, минимум 50 символов)</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={6} />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => navigate('/')}>Отмена</Button>
              <Button disabled={!canSubmit} onClick={handleSubmit}>Создать проект</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


