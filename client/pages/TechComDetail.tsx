import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, Link } from 'react-router-dom';
import { useProjectStore } from '../contexts/ProjectStoreContext';
import { useRole } from '../contexts/RoleContext';

export default function TechComDetail() {
  const { id } = useParams();
  const { techComs, completeTechCom, rejectTechCom } = useProjectStore();
  const { currentUser } = useRole();
  
  const techCom = techComs.find(tc => tc.id === id);
  
  if (!techCom) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">ТехКом не найден</h2>
          <Link to="/techcom" className="text-blue-600 hover:underline mt-4 inline-block">
            Вернуться к списку ТехКомов
          </Link>
        </div>
      </Layout>
    );
  }
  
  const isRKP = currentUser.role === 'rkp';
  const canManage = isRKP && techCom.status === 'Запланирован';
  
  // Цветовое кодирование статуса
  const statusVariant = 
    techCom.status === 'Завершен' ? 'default' : 
    techCom.status === 'Отклонен' ? 'destructive' : 
    'outline';
  
  const handleComplete = () => {
    if (techCom.id) {
      completeTechCom(techCom.id);
    }
  };
  
  const handleReject = () => {
    if (techCom.id) {
      rejectTechCom(techCom.id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          <Link to="/techcom" className="hover:text-blue-600">ТехКом</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900 font-medium">{techCom.title}</span>
          <span className="mx-1">/</span>
          <span className="text-gray-500">{id}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{techCom.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{techCom.type}</Badge>
                <Badge variant={statusVariant}>{techCom.status}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Дата и время</div>
                <div className="text-gray-900">{techCom.date}</div>
              </div>
              <div>
                <div className="text-gray-600">Проект/Команда</div>
                <div className="text-gray-900">{techCom.related}</div>
              </div>
              <div>
                <div className="text-gray-600">Статус</div>
                <Badge variant={statusVariant}>{techCom.status}</Badge>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Участники</div>
              <div className="text-sm text-gray-900">{techCom.participants}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">Изменения приоритетов в EVA</div>
              {techCom.evaChanges && techCom.evaChanges.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Тикет EVA</th>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Старый приоритет</th>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">Новый приоритет</th>
                      </tr>
                    </thead>
                    <tbody>
                      {techCom.evaChanges.map((change, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="px-4 py-3 font-medium text-gray-900">{change.ticket}</td>
                          <td className="px-4 py-3 text-gray-700">{change.oldPriority}</td>
                          <td className="px-4 py-3 text-gray-700">{change.newPriority}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600">
                  Изменения приоритетов еще не синхронизированы из EVA
                </div>
              )}
            </div>

            {canManage && (
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Завершить ТехКом
                </Button>
                <Button 
                  onClick={handleReject}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Отклонить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


