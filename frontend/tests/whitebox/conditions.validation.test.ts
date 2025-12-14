import { validateEmail, validatePassword, validateName, validatePasswordMatch } from '../../utils/validation';

describe('Teste de Condições: funções de validação', () => {
  test('validateEmail cobre trim e formatos válidos/inválidos', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail(' invalid')).toBe(false);
    expect(validateEmail(' user@space.com ')).toBe(true);
    expect(validateEmail('user@domain.')).toBe(false);
    expect(validateEmail('user@.domain.com')).toBe(true);
  });

  test('validatePassword cobre todas conjugações de minLength/hasLetter/hasNumber', () => {
    expect(validatePassword('Abc12345')).toBe(true);
    expect(validatePassword('Abcdefgh')).toBe(false);
    expect(validatePassword('12345678')).toBe(false);
    expect(validatePassword('Abc123')).toBe(false);
  });

  test('validateName cobre limites de tamanho após trim', () => {
    expect(validateName('A')).toBe(false);
    expect(validateName('AB')).toBe(true);
    expect(validateName('A'.repeat(50))).toBe(true);
    expect(validateName('A'.repeat(51))).toBe(false);
  });

  test('validatePasswordMatch cobre igualdade e não vazio', () => {
    expect(validatePasswordMatch('', '')).toBe(false);
    expect(validatePasswordMatch('a', 'a')).toBe(true);
    expect(validatePasswordMatch('a', 'b')).toBe(false);
  });
});
