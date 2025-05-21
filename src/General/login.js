// Componente de inicio de sesión
import { Image, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const navigation = useNavigation();
  // Estados para gestionar el formulario y proceso de inicio de sesión
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para manejar el proceso de inicio de sesión
  const handleLogin = async () => {
    // Validación de campos requeridos
    if (!email || !password) {
      setError('Por favor ingresa correo y contraseña');
      return;
    }

    // Proceso de autenticación con el servidor
    setLoading(true);
    try {
      const response = await fetch('https://conectasolidariaapi.vercel.app/api/general/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.token);
      
      navigation.navigate(data.user.role_id === 2 ? 'Crear Evento' : 'Eventos Disponibles');
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  // Interfaz del formulario de inicio de sesión
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
        />
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Pressable 
        onPress={handleLogin} 
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Text>
      </Pressable>
      
      <View style={styles.footer}>
        <View style={styles.registerContainer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <Pressable onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.linkText}>Regístrate</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#F4F6F7',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E86AB',
    width: '100%',
  },
  errorText: {
    color: '#1C2833',
    textAlign: 'center',
    fontSize: 14,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F4F6F7',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C2833',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C2833',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A9CCE3',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E86AB',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A9CCE3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerContainer: {
    flexDirection: 'row'
  },
  footerText: {
    color: '#1C2833',
    fontSize: 14,
  },
  linkText: {
    color: '#2E86AB',
    fontSize: 14,
    fontWeight: '500',
  },
});