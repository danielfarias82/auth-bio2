import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text, Platform } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PropertiesScreen from './src/screens/PropertiesScreen';
import AddPropertyScreen from './src/screens/AddPropertyScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import ScheduleVisitScreen from './src/screens/ScheduleVisitScreen';
import VisitsScreen from './src/screens/VisitsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación de propiedades
const PropertiesNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="PropertiesList"
        component={PropertiesScreen}
        options={{ title: 'Mis Propiedades' }}
      />
      <Stack.Screen
        name="AddProperty"
        component={AddPropertyScreen}
        options={{ title: 'Agregar Propiedad' }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ title: 'Detalle de Propiedad' }}
      />
      <Stack.Screen
        name="ScheduleVisit"
        component={ScheduleVisitScreen}
        options={{ title: 'Registrar Visita' }}
      />
    </Stack.Navigator>
  );
};

// Navegación principal con tabs
const MainNavigator = () => {
  // Altura fija para Android que respeta los botones del sistema
  const tabBarHeight = Platform.OS === 'android' ? 85 : 70;
  const tabBarPaddingBottom = Platform.OS === 'android' ? 20 : 8;
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 10,
          height: tabBarHeight,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Properties"
        component={PropertiesNavigator}
        options={{
          title: 'Propiedades',
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 26 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Visits"
        component={VisitsScreen}
        options={{
          title: 'Visitas',
          tabBarIcon: () => <Text style={{ fontSize: 26 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 26 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Navegación de autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Router principal
const AppNavigator = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: AuthContext no disponible</Text>
      </View>
    );
  }

  const { isAuthenticated, loading } = authContext;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    padding: 20,
  },
});