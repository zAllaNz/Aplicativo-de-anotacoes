import { getPasswordStrength } from '../../utils/validation';

describe('Teste de Condições: getPasswordStrength', () => {
  test('retorna weak quando tamanho < 6 (condição inicial)', () => {
    expect(getPasswordStrength('Ab1!').strength).toBe('weak');
    expect(getPasswordStrength('12345').strength).toBe('weak');
  });

  test('cobre combinações onde cada critério é isoladamente verdadeiro/falso', () => {
    expect(getPasswordStrength('abcdef').strength).toBe('weak'); // hasLower=true; outros falsos; isLongEnough=false
    expect(getPasswordStrength('ABCDEF').strength).toBe('weak'); // hasUpper=true
    expect(getPasswordStrength('123456').strength).toBe('weak'); // hasNumber=true
    expect(getPasswordStrength('!@#$%^').strength).toBe('weak'); // hasSpecial=true
    expect(getPasswordStrength('Abcdefg').strength).toBe('weak'); // isLongEnough=false (len 7), hasLower/hasUpper true
  });

  test('medium quando critérios verdadeiros somam 3 ou 4', () => {
    expect(getPasswordStrength('Abc1234').strength).toBe('medium'); // lower+upper+number (3), len 7
    expect(getPasswordStrength('Abc12345').strength).toBe('medium'); // lower+upper+number+len>=8 (4)
    expect(getPasswordStrength('abc12345').strength).toBe('medium'); // lower+number+len>=8 (3 efetivos, sem upper/special)
  });

  test('strong quando todos 5 critérios são verdadeiros', () => {
    expect(getPasswordStrength('Abc12345!').strength).toBe('strong'); // lower+upper+number+special+len>=8
    expect(getPasswordStrength('A1!bcdefg').strength).toBe('strong');
  });
});
