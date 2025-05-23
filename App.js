// Importación de componentes y librerías necesarias
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Image, TouchableOpacity } from 'react-native';
import { Analytics } from '@vercel/analytics/react';
import Login from './src/General/login';
import Register from './src/General/register';
import CreateEvent from './src/ONG/createEvent';
import Events from './src/Volunteer/events';
import InEvent from './src/Volunteer/inEvent';
import Profile from './src/General/profile';
import CreatedEvents from './src/ONG/createdEvents';
import EditEvent from './src/ONG/editEvent';
import { Provider } from './Context';

const Stack = createNativeStackNavigator();

const App = () => (
  <Provider>
    <NavigationContainer>
      <Analytics />
      <Stack.Navigator initialRouteName="Iniciar Sesión">
        <Stack.Screen 
          name="Iniciar Sesión" 
          component={Login}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
        <Stack.Screen 
          name="Registro" 
          component={Register}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
        <Stack.Screen 
          name="Eventos Disponibles" 
          component={Events}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
        <Stack.Screen 
          name="Crear Evento" 
          component={CreateEvent}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
        <Stack.Screen 
          name="Eventos Creados" 
          component={CreatedEvents}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
        <Stack.Screen 
          name="Editar Evento" 
          component={EditEvent}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
        <Stack.Screen 
          name="Eventos Pasados" 
          component={InEvent}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
        <Stack.Screen 
          name="Perfil" 
          component={Profile}
          options={({ navigation }) => getCommonHeaderOptions(navigation)}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

export default App;

const getCommonHeaderOptions = (navigation) => ({
  headerTitle: () => (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: '100%',
      position: 'relative'
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
      }}>
        <Image
          source={require('./assets/logo.png')}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
        <Image
          source={require('./assets/texto.png')}
          style={{ width: 80, height: 40, marginLeft: 10 }}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Iniciar Sesión')}
        style={{ position: 'absolute', right: 0 }}
      >
        <Image
          source={require('./assets/login-icon.jpg')}
          style={{ width: 60, height: 60 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  ),
  headerTitleContainerStyle: {
    width: '100%',
    left: 0
  }
});
