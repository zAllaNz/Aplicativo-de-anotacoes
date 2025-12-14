import api from '@/services/api';

let mockToken: string | null = null;
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => mockToken),
}));

describe('Teste de Ramos: interceptor de autorização do api', () => {
  beforeAll(() => {
    api.defaults.adapter = (config: any) =>
      Promise.resolve({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
  });

  test('adiciona Authorization quando há token', async () => {
    mockToken = 't123';
    const res: any = await api.get('/any');
    expect(res.config.headers.Authorization).toBe('Bearer t123');
  });

  test('não adiciona Authorization quando não há token', async () => {
    mockToken = null;
    const res: any = await api.get('/any');
    expect(res.config.headers.Authorization).toBeUndefined();
  });
});
