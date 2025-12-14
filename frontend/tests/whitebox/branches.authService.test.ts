import { login, createAccount } from '@/services/authService';
import api from '@/services/api';

jest.mock('@/services/api', () => {
  return {
    __esModule: true,
    default: {
      post: jest.fn(),
      interceptors: { request: { use: jest.fn() } },
    },
  };
});

describe('Teste de Ramos: authService', () => {
  const mockedApi: any = api as any;

  test('createAccount sucesso', async () => {
    const response = { id: '2', name: 'User', email: 'new@example.com', created_at: '2025-01-02' };
    mockedApi.post.mockResolvedValueOnce({ data: response });
    const res = await createAccount({ name: 'User', email: 'new@example.com', password: 'Password123' });
    expect(res).toEqual(response);
  });

  test('createAccount erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Email já cadastrado'), {
      isAxiosError: true,
      response: { data: { message: 'Email já cadastrado' } },
    });
    mockedApi.post.mockRejectedValueOnce(err);
    await expect(createAccount({ name: 'User', email: 'existing@example.com', password: 'Password123' })).rejects.toThrow('Email já cadastrado');
  });

  test('createAccount erro não axios', async () => {
    mockedApi.post.mockRejectedValueOnce(new Error('Falha'));
    await expect(createAccount({ name: 'User', email: 'x@example.com', password: 'Password123' })).rejects.toThrow('Erro inesperado ao tentar criar conta');
  });

  test('login sucesso', async () => {
    const response = { id: '1', name: 'User', email: 'user@example.com', accessToken: 'token123', created_at: '2025-01-01' };
    mockedApi.post.mockResolvedValueOnce({ data: response });
    const res = await login({ email: 'user@example.com', password: 'Password123' });
    expect(res).toEqual(response);
  });

  test('login erro axios com mensagem', async () => {
    const err = Object.assign(new Error('Credenciais inválidas'), {
      isAxiosError: true,
      response: { data: { message: 'Credenciais inválidas' } },
    });
    mockedApi.post.mockRejectedValueOnce(err);
    await expect(login({ email: 'user@example.com', password: 'wrong' })).rejects.toThrow('Credenciais inválidas');
  });

  test('login erro não axios', async () => {
    mockedApi.post.mockRejectedValueOnce(new Error('Falha'));
    await expect(login({ email: 'user@example.com', password: 'Password123' })).rejects.toThrow('Erro inesperado ao tentar fazer login');
  });
});
