import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TaskListItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Task {
  id: string;
  text: string;
  color: string;
  createdAt: Date;
  deletedAt?: Date;
  mode?: 'text' | 'list';
  items?: TaskListItem[];
}

interface TaskContextType {
  tasks: Task[];
  deletedTasks: Task[];
  addTask: (task: { text: string; color: string; mode?: 'text' | 'list'; items?: TaskListItem[] }) => void;
  updateTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentlyDeleteTask: (id: string) => void;
  clearAllDeleted: () => void;
  reorderTasks: (newOrder: Task[]) => void;
  setTaskMode: (id: string, mode: 'text' | 'list') => void;
  updateTaskItems: (id: string, items: TaskListItem[]) => void;
  toggleItemChecked: (taskId: string, itemId: string) => void;
  addTaskItem: (taskId: string, text?: string) => string;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    // Dados mockados para demonstração
    {
      id: '1',
      text: 'Comprar ingredientes para o jantar',
      color: '#FFE066',
      createdAt: new Date(),
      mode: 'text'
    },
    {
      id: '2', 
      text: 'Estudar React Native',
      color: '#99CCFF',
      createdAt: new Date(),
      mode: 'text'
    },
    {
      id: '3',
      text: 'Fazer exercícios físicos',
      color: '#99FF99',
      createdAt: new Date(),
      mode: 'text'
    },
    {
      id: '4',
      text: 'Ler um livro',
      color: '#FFCC99',
      createdAt: new Date(),
      mode: 'text'
    }
  ]);

  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);

  const addTask = (taskData: { text: string; color: string; mode?: 'text' | 'list'; items?: TaskListItem[] }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: taskData.text,
      color: taskData.color,
      createdAt: new Date(),
      mode: taskData.mode ?? 'text',
      items: taskData.items ?? []
    };
    setTasks([newTask, ...tasks]);
  };

  const updateTask = (id: string, text: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, text } : task
    ));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete) {
      // Move para itens excluídos
      setDeletedTasks([...deletedTasks, { ...taskToDelete, deletedAt: new Date() }]);
      // Remove da lista principal
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const restoreTask = (id: string) => {
    const taskToRestore = deletedTasks.find(task => task.id === id);
    if (taskToRestore) {
      // Remove deletedAt e move de volta para tarefas ativas
      const { deletedAt, ...restoredTask } = taskToRestore;
      setTasks([restoredTask, ...tasks]);
      setDeletedTasks(deletedTasks.filter(task => task.id !== id));
    }
  };

  const permanentlyDeleteTask = (id: string) => {
    setDeletedTasks(deletedTasks.filter(task => task.id !== id));
  };

  const clearAllDeleted = () => {
    setDeletedTasks([]);
  };

  const reorderTasks = (newOrder: Task[]) => {
    setTasks(newOrder);
  };

  const setTaskMode = (id: string, mode: 'text' | 'list') => {
    setTasks(tasks.map(task => {
      if (task.id !== id) return task;
      // conversão básica entre modos
      if (mode === 'list') {
        const lines = (task.text || '').split('\n').filter(l => l.trim().length > 0);
        const items: TaskListItem[] = lines.map((t, idx) => ({ id: `${Date.now()}-${idx}`, text: t, checked: false }));
        return { ...task, mode: 'list', items };
      } else {
        const text = (task.items || []).map(i => i.text).join('\n');
        return { ...task, mode: 'text', text, items: [] };
      }
    }));
  };

  const updateTaskItems = (id: string, items: TaskListItem[]) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, items } : task));
  };

  const toggleItemChecked = (taskId: string, itemId: string) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      const updated = (task.items || []).map(item => item.id === itemId ? { ...item, checked: !item.checked } : item);
      // Reordenar: itens não marcados primeiro, marcados ao final (ordem estável)
      const reordered = [
        ...updated.filter(i => !i.checked),
        ...updated.filter(i => i.checked),
      ];
      return { ...task, items: reordered };
    }));
  };

  const addTaskItem = (taskId: string, text: string = ''): string => {
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      const newItem: TaskListItem = {
        id: newId,
        text,
        checked: false,
      };
      const items = [...(task.items || []), newItem];
      return { ...task, items };
    }));
    return newId;
  };

  const value: TaskContextType = {
    tasks,
    deletedTasks,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    clearAllDeleted,
    reorderTasks,
    setTaskMode,
    updateTaskItems,
    toggleItemChecked,
    addTaskItem,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};