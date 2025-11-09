import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTaskContext, Task } from '@/contexts/TaskContext';

const { width } = Dimensions.get('window');

// Cores disponíveis para os post-its
const TASK_COLORS = [
  '#FFE066', // Amarelo
  '#FF9999', // Rosa claro
  '#99CCFF', // Azul claro
  '#99FF99', // Verde claro
  '#FFCC99', // Laranja claro
  '#CC99FF', // Roxo claro
  '#FFB3E6', // Rosa
  '#B3FFB3', // Verde menta
  '#FFD700', // Dourado
  '#87CEEB', // Azul céu
  '#DDA0DD', // Ameixa
  '#F0E68C'  // Cáqui
];

export default function TasksScreen() {
  const { tasks, deletedTasks, addTask, updateTask, deleteTask, reorderTasks } = useTaskContext();
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedColor, setSelectedColor] = useState(TASK_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        color: selectedColor,
        createdAt: new Date()
      };
      addTask(newTask);
      setNewTaskText('');
    }
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEditedTask = () => {
    if (editingText.trim() && editingTaskId) {
      updateTask(editingTaskId, editingText.trim());
      setEditingTaskId(null);
      setEditingText('');
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    // Cancela edição se estiver editando esta tarefa
    if (editingTaskId === taskId) {
      cancelEditing();
    }
  };

  const handleDeletedItems = () => {
    router.push('/deleted-items');
  };

  const handleLogout = () => {
    router.replace('/');
  };

  const navigateToDeletedItems = () => {
    router.push('/deleted-items');
  };

  // Web: sensores do dnd-kit para arrastar no navegador
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleWebDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === String(active.id));
    const newIndex = tasks.findIndex((t) => t.id === String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const WebSortableItem: React.FC<{ task: Task }> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: task.id });
    const transformStyleArray = transform
      ? [
          { translateX: transform.x },
          { translateY: transform.y },
          { scaleX: transform.scaleX },
          { scaleY: transform.scaleY },
        ]
      : [];
    if (isDragging) {
      transformStyleArray.push({ scaleX: 1.02 });
      transformStyleArray.push({ scaleY: 1.02 });
    }
    return (
      <View
        ref={(node) => (setNodeRef as any)(node)}
        style={[
          styles.taskCard,
          { backgroundColor: task.color },
          { transform: transformStyleArray },
          isDragging && styles.draggingCard,
        ]}
        {...(listeners as any)}
      >
        {editingTaskId === task.id ? (
          <View style={styles.editingContainer}>
            <TextInput
              style={styles.editingInput}
              value={editingText}
              onChangeText={setEditingText}
              multiline
              autoFocus
              onSubmitEditing={saveEditedTask}
              returnKeyType="done"
            />
            <View style={styles.editingButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEditedTask}>
                <Text style={styles.saveButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.taskViewContainer}>
            <TouchableOpacity style={styles.taskTextContainer} onPress={() => startEditingTask(task)}>
              <Text style={styles.taskText}>{task.text}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTask(task.id)}>
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
              <View style={styles.dragHandle}>
                <Text style={styles.dragHandleIcon}>≡</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderDraggableItem = ({ item, drag }: RenderItemParams<Task>) => {
    const isEditing = editingTaskId === item.id;
    return (
      <View style={[styles.taskCard, { backgroundColor: item.color }]}>        
        {isEditing ? (
          <View style={styles.editingContainer}>
            <TextInput
              style={styles.editingInput}
              value={editingText}
              onChangeText={setEditingText}
              multiline
              autoFocus
              onSubmitEditing={saveEditedTask}
              returnKeyType="done"
            />
            <View style={styles.editingButtons}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={saveEditedTask}
              >
                <Text style={styles.saveButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={cancelEditing}
              >
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.taskViewContainer}>
            <TouchableOpacity 
              style={styles.taskTextContainer}
              onPress={() => startEditingTask(item)}
            >
              <Text style={styles.taskText}>{item.text}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteTask(item.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dragHandle}
                delayLongPress={150}
                onLongPress={drag}
              >
                <Text style={styles.dragHandleIcon}>≡</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header fixo */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📝 Minhas Tarefas</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.deletedItemsButton}
              onPress={handleDeletedItems}
            >
              <Text style={styles.deletedItemsButtonText}>🗑️ Excluídos ({deletedTasks.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo fixo para adicionar tarefa */}
        <View style={styles.addTaskContainer}>
          <TouchableOpacity 
            style={[styles.colorSelector, { backgroundColor: selectedColor }]}
            onPress={() => setShowColorPicker(true)}
          >
            <Text style={styles.colorSelectorText}>🎨</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.addTaskInput}
            placeholder="Digite uma nova tarefa..."
            placeholderTextColor="#999"
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.addTaskButton} 
            onPress={handleAddTask}
          >
            <Text style={styles.addTaskButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Lista de tarefas com arrastar e soltar */}
      {Platform.OS === 'web' ? (
        tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhuma tarefa ainda.{'\n'}
              Adicione uma nova tarefa acima! 📝
            </Text>
          </View>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleWebDragEnd}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <View style={styles.tasksContainer}>
                <View style={styles.tasksContent}>
                  {tasks.map((task) => (
                    <WebSortableItem key={task.id} task={task} />
                  ))}
                </View>
              </View>
            </SortableContext>
          </DndContext>
        )
      ) : (
        tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhuma tarefa ainda.{'\n'}
              Adicione uma nova tarefa acima! 📝
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderDraggableItem}
            onDragEnd={({ data }) => reorderTasks(data)}
            style={styles.tasksContainer}
            contentContainerStyle={styles.tasksContent}
            showsVerticalScrollIndicator
          />
        )
      )}

      {/* Modal de seleção de cores */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerModal}>
            <Text style={styles.modalTitle}>Escolha uma cor</Text>
            <FlatList
              data={TASK_COLORS}
              numColumns={4}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.colorOption,
                    { backgroundColor: item },
                    selectedColor === item && styles.selectedColorOption
                  ]}
                  onPress={() => {
                    setSelectedColor(item);
                    setShowColorPicker(false);
                  }}
                />
              )}
              contentContainerStyle={styles.colorGrid}
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  deletedItemsButton: {
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  deletedItemsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSelector: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorSelectorText: {
    fontSize: 16,
  },
  addTaskInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 5,
    color: '#333',
  },
  addTaskButton: {
    backgroundColor: '#667eea',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addTaskButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tasksContainer: {
    flex: 1,
  },
  tasksContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskCard: {
    width: (width - 60) / 2, // 2 colunas com espaçamento
    minHeight: 120,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Efeito de post-it
    transform: [{ rotate: `${Math.random() * 4 - 2}deg` }],
  },
  taskTextContainer: {
    flex: 1,
  },
  taskViewContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  dragHandle: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 8,
  },
  dragHandleIcon: {
    fontSize: 18,
    color: '#333',
  },
  draggingCard: {
    opacity: 0.95,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
    position: 'relative',
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
  },
  editingContainer: {
    flex: 1,
  },
  editingInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editingButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos do modal de cores
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    alignItems: 'center',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedColorOption: {
    borderColor: '#667eea',
    borderWidth: 3,
  },
  closeModalButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});