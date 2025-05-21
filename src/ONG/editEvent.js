// Componente para editar eventos existentes
import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Image, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function EditEvent() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;

  // Estados para gestionar el formulario de edición
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [volunteerLimit, setVolunteerLimit] = useState('');
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Efecto para cargar los detalles del evento
  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Función para obtener los detalles del evento
  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://conectasolidariaapi.vercel.app/api/ong/event/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setTitle(data.title);
        setDescription(data.description);
        setLocation(data.location);
        setEventDate(new Date(data.event_date));
        setVolunteerLimit(data.volunteer_limit?.toString() || '');
        setImage(data.image_url);
      } else {
        setError('Error al cargar los datos del evento');
      }
    } catch (error) {
      setError('Error al cargar los datos del evento');
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar la actualización del evento
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('event_date', eventDate.toISOString().slice(0, 19).replace('T', ' '));
      if (volunteerLimit) formData.append('volunteer_limit', volunteerLimit);

      if (image && !image.startsWith('http')) {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('image_file', blob, 'image.jpg');
      }

      const response = await fetch(`https://conectasolidariaapi.vercel.app/api/ong/edit/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigation.navigate('Eventos Creados');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al actualizar el evento');
      }
    } catch (error) {
      setError('Error al actualizar el evento');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // Interfaz del formulario de edición
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Evento</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Título del evento"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción del evento"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Ubicación del evento"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha y Hora</Text>
        {Platform.OS === 'web' ? (
          <input
            type="datetime-local"
            value={eventDate.toISOString().slice(0, 16)}
            onChange={(e) => setEventDate(new Date(e.target.value))}
            style={{
              backgroundColor: 'white',
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#90CDF4',
              width: '100%',
              fontSize: 16,
              border: '1px solid #90CDF4',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        ) : (
          <>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{eventDate.toLocaleString()}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="datetime"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setEventDate(selectedDate);
                }}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Límite de Voluntarios</Text>
        <TextInput
          style={[styles.input, { opacity: 0.5 }]}
          value={volunteerLimit}
          onChangeText={setVolunteerLimit}
          placeholder="Límite de voluntarios"
          keyboardType="numeric"
          readOnly={true}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Imagen</Text>
        <Pressable style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Seleccionar Imagen</Text>
        </Pressable>
        {image && (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        )}
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Actualizar Evento</Text>
      </Pressable>
      {/* Añadir el Modal al final del componente, justo antes del cierre del ScrollView */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Evento actualizado exitosamente</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F7',
    padding: 16,
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C2833',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2833',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A9CCE3',
    fontSize: 16,
    color: '#1C2833',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A9CCE3',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2E86AB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#F4F6F7',
    fontSize: 16,
    fontWeight: '600',
  },
  imageButton: {
    backgroundColor: '#2E86AB',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#2E86AB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#F4F6F7',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalText: {
    fontSize: 16,
    color: '#1C2833',
    textAlign: 'center'
  }
});