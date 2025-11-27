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
  StatusBar,
  Platform,
  Pressable,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { arrayMove } from '@dnd-kit/sortable';
import { LinearGradient } from 'expo-linear-gradient';
import ReorderableList, { useReorderableDrag, useIsActive } from 'react-native-reorderable-list';
import { Gesture } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useTaskContext, Task } from '@/contexts/TaskContext';
import { createNote } from '@/services/noteService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Platform.OS === 'web' ? (width - 60) / 2 : width - 40;

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
  const { tasks, deletedTasks, addTask, updateTask, deleteTask, reorderTasks, setTaskMode, updateTaskItems, toggleItemChecked, addTaskItem } = useTaskContext();
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedColor, setSelectedColor] = useState(TASK_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');


  const [lastAddedItemId, setLastAddedItemId] = useState<string | null>(null);

  console.log('TasksScreen - Total de tarefas:', tasks.length);
  console.log('TasksScreen - Plataforma:', Platform.OS);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask({ text: newTaskText.trim(), color: selectedColor });
      createNote({ title: newTaskText.trim(), content: '', type: 'text' })
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

  

  // Componente SwipeableItem com react-native-gesture-handler
  const SwipeableItem = ({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) => {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const SWIPE_THRESHOLD = -80;
    const isActive = useIsActive();

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    const deleteButtonStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [SWIPE_THRESHOLD, 0],
        [1, 0],
        Extrapolate.CLAMP
      );
      return {
        opacity,
        width: Math.abs(translateX.value),
      };
    });

    const onGestureEvent = (event: any) => {
      translateX.value = startX.value + event.nativeEvent.translationX;
    };

    const onHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        if (translateX.value < SWIPE_THRESHOLD / 2) {
          translateX.value = withSpring(SWIPE_THRESHOLD);
        } else {
          translateX.value = withSpring(0);
        }
        startX.value = translateX.value;
      }
    };

    const handleDelete = () => {
      translateX.value = withSpring(-200);
      setTimeout(() => {
        onDelete();
      }, 200);
    };

    return (
      <View style={{ marginBottom: 15 }}>
        <View style={styles.deleteButtonContainer}>
          <Animated.View style={[styles.swipeDelete, deleteButtonStyle]}>
            <TouchableOpacity style={styles.swipeDeleteInner} onPress={handleDelete}>
              <Text style={styles.swipeDeleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <PanGestureHandler
          enabled={!isActive}
          activeOffsetX={[-20, 20]}
          failOffsetY={[-10, 10]}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={animatedStyle}>
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  
  
  

  const MobileReorderableItem = ({ item }: { item: Task }) => {
    const drag = useReorderableDrag();
    const isEditing = editingTaskId === item.id;
    return (
      <SwipeableItem onDelete={() => handleDeleteTask(item.id)}>
        <View style={[styles.taskCard, { backgroundColor: item.color }]}> 
          {isEditing ? (
            <View style={styles.editingContainer}>
              {item.mode === 'list' ? (
                <View style={styles.listContainer}>
                  {(item.items || []).map((it) => (
                    <View key={it.id} style={styles.listItemRow}>
                      <TouchableOpacity
                        style={[styles.checkbox, it.checked && styles.checkboxChecked]}
                        onPress={() => toggleItemChecked(item.id, it.id)}
                      >
                        <Text style={styles.checkboxText}>{it.checked ? '✓' : ''}</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.listItemInput}
                        value={it.text}
                        autoFocus={it.id === lastAddedItemId}
                        onChangeText={(txt) => {
                          const next = (item.items || []).map((i) => (i.id === it.id ? { ...i, text: txt } : i));
                          updateTaskItems(item.id, next);
                        }}
                      />
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                      style={styles.addItemButton}
                      onPress={() => {
                        const newId = addTaskItem(item.id);
                        setLastAddedItemId(newId);
                      }}
                    >
                      <Text style={styles.addItemText}>+ Item</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TextInput
                  style={styles.editingInput}
                  value={editingText}
                  onChangeText={setEditingText}
                  multiline
                  autoFocus
                  onSubmitEditing={saveEditedTask}
                  returnKeyType="done"
                />
              )}
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
              {item.mode === 'list' ? (
                <View style={{ flex: 1 }}>
                  {(item.items || []).map((it) => (
                    <View key={it.id} style={styles.listItemRow}>
                      <TouchableOpacity
                        style={[styles.checkbox, it.checked && styles.checkboxChecked]}
                        onPress={() => toggleItemChecked(item.id, it.id)}
                      >
                        <Text style={styles.checkboxText}>{it.checked ? '✓' : ''}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => startEditingTask(item)}>
                        <Text style={[styles.taskText, it.checked && { textDecorationLine: 'line-through', color: '#666' }]}>
                          {it.text}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity style={styles.taskTextContainer} onPress={() => startEditingTask(item)}>
                  <Text style={styles.taskText}>{item.text}</Text>
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.modeToggleButton}
                  onPress={() => setTaskMode(item.id, item.mode === 'list' ? 'text' : 'list')}
                >
                  <Text style={styles.modeToggleText}>{item.mode === 'list' ? 'Texto' : 'Lista'}</Text>
                </TouchableOpacity>
                {item.mode === 'list' && (
                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={() => {
                      const newId = addTaskItem(item.id);
                      setLastAddedItemId(newId);
                      startEditingTask(item);
                    }}
                  >
                    <Text style={styles.addItemText}>+ Item</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTask(item.id)}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
                <Pressable style={styles.dragHandle} onLongPress={drag} delayLongPress={150}>
                  <Text style={styles.dragHandleIcon}>≡</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </SwipeableItem>
    );
  };

  

  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <View style={styles.tasksContainer}>
            <View style={styles.tasksContent}>
              {tasks.map((task) => (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    { backgroundColor: task.color },
                  ]}
                >
                  {editingTaskId === task.id ? (
                    <View style={styles.editingContainer}>
                      {task.mode === 'list' ? (
                        <View style={styles.listContainer}>
                          {(task.items || []).map((it) => (
                            <View key={it.id} style={styles.listItemRow}>
                              <TouchableOpacity
                                style={[styles.checkbox, it.checked && styles.checkboxChecked]}
                                onPress={() => toggleItemChecked(task.id, it.id)}
                              >
                                <Text style={styles.checkboxText}>{it.checked ? '✓' : ''}</Text>
                              </TouchableOpacity>
                              <TextInput
                                style={styles.listItemInput}
                                value={it.text}
                                autoFocus={it.id === lastAddedItemId}
                                onChangeText={(txt) => {
                                  const next = (task.items || []).map((i) => (i.id === it.id ? { ...i, text: txt } : i));
                                  updateTaskItems(task.id, next);
                                }}
                              />
                            </View>
                          ))}
                          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity
                              style={styles.addItemButton}
                              onPress={() => {
                                const newId = addTaskItem(task.id);
                                setLastAddedItemId(newId);
                              }}
                            >
                              <Text style={styles.addItemText}>+ Item</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TextInput
                          style={styles.editingInput}
                          value={editingText}
                          onChangeText={setEditingText}
                          multiline
                          autoFocus
                          onSubmitEditing={saveEditedTask}
                          returnKeyType="done"
                        />
                      )}
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
                      {task.mode === 'list' ? (
                        <View style={{ flex: 1 }}>
                          {(task.items || []).map((it) => (
                            <View key={it.id} style={styles.listItemRow}>
                              <TouchableOpacity
                                style={[styles.checkbox, it.checked && styles.checkboxChecked]}
                                onPress={() => toggleItemChecked(task.id, it.id)}
                              >
                                <Text style={styles.checkboxText}>{it.checked ? '✓' : ''}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={{ flex: 1 }} onPress={() => startEditingTask(task)}>
                                <Text style={[styles.taskText, it.checked && { textDecorationLine: 'line-through', color: '#666' }]}>
                                  {it.text}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.taskTextContainer} onPress={() => startEditingTask(task)}>
                          <Text style={styles.taskText}>{task.text}</Text>
                        </TouchableOpacity>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                          style={styles.modeToggleButton}
                          onPress={() => setTaskMode(task.id, task.mode === 'list' ? 'text' : 'list')}
                        >
                          <Text style={styles.modeToggleText}>{task.mode === 'list' ? 'Texto' : 'Lista'}</Text>
                        </TouchableOpacity>
                        {task.mode === 'list' && (
                          <TouchableOpacity
                            style={styles.addItemButton}
                            onPress={() => {
                              const newId = addTaskItem(task.id);
                              setLastAddedItemId(newId);
                              startEditingTask(task);
                            }}
                          >
                            <Text style={styles.addItemText}>+ Item</Text>
                          </TouchableOpacity>
                        )}
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
              ))}
            </View>
          </View>
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
          <ReorderableList
            data={tasks}
            keyExtractor={(item: Task) => item.id}
            contentContainerStyle={styles.tasksContent}
            onReorder={({ from, to }: { from: number; to: number }) => {
              const newTasks = arrayMove(tasks, from, to);
              reorderTasks(newTasks);
            }}
            panEnabled
            panGesture={Gesture.Pan().activeOffsetY([-10, 10]).failOffsetX([-20, 20])}
            panActivateAfterLongPress={150}
            renderItem={({ item }: { item: Task }) => <MobileReorderableItem item={item} />}
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
    </GestureHandlerRootView>
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
    width: CARD_WIDTH, // largura responsiva: 2 colunas no web, 1 coluna no mobile
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
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleIcon: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  swipeDelete: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderRadius: 12,
  },
  swipeDeleteInner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  swipeDeleteIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  modeToggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 8,
  },
  modeToggleText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  addItemButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 8,
  },
  addItemText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
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
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  listContainer: {
    marginTop: 4,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listItemInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
