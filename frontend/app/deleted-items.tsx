import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTaskContext } from '@/contexts/TaskContext';

export default function DeletedItemsScreen() {
  const { deletedTasks, restoreTask, permanentlyDeleteTask, clearAllDeleted } = useTaskContext();

  const handleRestoreTask = (taskId: string) => {
    Alert.alert(
      'Restaurar Tarefa',
      'Deseja restaurar esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            restoreTask(taskId);
            Alert.alert('Sucesso', 'Tarefa restaurada com sucesso!');
          },
        },
      ]
    );
  };

  const handlePermanentlyDelete = (taskId: string) => {
    Alert.alert(
      'Excluir Permanentemente',
      'Esta ação não pode ser desfeita. Deseja excluir permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            permanentlyDeleteTask(taskId);
            Alert.alert('Sucesso', 'Tarefa excluída permanentemente!');
          },
        },
      ]
    );
  };

  const handleClearAllDeleted = () => {
    Alert.alert(
      'Limpar Tudo',
      'Deseja excluir permanentemente todas as tarefas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Tudo',
          style: 'destructive',
          onPress: () => {
            clearAllDeleted();
            Alert.alert('Sucesso', 'Todas as tarefas foram excluídas permanentemente!');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Itens Excluídos</Text>
        {deletedTasks.length > 0 && (
          <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAllDeleted}>
            <Text style={styles.clearAllButtonText}>Limpar Tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {deletedTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗑️</Text>
            <Text style={styles.emptyTitle}>Nenhum item excluído</Text>
            <Text style={styles.emptySubtitle}>
              As tarefas excluídas aparecerão aqui
            </Text>
          </View>
        ) : (
          <View style={styles.tasksGrid}>
            {deletedTasks.map((task) => (
              <View 
                key={task.id} 
                style={[styles.taskCard, { backgroundColor: task.color }]}
              >
                <Text style={styles.taskText}>{task.text}</Text>
                <Text style={styles.deletedDate}>
                  Excluído em: {task.deletedAt?.toLocaleDateString('pt-BR')}
                </Text>
                
                <View style={styles.taskActions}>
                  <TouchableOpacity 
                    style={styles.restoreButton}
                    onPress={() => handleRestoreTask(task.id)}
                  >
                    <Text style={styles.restoreButtonText}>↩️ Restaurar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.permanentDeleteButton}
                    onPress={() => handlePermanentlyDelete(task.id)}
                  >
                    <Text style={styles.permanentDeleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clearAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskCard: {
    width: '48%',
    backgroundColor: '#FFE066',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
    flex: 1,
  },
  deletedDate: {
    fontSize: 10,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restoreButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permanentDeleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permanentDeleteButtonText: {
    fontSize: 12,
  },
});