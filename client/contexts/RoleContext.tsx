import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 
  | 'director'        // Директор (Д)
  | 'rp'              // Руководитель подразделения (РП)
  | 'prp'             // Помощник руководителя подразделения (ПРП)
  | 'rkp'             // Руководитель команды проекта (РКП)
  | 'tl'              // Тех/Тим Лид (ТЛ)
  | 'architect';      // Архитектор (А)

export interface User {
  name: string;
  role: UserRole;
  email: string;
  company?: string;
}

interface RoleContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const defaultUsers: Record<UserRole, User> = {
  director: {
    name: 'Директор компании',
    role: 'director',
    email: 'director@company.ru',
    company: 'Компания'
  },
  rp: {
    name: 'Руководитель бизнес-подразделения',
    role: 'rp', 
    email: 'rp@company.ru',
    company: 'Подразделение'
  },
  prp: {
    name: 'Помощник руководителя бизнес-подразделения',
    role: 'prp',
    email: 'prp@company.ru',
    company: 'Подразделение'
  },
  rkp: {
    name: 'Руководитель проекта',
    role: 'rkp',
    email: 'rkp@company.ru',
    company: 'Команда'
  },
  tl: {
    name: 'Технический лидер команды',
    role: 'tl',
    email: 'tl@company.ru',
    company: 'Команда'
  },
  architect: {
    name: 'Архитектор',
    role: 'architect',
    email: 'architect@company.ru',
    company: 'Архитектура'
  }
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultUsers['director']);

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export { defaultUsers };
