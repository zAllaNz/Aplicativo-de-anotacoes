import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Dimensions,
  Modal,
  FlatList 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Task {
  id: string;
  text: string;
  color: string;
  createdAt: Date;
}

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
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedColor, setSelectedColor] = useState(TASK_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
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
    }
  ]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        color: selectedColor,
        createdAt: new Date()
      };
      setTasks([newTask, ...tasks]);
      setNewTaskText('');
    }
  };

  const handleLogout = () => {
    router.replace('/');
  };

  const navigateToDeletedItems = () => {
    router.push('/deleted-tasks');
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
              style={styles.headerButton} 
              onPress={navigateToDeletedItems}
            >
              <Text style={styles.headerButtonText}>🗑️ Lixeira</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleLogout}
            >
              <Text style={styles.headerButtonText}>Sair</Text>
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
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.addTaskButton} 
            onPress={addTask}
          >
            <Text style={styles.addTaskButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Lista de tarefas */}
      <ScrollView 
        style={styles.tasksContainer}
        contentContainerStyle={styles.tasksContent}
        showsVerticalScrollIndicator={false}
      >
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhuma tarefa ainda.{'\n'}
              Adicione uma nova tarefa acima! 📝
            </Text>
          </View>
        ) : (
          <View style={styles.tasksGrid}>
            {tasks.map((task) => (
              <View 
                key={task.id} 
                style={[styles.taskCard, { backgroundColor: task.color }]}
              >
                <Text style={styles.taskText}>{task.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
  taskText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
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