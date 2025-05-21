// Componente para crear nuevos eventos
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Función auxiliar para formatear fechas
const formatDateForInput = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Componente para selección de fecha y hora
const DateTimeInput = ({ value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <input
        style={{
          ...styles.input,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ddd',
          fontSize: 16,
        }}
        type="datetime-local"
        value={formatDateForInput(value)}
        onChange={(e) => {
          if (e.target.value) {
            const date = new Date(e.target.value);
            onChange(date);
          }
        }}
      />
    );
  }

  return (
    <>
      <Pressable 
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateButtonText}>
          {value 
            ? value.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Seleccionar fecha y hora'}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value || new Date()}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (event.type !== 'dismissed' && selectedDate) {
              onChange(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </>
  );
};

export default function CreateEvent() {
  const navigation = useNavigation();
  
  // Añadir este useEffect al inicio del componente
  React.useEffect(() => {
    navigation.setOptions({
      title: 'Crear Evento'
    });
  }, [navigation]);

  // Estados para gestionar el formulario de creación de eventos
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: null,
    volunteer_limit: 0,
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    if (name === 'volunteer_limit') {
      // Validar que solo sean números
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para seleccionar imagen del evento
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5, // Reducir la calidad para disminuir el tamaño
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        image: result.assets[0].uri
      }));
    }
  };

  // Función para enviar el formulario y crear el evento
  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.location || !formData.event_date) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const eventDate = new Date(formData.event_date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Fecha inválida');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      const pad = n => n < 10 ? '0' + n : n;
      const formattedDate = `${eventDate.getFullYear()}-${pad(eventDate.getMonth()+1)}-${pad(eventDate.getDate())} ${pad(eventDate.getHours())}:${pad(eventDate.getMinutes())}:${pad(eventDate.getSeconds())}`;
      formDataToSend.append('event_date', formattedDate);
      formDataToSend.append('volunteer_limit', formData.volunteer_limit || '0');

      if (formData.image) {
        const imageUri = formData.image;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            formDataToSend.append('image_file', blob, filename);
          } catch (error) {
            Alert.alert('Advertencia', 'No se pudo procesar la imagen. El evento se creará sin imagen.');
          }
        } else {
          formDataToSend.append('image_file', {
            uri: imageUri,
            name: filename,
            type
          });
        }
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch('https://conectasolidariaapi.vercel.app/api/ong/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status}). Por favor, inténtalo más tarde o contacta al administrador.`);
      }

      const responseData = await response.json();
      Alert.alert('Éxito', 'Evento creado correctamente');
      navigation.navigate('Eventos Creados');
      
    } catch (error) {
      setError(error.message || 'Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Crear Nuevo Evento</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Imagen del evento</Text>
          <Pressable style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>
              {formData.image ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Text>
          </Pressable>
          
          {formData.image && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: formData.image }} 
                style={styles.previewImage} 
              />
              <Pressable 
                style={styles.removeImageButton}
                onPress={() => setFormData(prev => ({ ...prev, image: null }))}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título del evento *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Limpieza de playa"
          value={formData.title}
          onChangeText={(value) => handleChange('title', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el evento..."
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ubicación *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Playa San Juan, Alicante"
          value={formData.location}
          onChangeText={(value) => handleChange('location', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Maximo voluntarios * <Text style={[{ color: '#FF0000', fontSize: 14}]}>(Después no se puede modificar)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          value={formData.volunteer_limit}
          onChangeText={(value) => handleChange('volunteer_limit', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha y hora *</Text>
        <DateTimeInput
          value={formData.event_date}
          onChange={(date) => {
            setFormData(prev => ({
              ...prev,
              event_date: date
            }));
          }}
        />
      </View>
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
          {loading ? 'Creando...' : 'Crear Evento'}
        </Text>
      </Pressable>
      </ScrollView>
      <View style={styles.bottomMenu}>
        <Pressable style={styles.menuItem}>
          <Text style={[styles.menuText, styles.activeMenuItem]}>Crear Evento</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Eventos Creados')}>
          <Text style={styles.menuText}>Mis Eventos</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Perfil')}>
          <Text style={styles.menuText}>Perfil</Text>
        </Pressable>
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
  },
  errorText: {
    color: '#1C2833',
    textAlign: 'center',
    fontSize: 14,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  container: {
    flex: 1,
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1C2833',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1C2833',
  },
  input: {
    backgroundColor: '#F4F6F7',
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
  dateButton: {
    backgroundColor: '#F4F6F7',
    padding: 15,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#A9CCE3',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1C2833',
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
    color: '#F4F6F7',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#2E86AB',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#F4F6F7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(28, 40, 51, 0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#F4F6F7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  }
});
