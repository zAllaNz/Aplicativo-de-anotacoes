import { createNote, getNotes, updateNote, deleteNote, restoreNote, deletePermaNote } from '@/services/noteService';
import api from '@/services/api';

jest.mock('@/services/api', () => {
  return {
    __esModule: true,
    default: {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: { request: { use: jest.fn() } },
    },
  };
});

describe('Teste de Ramos: noteService', () => {
  const mockedApi: any = api as any;

  test('createNote sucesso', async () => {
    const note = { id: 'n1', title: 't', content: '', type: 'text', color: '#fff' };
    mockedApi.post.mockResolvedValueOnce({ data: { note } });
    const res = await createNote({ title: 't', content: '', type: 'text', color: '#fff' });
    expect(res).toEqual(note);
  });

  test('createNote erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Erro na requisição de criação de nota'), {
      isAxiosError: true,
      response: { data: { message: 'Erro na requisição de criação de nota' } },
    });
    mockedApi.post.mockRejectedValueOnce(err);
    await expect(createNote({ title: 't', content: '', type: 'text', color: '#fff' })).rejects.toThrow('Erro na requisição de criação de nota');
  });

  test('createNote erro não axios', async () => {
    mockedApi.post.mockRejectedValueOnce(new Error('Falha'));
    await expect(createNote({ title: 't', content: '', type: 'text', color: '#fff' })).rejects.toThrow('Erro inesperado ao tentar criar nota');
  });

  test('getNotes sucesso', async () => {
    const notes = [{ id: 'n1', title: 't', content: '', type: 'text', color: '#fff' }];
    mockedApi.get.mockResolvedValueOnce({ data: { notes } });
    const res = await getNotes();
    expect(res).toEqual(notes);
  });

  test('getNotes erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Erro na requisição de obtenção de notas'), {
      isAxiosError: true,
      response: { data: { message: 'Erro na requisição de obtenção de notas' } },
    });
    mockedApi.get.mockRejectedValueOnce(err);
    await expect(getNotes()).rejects.toThrow('Erro na requisição de obtenção de notas');
  });

  test('getNotes erro não axios', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Falha'));
    await expect(getNotes()).rejects.toThrow('Erro inesperado ao tentar obter notas');
  });

  test('updateNote sucesso', async () => {
    const updated = { id: 'n1', title: 't2', content: '', type: 'text' };
    mockedApi.put.mockResolvedValueOnce({ data: updated });
    const res = await updateNote('n1', { title: 't2', content: '', type: 'text', color: '#fff' });
    expect(res).toEqual(updated);
  });

  test('updateNote erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Erro na requisição de atualização de nota'), {
      isAxiosError: true,
      response: { data: { message: 'Erro na requisição de atualização de nota' } },
    });
    mockedApi.put.mockRejectedValueOnce(err);
    await expect(updateNote('n1', { title: 't2', content: '', type: 'text', color: '#fff' })).rejects.toThrow('Erro na requisição de atualização de nota');
  });

  test('updateNote erro não axios', async () => {
    mockedApi.put.mockRejectedValueOnce(new Error('Falha'));
    await expect(updateNote('n1', { title: 't2', content: '', type: 'text', color: '#fff' })).rejects.toThrow('Erro inesperado ao tentar atualizar nota');
  });

  test('deleteNote sucesso', async () => {
    mockedApi.put.mockResolvedValueOnce({ data: null });
    await expect(deleteNote('n1')).resolves.toBeUndefined();
  });

  test('deleteNote erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Erro na requisição de exclusão de nota'), {
      isAxiosError: true,
      response: { data: { message: 'Erro na requisição de exclusão de nota' } },
    });
    mockedApi.put.mockRejectedValueOnce(err);
    await expect(deleteNote('n1')).rejects.toThrow('Erro na requisição de exclusão de nota');
  });

  test('deleteNote erro não axios', async () => {
    mockedApi.put.mockRejectedValueOnce(new Error('Falha'));
    await expect(deleteNote('n1')).rejects.toThrow('Erro inesperado ao tentar excluir nota');
  });

  test('deletePermaNote sucesso', async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: null });
    await expect(deletePermaNote('n1')).resolves.toBeUndefined();
  });

  test('deletePermaNote erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Erro na requisição de exclusão permanente de nota'), {
      isAxiosError: true,
      response: { data: { message: 'Erro na requisição de exclusão permanente de nota' } },
    });
    mockedApi.delete.mockRejectedValueOnce(err);
    await expect(deletePermaNote('n1')).rejects.toThrow('Erro na requisição de exclusão permanente de nota');
  });

  test('deletePermaNote erro não axios', async () => {
    mockedApi.delete.mockRejectedValueOnce(new Error('Falha'));
    await expect(deletePermaNote('n1')).rejects.toThrow('Erro inesperado ao tentar excluir permanentemente nota');
  });

  test('restoreNote sucesso', async () => {
    mockedApi.put.mockResolvedValueOnce({ data: null });
    await expect(restoreNote('n1')).resolves.toBeUndefined();
  });

  test('restoreNote erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Erro na requisição de restauração de nota'), {
      isAxiosError: true,
      response: { data: { message: 'Erro na requisição de restauração de nota' } },
    });
    mockedApi.put.mockRejectedValueOnce(err);
    await expect(restoreNote('n1')).rejects.toThrow('Erro na requisição de restauração de nota');
  });

  test('restoreNote erro não axios', async () => {
    mockedApi.put.mockRejectedValueOnce(new Error('Falha'));
    await expect(restoreNote('n1')).rejects.toThrow('Erro inesperado ao tentar restaurar nota');
  });
});
