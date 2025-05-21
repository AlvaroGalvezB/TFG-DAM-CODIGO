// Componente para mostrar eventos creados por la ONG
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CreatedEvents() {
  const navigation = useNavigation();
  // Estados para gestionar la lista de eventos
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Función para obtener los eventos creados
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigation.navigate('Iniciar Sesión');
        return;
      }

      const response = await fetch('https://conectasolidariaapi.vercel.app/api/ong/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data);
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

  // Función para eliminar un evento
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://conectasolidariaapi.vercel.app/api/ong/delete/${eventToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setEvents(events.filter(e => e.event_id !== eventToDelete));
      } else {
        alert('Error eliminando el evento');
      }
    } catch (error) {
      alert('Error eliminando el evento');
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  // Interfaz de lista de eventos creados
  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Mis Eventos Creados</Text>
        {events.length === 0 ? (
          <Text style={styles.noEvents}>No has creado ningún evento</Text>
        ) : (
          events.map((event) => {
            const eventDate = new Date(event.event_date);
            const hasEventPassed = eventDate < new Date();

            return (
              <View key={event.event_id} style={[styles.eventCard, hasEventPassed && styles.pastEventCard]}>
                <View style={styles.cardContent}>
                  <View style={styles.textContent}>
                  {hasEventPassed && (
                      <Text style={styles.pastEventLabel}>Evento finalizado</Text>
                    )}
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
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={[
                        styles.actionButton, 
                        styles.editButton,
                        hasEventPassed && styles.disabledButton
                      ]}
                      onPress={() => navigation.navigate('Editar Evento', { eventId: event.event_id })}
                      disabled={hasEventPassed}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        hasEventPassed && styles.disabledButtonText
                      ]}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.actionButton, 
                        styles.deleteButton,
                        hasEventPassed && styles.disabledButton
                      ]}
                      onPress={() => {
                        setEventToDelete(event.event_id);
                        setShowDeleteModal(true);
                      }}
                      disabled={hasEventPassed}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        hasEventPassed && styles.disabledButtonText
                      ]}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal para imagen */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
        </View>
      </Modal>

      {/* Modal de confirmación de borrado */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalText}>¿Seguro que quieres eliminar este evento?</Text>
            <View style={styles.deleteModalButtons}>
              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteEvent}
              >
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.bottomMenu}>
        <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Crear Evento')}>
          <Text style={styles.menuText}>Crear Evento</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={[styles.menuText, styles.activeMenuItem]}>Mis Eventos</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Perfil')}>
          <Text style={styles.menuText}>Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
  pastEventCard: {
    backgroundColor: '#F4F6F7',
    opacity: 0.6,
  },
  pastEventLabel: {
    color: '#2E86AB',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  textContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  eventImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'flex-start',
  },
  disabledButton: {
    backgroundColor: '#A9CCE3',
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#1C2833',
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    marginLeft: 8,
    minWidth: 80,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2E86AB',
  },
  deleteButton: {
    backgroundColor: '#1C2833',  // Color oscuro azulado para eliminar
  },
  actionButtonText: {
    color: '#F4F6F7',
    fontWeight: 'bold',
    fontSize: 14,
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
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1C2833',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  modalContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
  },
  modalImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    backgroundColor: '#F4F6F7',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#1C2833',
    fontWeight: 'bold',
  }
});
