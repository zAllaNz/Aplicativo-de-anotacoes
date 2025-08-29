import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { validateEmail, validatePassword, validateName, validatePasswordMatch, getPasswordStrength } from '../utils/validation';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{ strength: 'weak' | 'medium' | 'strong'; message: string } | null>(null);

  const handleRegister = () => {
    // Limpar erros anteriores
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setMessage('');
    
    let hasError = false;
    
    // Validar nome
    if (!validateName(name)) {
      setNameError('Nome deve ter entre 2 e 50 caracteres');
      hasError = true;
    }
    
    // Validar email
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Formato de email inválido');
      hasError = true;
    }
    
    // Validar senha
    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Senha deve ter pelo menos 8 caracteres, incluindo letras e números');
      hasError = true;
    }
    
    // Validar confirmação de senha
    if (!validatePasswordMatch(password, confirmPassword)) {
      setConfirmPasswordError('Senhas não coincidem');
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    setMessage('Cadastro realizado com sucesso!');
  };

  const navigateToLogin = () => {
    router.push('/');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>📝 Anotações App</Text>
          <Text style={styles.subtitle}>Crie sua conta e comece a organizar</Text>
        </View>

        {/* Formulário de registro */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Criar nova conta</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput 
              style={[styles.input, nameError ? styles.inputError : null]} 
              placeholder="Digite seu nome" 
              placeholderTextColor="#a0a0a0"
              value={name} 
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput 
              style={[styles.input, emailError ? styles.inputError : null]} 
              placeholder="Digite seu email" 
              placeholderTextColor="#a0a0a0"
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput 
              style={[styles.input, passwordError ? styles.inputError : null]} 
              placeholder="Digite sua senha" 
              placeholderTextColor="#a0a0a0"
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
                if (text.length > 0) {
                  setPasswordStrength(getPasswordStrength(text));
                } else {
                  setPasswordStrength(null);
                }
              }} 
              secureTextEntry 
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            {passwordStrength && (
              <Text style={[
                styles.strengthText,
                passwordStrength.strength === 'weak' ? styles.weakStrength :
                passwordStrength.strength === 'medium' ? styles.mediumStrength : styles.strongStrength
              ]}>
                Força da senha: {passwordStrength.message}
              </Text>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar senha</Text>
            <TextInput 
              style={[styles.input, confirmPasswordError ? styles.inputError : null]} 
              placeholder="Confirme sua senha" 
              placeholderTextColor="#a0a0a0"
              value={confirmPassword} 
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }} 
              secureTextEntry 
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>

          {message ? (
            <Text style={[styles.message, message.includes('sucesso') ? styles.successMessage : styles.errorMessage]}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Criar conta</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Faça login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8e8e8',
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: '500',
  },
  weakStrength: {
    color: '#e74c3c',
  },
  mediumStrength: {
    color: '#f39c12',
  },
  strongStrength: {
    color: '#27ae60',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  registerButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  errorMessage: {
    color: '#e74c3c',
  },
  successMessage: {
    color: '#27ae60',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
