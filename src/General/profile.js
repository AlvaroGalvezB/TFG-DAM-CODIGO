// Componente para gestionar el perfil del usuario
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();
  // Estados para gestionar los datos del perfil
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone_number: '',
    organization_description: null,
    role_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (name, value) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  // Función para obtener los datos del usuario
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigation.navigate('Iniciar Sesión');
        return;
      }

      const response = await fetch('https://conectasolidariaapi.vercel.app/api/general/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener datos del usuario');
      }
      setUserData(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Función para actualizar el perfil
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigation.navigate('Iniciar Sesión');
        return;
      }

      const response = await fetch('https://conectasolidariaapi.vercel.app/api/general/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }

      setSuccessMessage('Perfil actualizado correctamente');
      setShowSuccessModal(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Interfaz del perfil de usuario
  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre de usuario:</Text>
          <TextInput
            style={styles.input}
            value={userData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            placeholder="Tu nombre de usuario"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Tu email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono:</Text>
          <TextInput
            style={styles.input}
            value={userData.phone_number}
            onChangeText={(value) => handleInputChange('phone_number', value)}
            placeholder="Tu número de teléfono"
            keyboardType="phone-pad"
          />
        </View>

        {userData.role_name === 'organization' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción de la organización:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={userData.organization_description}
              onChangeText={(value) => handleInputChange('organization_description', value)}
              placeholder="Describe tu organización..."
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
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomMenu}>
        {userData.role_name === 'organization' ? (
          <>
            <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Crear Evento')}>
              <Text style={styles.menuText}>Crear Evento</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Eventos Creados')}>
              <Text style={styles.menuText}>Mis Eventos</Text>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <Text style={[styles.menuText, styles.activeMenuItem]}>Perfil</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Eventos Disponibles')}>
              <Text style={styles.menuText}>Ver Eventos</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Eventos Pasados')}>
              <Text style={styles.menuText}>Eventos pasados</Text>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <Text style={[styles.menuText, styles.activeMenuItem]}>Perfil</Text>
            </Pressable>
          </>
        )}
      </View>
      {/* Modal de éxito */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalText}>{successMessage}</Text>
            <View style={styles.deleteModalButtons}>
              <Pressable
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.actionButtonText}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F6F7',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C2833',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteModalContent: {
    backgroundColor: '#F4F6F7',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1C2833',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2E86AB',
  },
  actionButtonText: {
    color: '#F4F6F7',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#1C2833',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#A9CCE3',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#F4F6F7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2E86AB',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#A9CCE3',
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 14,
    color: '#F4F6F7',
  },
  activeMenuItem: {
    color: '#F4F6F7',
    fontWeight: 'bold',
  },
  staticText: {
    fontSize: 16,
    color: '#1C2833',
    padding: 12,
    backgroundColor: '#F4F6F7',
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: '#F4F6F7',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E86AB',
  },
  errorText: {
    color: '#1C2833',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#A9CCE3',
  }
});

export default Profile;
