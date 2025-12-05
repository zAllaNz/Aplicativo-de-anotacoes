import { isAxiosError } from 'axios';
import api from './api';
import { NoteRequest, NoteResponse } from '@/types/note';

// Criação de nota
export const createNote = async(data: NoteRequest): Promise<NoteResponse> => {
    try {
        const response = await api.post('/notes', {
            title: data.title,
            content: data.content,
            type: data.type,
            color: data.color
        });
        return response.data?.note;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || 'Erro na requisição de criação de nota');
        } else {
            throw new Error('Erro inesperado ao tentar criar nota');
        }
    }
}

// Obtenção de notas
export const getNotes = async(): Promise<NoteResponse[]> => {
    try {
        const response = await api.get(`/notes`);
        return response.data?.notes;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || 'Erro na requisição de obtenção de notas');
        } else {
            throw new Error('Erro inesperado ao tentar obter notas');
        }
    }   
}

// Atualização de nota
export const updateNote = async(id: string, data: NoteRequest): Promise<NoteResponse> => {  
    try {
        const response = await api.put(`/notes/${id}`, {
            title: data.title,
            content: data.content,
            type: data.type,
        });
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || 'Erro na requisição de atualização de nota');
        } else {
            throw new Error('Erro inesperado ao tentar atualizar nota');
        }
    }
}

// Exclusão lógica
export const deleteNote = async(id: string): Promise<void> => {  
    try {
        await api.put(`/notes/${id}/delete`);
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || 'Erro na requisição de exclusão de nota');
        } else {
            throw new Error('Erro inesperado ao tentar excluir nota');
        }
    }
}

// Exclusão permanente
export const deletePermaNote = async(id: string): Promise<void> => {  
    try {
        await api.delete(`/notes/${id}/permanent`);
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || 'Erro na requisição de exclusão permanente de nota');
        } else {
            throw new Error('Erro inesperado ao tentar excluir permanentemente nota');
        }
    }
}

export const restoreNote = async(id: string): Promise<void> => {
    try {
        await api.put(`/notes/${id}/restore`)
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || 'Erro na requisição de restauração de nota');
        } else {
            throw new Error('Erro inesperado ao tentar restaurar nota');
        }
    }
}