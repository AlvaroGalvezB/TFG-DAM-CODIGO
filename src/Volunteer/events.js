// Componente para mostrar eventos disponibles para voluntarios
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Events() {
  const navigation = useNavigation();
  // Estados para gestionar la lista de eventos y registros
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [clickedButtons, setClickedButtons] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');

  // Función para registrarse/cancelar registro en un evento
  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Por favor, inicia sesión nuevamente');
        return;
      }

      const isRegistered = clickedButtons[eventId];
      setRegistering(true);
      
      const url = isRegistered 
        ? `https://conectasolidariaapi.vercel.app/api/volunteer/unregister/${eventId}`
        : 'https://conectasolidariaapi.vercel.app/api/volunteer/register';

      const response = await fetch(url, {
        method: isRegistered ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: !isRegistered ? JSON.stringify({
          event_id: eventId,
          registration_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }) : undefined
      });

      if (response.ok) {
        if (isRegistered) {
          setClickedButtons(prev => {
            const newState = { ...prev };
            delete newState[eventId];
            return newState;
          });
        } else {
          setClickedButtons(prev => ({
            ...prev,
            [eventId]: true
          }));
        }
        await fetchEvents();
        await fetchUserRegistrations();
      } else {
        const data = await response.json();
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      setError('Error al procesar la solicitud');
    } finally {
      setRegistering(false);
    }
  };

  // Función para obtener los registros del usuario
  const fetchUserRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://conectasolidariaapi.vercel.app/api/volunteer/user-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const registrationMap = {};
        data.forEach(eventId => {
          registrationMap[eventId] = true;
        });
        setClickedButtons(registrationMap);
      }
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  // Función para obtener la lista de eventos
  const fetchEvents = async () => {
    try {
      const response = await fetch('https://conectasolidariaapi.vercel.app/api/volunteer/list');
      const data = await response.json();

      if (response.ok) {
        setEvents(data);
        // Llamar a fetchUserRegistrations después de obtener los eventos
        await fetchUserRegistrations();
      } else {
        console.error('Error fetching events:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando eventos...</Text>
      </View>
    );
  }

  // Interfaz de lista de eventos disponibles
  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
      <Text style={[styles.title, { cursor: 'pointer' }]} onClick={onRefresh}>Eventos Disponibles</Text>
      {events.length === 0 ? (
        <Text style={styles.noEvents}>No hay eventos disponibles</Text>
      ) : (
        events.map((event) => (
          <View key={event.event_id} style={styles.eventCard}>
            <View style={styles.eventContent}>
              <View style={styles.textContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {event.event_date ? new Date(event.event_date).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Fecha no disponible'}
                </Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
                <Text style={styles.volunteerLimit}>👥 Plazas máximas: {event.volunteer_limit || 'Sin límite'}</Text>
              </View>
              {event.image_url && (
                <Pressable onPress={() => setSelectedImage(event.image_url)}>
                  <Image 
                    source={{ uri: event.image_url }} 
                    style={styles.eventImage}
                  />
                </Pressable>
              )}
            </View>
            <Pressable
              style={[
                styles.registerButton,
                clickedButtons[event.event_id] && styles.registeredButton
              ]}
              onPress={() => handleRegister(event.event_id)}
              disabled={registering}
            >
              <Text style={styles.registerButtonText}>
                {clickedButtons[event.event_id] ? 'Cancelar inscripción' : 'Inscribirse'}
              </Text>
            </Pressable>
          </View>
        ))
      )}
      </ScrollView>
      <View style={styles.bottomMenu}>
      <Pressable style={styles.menuItem}>
          <Text style={[styles.menuText, styles.activeMenuItem]}>Ver Eventos</Text>
        </Pressable>
        <Pressable style={styles.menuItem}  onPress={() => navigation.navigate('Eventos Pasados')}>
          <Text style={styles.menuText}>Eventos pasados</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Perfil')}>
          <Text style={styles.menuText}>Perfil</Text>
        </Pressable>
      </View>

      {/* Modal para mostrar la imagen */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <Image 
            source={{ uri: selectedImage }} 
            style={styles.modalImage}
          />
          <Pressable 
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  registeredButton: {
    backgroundColor: '#f7020f',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F6F7',
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
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#A9CCE3',
  },
  eventContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  textContent: {
    flex: 1,
    marginRight: 10,
  },
  eventImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignSelf: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C2833',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#1C2833',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    color: '#1C2833',
    marginBottom: 8,
    lineHeight: 22,
  },
  eventLocation: {
    fontSize: 14,
    color: '#1C2833',
  },
  volunteerLimit: {
    fontSize: 14,
    color: '#1C2833',
    marginTop: 8,
    fontWeight: '500'
  },
  noEvents: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1C2833',
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: '#2E86AB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#A9CCE3',
  },
  registerButtonText: {
    color: '#F4F6F7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F4F6F7',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1C2833',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
