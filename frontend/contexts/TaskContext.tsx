import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  text: string;
  color: string;
  createdAt: Date;
  deletedAt?: Date;
}

interface TaskContextType {
  tasks: Task[];
  deletedTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentlyDeleteTask: (id: string) => void;
  clearAllDeleted: () => void;
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
      createdAt: new Date()
    },
    {
      id: '2', 
      text: 'Estudar React Native',
      color: '#99CCFF',
      createdAt: new Date()
    },
    {
      id: '3',
      text: 'Fazer exercícios físicos',
      color: '#99FF99',
      createdAt: new Date()
    },
    {
      id: '4',
      text: 'Ler um livro',
      color: '#FFCC99',
      createdAt: new Date()
    }
  ]);

  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: taskData.text,
      color: taskData.color,
      createdAt: new Date()
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

  const value: TaskContextType = {
    tasks,
    deletedTasks,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    clearAllDeleted,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};