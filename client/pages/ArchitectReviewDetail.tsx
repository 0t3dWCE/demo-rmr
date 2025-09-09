import Layout from '../components/Layout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const KNOWN_TEAMS = ['1C','LKK','DV','IC','BIM','TNGL'];

export default function ArchitectReviewDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { findProject, architectApprove, setArchStatus, architectStartDecompose, architectAggregateAndSendToDirector, architectAddTasks } = useProjectStore();
  const project = findProject(projectId!);

  // Локальные формы для добавления подзадач
  const [newTeam, setNewTeam] = useState<string>('1C');
  const [newName, setNewName] = useState<string>('Подготовить оценку');
  const [newDue, setNewDue] = useState<string>(project?.endDate || '');

  const handleAccept = () => {
    if (!project) return;
    // Предположим команды по пересечению с systems
    const inferredTeams = (project.systems || []).filter(s => KNOWN_TEAMS.includes(s));
    architectApprove(project.id, inferredTeams.length ? inferredTeams : []);
    navigate('/architect-activity');
  };

  const handleDecline = () => {
    if (!project) return;
    setArchStatus(project.id, 'Отклонено', 'Отклонено архитектором (демо)');
    navigate('/architect-activity');
  };

  if (!project) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-gray-600">Проект не найден</div>
          <Link to="/architect-activity" className="text-blue-600">← Назад</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          <Link to="/architect-activity" className="hover:text-blue-600">Активность архитектора</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900 font-medium">{project.name}</span>
          <span className="mx-1">/</span>
          <span className="text-gray-500">{project.id}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Задача на архитектурную оценку</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Проект</div>
                <div className="text-gray-900">{project.name} <span className="text-gray-500">({project.id})</span></div>
              </div>
              <div>
                <div className="text-gray-600">Текущий статус</div>
                <Badge variant="outline">{project.archStatus || '-'}</Badge>
              </div>
              <div>
                <div className="text-gray-600">Системы</div>
                <div className="flex flex-wrap gap-1">
                  {project.systems.map(s => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Комментарии заказчика (ПРП/РП/РП проекта) */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Комментарии заказчика</div>
              <div className="space-y-2">
                {(project.comments || []).map(c => (
                  <div key={c.id} className="p-2 border rounded text-sm">
                    <div className="text-gray-700">{c.text}</div>
                    <div className="text-xs text-gray-500">{c.date} — {c.author} ({c.authorRole})</div>
                  </div>
                ))}
                {(project.comments || []).length === 0 && (
                  <div className="text-sm text-gray-500">Комментариев нет</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" onClick={()=> architectStartDecompose(project.id)}>Начать декомпозицию</Button>
              <Button onClick={handleAccept}>Запросить оценки у команд</Button>
              <Button variant="outline" onClick={()=> architectAggregateAndSendToDirector(project.id)}>Собрать и отправить директору</Button>
              <Button variant="ghost" onClick={handleDecline}>Отклонить</Button>
            </div>

            <div className="pt-4">
              <div className="text-sm text-gray-700 mb-2">Добавить подзадачу для оценки</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Select value={newTeam} onValueChange={setNewTeam}>
                  <SelectTrigger><SelectValue placeholder="Команда" /></SelectTrigger>
                  <SelectContent>
                    {KNOWN_TEAMS.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="Название подзадачи" />
                <Input type="date" value={newDue} onChange={(e)=>setNewDue(e.target.value)} />
                <Button onClick={()=> architectAddTasks(project.id, [{ team: newTeam, name: newName, dueDate: newDue }])}>Добавить</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


