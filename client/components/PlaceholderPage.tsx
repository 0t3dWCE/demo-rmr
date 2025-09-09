import Layout from './Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function PlaceholderPage({ 
  title, 
  description, 
  icon = <Construction className="w-12 h-12 text-gray-300" /> 
}: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              {icon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>
            <Button variant="outline">
              Продолжить настройку
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Эта страница находится в разработке. 
              Продолжите диалог с ассистентом для наполнения содержимого.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
