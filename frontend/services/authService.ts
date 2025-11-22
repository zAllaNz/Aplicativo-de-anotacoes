import { isAxiosError } from 'axios'
import api from './api';
import { CreateAccountRequest, CreateAccountResponse, LoginRequest, LoginResponse } from '@/types/auth';

export const createAccount = async(data: CreateAccountRequest): Promise<CreateAccountResponse> => {
  try {
    const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
    });
    return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || 'Erro na requisição de criação de conta');
        } else {
            throw new Error('Erro inesperado ao tentar criar conta');
        }
    }
}

export const login = async(data: LoginRequest): Promise<LoginResponse> => {
  console.log("URL chamada:", api.defaults.baseURL + "/auth/login");
  try {
    const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
        // console.log('Axios error response:', error);
        throw new Error(error.response?.data.message || 'Erro na requisição de login');
    } else {
        throw new Error('Erro inesperado ao tentar fazer login');
    }
    
  }
}