import { useRole, defaultUsers, UserRole } from '../contexts/RoleContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, Settings, FileText, Building2, Users, List, BarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const roleLabels: Record<UserRole, string> = {
  director: 'Директор компании',
  rp: 'Руководитель бизнес-подразделения',
  prp: 'Помощник руководителя бизнес-подразделения',
  rkp: 'Руководитель проекта',
  tl: 'Технический лидер команды',
  architect: 'Архитектор'
};

const navigationConfig: Record<UserRole, Array<{ label: string; href: string; icon: any }>> = {
  director: [
    { label: 'Проекты', href: '/', icon: Building2 },
    { label: 'Утверждение', href: '/director', icon: Settings },
    { label: 'ТехКом', href: '/techcom', icon: Users },
    { label: 'Настройки', href: '/settings', icon: Settings }
  ],
  rp: [
    { label: 'Проекты', href: '/', icon: Building2 },
    { label: 'Утверждение', href: '/director', icon: Settings },
    { label: 'ТехКом', href: '/techcom', icon: Users }
  ],
  prp: [
    { label: 'Проекты', href: '/', icon: Building2 },
    { label: 'ТехКом', href: '/techcom', icon: Users }
  ],
  rkp: [
    { label: 'Проекты', href: '/', icon: Building2 },
    { label: 'ТехКом', href: '/techcom', icon: Users }
  ],
  tl: [
    { label: 'Проекты', href: '/', icon: Building2 },
    { label: 'Оценка задач', href: '/estimates', icon: List },
    { label: 'ТехКом', href: '/techcom', icon: Users }
  ],
  architect: [
    { label: 'Проекты', href: '/', icon: Building2 },
    { label: 'Активность архитектора', href: '/architect-activity', icon: List },
    { label: 'ТехКом', href: '/techcom', icon: Users }
  ]
};

export default function Header() {
  const { currentUser, setCurrentUser } = useRole();
  const location = useLocation();

  const navigation = navigationConfig[currentUser.role] || [];

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser(defaultUsers[role]);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      {/* Role Switcher */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <Select value={currentUser.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-64 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(roleLabels).map(([role, label]) => (
                <SelectItem key={role} value={role}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600">
            Демо режим - переключение ролей
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Р</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">РМР</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.company}</div>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
