// Componente para mostrar eventos pasados del voluntario
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function InEvent() {
  const navigation = useNavigation();
  // Estados para gestionar la lista de eventos pasados
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Función para obtener los eventos pasados del usuario
  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Por favor, inicia sesión nuevamente');
        return;
      }

      const response = await fetch('https://conectasolidariaapi.vercel.app/api/volunteer/user-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data);
      } else {
        setError(data.message || 'Error al cargar los eventos');
      }
    } catch (error) {
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserEvents();
  };

  useEffect(() => {
    fetchUserEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando eventos...</Text>
      </View>
    );
  }

  // Interfaz de lista de eventos pasados
  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          />
        }
      >
      <Text style={styles.title}>Eventos Pasados</Text>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {events.length === 0 ? (
        <Text style={styles.noEvents}>No estás inscrito en ningún evento</Text>
      ) : (
        events.map((event) => (
          <View key={event.event_id} style={styles.eventCard}>
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
        ))
      )}
      </ScrollView>
      <View style={styles.bottomMenu}>
        <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Eventos Disponibles')}>
          <Text style={styles.menuText}>Ver Eventos</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={[styles.menuText, styles.activeMenuItem]}>Eventos pasados</Text>
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
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10
  },
});