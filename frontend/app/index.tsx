import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { validateEmail } from '../utils/validation';
import { login } from '@/services/authService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = () => {
    // Limpar erros anteriores
    setEmailError('');
    setPasswordError('');
    setMessage('');
    
    let hasError = false;
    
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
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      hasError = true;
    }
    
    if (hasError) {
      return;
    }

    login({ email, password })
    .then(() => {
      setMessage('Login realizado com sucesso!');

      setTimeout(() => {
        router.replace('/tasks');
      }, 1000);
    })
    .catch((error) => {
      setMessage(error?.message || 'Email ou senha incorretos');
    });
    
    // Simulação de login
    // if (email === 'teste@email.com' && password === '123456') {
      

    //   setMessage('Login realizado com sucesso!');
    //   // Redirecionar para a tela de tarefas após 1 segundo
    //   setTimeout(() => {
    //     router.replace('/tasks');
    //   }, 1000);
    // } else {
    //   setMessage('Email ou senha incorretos');
    // }
  };

  const navigateToRegister = () => {
    router.push('/register');
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
          <Text style={styles.subtitle}>Organize suas ideias</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          
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
              }} 
              secureTextEntry 
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {message ? (
            <Text style={[styles.message, message.includes('sucesso') ? styles.successMessage : styles.errorMessage]}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
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
    marginBottom: 50,
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
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
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
  loginButtonText: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
