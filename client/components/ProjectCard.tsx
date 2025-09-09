import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in-progress' | 'on-approval' | 'approved' | 'rejected';
  progress: number;
  location: string;
  deadline: string;
  documentsCount: number;
  teamSize: number;
}

const statusConfig = {
  'draft': { label: 'Черновик', color: 'bg-gray-500' },
  'in-progress': { label: 'В работе', color: 'bg-blue-500' },
  'on-approval': { label: 'На согласовании', color: 'bg-yellow-500' },
  'approved': { label: 'Согласован', color: 'bg-green-500' },
  'rejected': { label: 'Отклонен', color: 'bg-red-500' }
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {project.name}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={`${status.color} text-white ml-2 shrink-0`}
            >
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-3">
            {project.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Прогресс</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>

          {/* Deadline */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 shrink-0" />
            <span>До {project.deadline}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-1" />
              <span>{project.documentsCount} док.</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>{project.teamSize} чел.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
