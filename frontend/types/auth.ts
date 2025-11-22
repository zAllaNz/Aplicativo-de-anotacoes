export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  name: string;
  email: string;
  token: string;
};

export type CreateAccountRequest = {
  name: string;
  email: string;
  password: string;
};

export type CreateAccountResponse = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};