// Componente de registro de usuarios
import { Pressable, Text, TextInput, View, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';

export default function Register({ navigation }) {
  // Estado para gestionar el formulario de registro
  const [formData, setFormData] = useState({
    // Campos del formulario con valores iniciales
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: '',
    role_name: 'volunteer',
    organization_description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para manejar cambios en los campos del formulario
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Función para procesar el registro de usuario
  const handleRegister = async () => {
    // Validación de campos requeridos
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || 
        !formData.full_name || !formData.phone_number) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.role_name === 'organization' && !formData.organization_description) {
      setError('Por favor, añade una descripción de tu organización');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://conectasolidariaapi.vercel.app/api/general/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organization_description: formData.organization_description || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }
      navigation.navigate('Iniciar Sesión');

    } catch (error) {
      setError(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Interfaz del formulario de registro
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre de usuario *</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          value={formData.username}
          onChangeText={(value) => handleChange('username', value)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo electrónico *</Text>
        <TextInput
          style={styles.input}
          placeholder="tucorreo@ejemplo.com"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre completo"
          value={formData.full_name}
          onChangeText={(value) => handleChange('full_name', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Teléfono *</Text>
        <TextInput
          style={styles.input}
          placeholder="123456789"
          value={formData.phone_number}
          onChangeText={(value) => handleChange('phone_number', value)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña *</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu contraseña"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar contraseña *</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirma tu contraseña"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tipo de cuenta *</Text>
        <View style={styles.roleContainer}>
          <Pressable 
            style={[
              styles.roleButton,
              formData.role_name === 'volunteer' && styles.roleButtonSelected
            ]}
            onPress={() => handleChange('role_name', 'volunteer')}
          >
            <Text style={[
              styles.roleButtonText,
              formData.role_name === 'volunteer' && styles.roleButtonTextSelected
            ]}>Voluntario</Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.roleButton,
              formData.role_name === 'organization' && styles.roleButtonSelected
            ]}
            onPress={() => handleChange('role_name', 'organization')}
          >
            <Text style={[
              styles.roleButtonText,
              formData.role_name === 'organization' && styles.roleButtonTextSelected
            ]}>Organización</Text>
          </Pressable>
        </View>
      </View>

      {formData.role_name === 'organization' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción de la organización *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe brevemente tu organización..."
            value={formData.organization_description}
            onChangeText={(value) => handleChange('organization_description', value)}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <Pressable 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </Text>
      </Pressable>

      <View style={styles.registerContainer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <Pressable onPress={() => navigation.navigate('Iniciar Sesión')}>
            <Text style={styles.linkText}>Iniciar Sesión</Text>
          </Pressable>
      </View>
        
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F4F6F7',
  },
  errorContainer: {
    backgroundColor: '#F4F6F7',
    padding: 10,
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1C2833',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1C2833',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A9CCE3',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A9CCE3',
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
  },
  roleButtonSelected: {
    backgroundColor: '#2E86AB',
    borderColor: '#2E86AB',
  },
  roleButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1C2833',
  },
  roleButtonTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#2E86AB',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A9CCE3',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
