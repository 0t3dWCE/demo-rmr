import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams, Link } from 'react-router-dom';

const mock = {
  id: 'TECH-001',
  title: 'Приоритизация Q4',
  date: '2025-11-15 14:00',
  type: 'онлайн',
  related: { id: 'PRJ-001', name: 'Интеграция с 1С', eva: 'EVA-12345' },
  participants: [
    { name: 'Петров П.П.', role: 'Д', organizer: true },
    { name: 'Иванов И.И.', role: 'РП' },
    { name: 'Сидоров С.С.', role: 'ТЛ' },
  ],
  resolution: [
    { projectId: 'PRJ-023', oldPriority: 2, newPriority: 3, reason: 'Зависимость от внешней системы' },
    { projectId: 'PRJ-024', oldPriority: 3, newPriority: 2, reason: 'Критический для бизнеса' },
  ]
};

export default function TechComDetail() {
  const { id } = useParams();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          <Link to="/techcom" className="hover:text-blue-600">ТехКом</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900 font-medium">{mock.title}</span>
          <span className="mx-1">/</span>
          <span className="text-gray-500">{id}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{mock.title}</span>
              <Badge variant="outline">{mock.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Дата и время</div>
                <div className="text-gray-900">{mock.date}</div>
              </div>
              <div>
                <div className="text-gray-600">Проект</div>
                <div className="text-gray-900">{mock.related.id} • {mock.related.name}</div>
              </div>
              <div>
                <div className="text-gray-600">Связь с Eva</div>
                <div className="text-blue-600">{mock.related.eva}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Участники</div>
              <div className="flex flex-wrap gap-2">
                {mock.participants.map(p => (
                  <Badge key={p.name} variant="outline">{p.name} ({p.role}){p.organizer ? ' • организатор' : ''}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Резолюция</div>
              <div className="space-y-2 text-sm">
                {mock.resolution.map((r, idx) => (
                  <div key={idx} className="p-3 border rounded-md">
                    <div className="font-medium text-gray-900">{r.projectId}: {r.oldPriority} → {r.newPriority}</div>
                    <div className="text-gray-600">{r.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


