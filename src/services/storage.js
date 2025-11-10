import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERS: '@property_app:users',
  CURRENT_USER: '@property_app:current_user',
  PROPERTIES: '@property_app:properties',
  VISITS: '@property_app:visits',
};

// Función auxiliar para generar IDs únicos
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Hash simple para contraseñas (solo para desarrollo)
const hashPassword = (password) => {
  return btoa(password); // Base64 simple - NO USAR EN PRODUCCIÓN
};

// ==================== USUARIOS ====================

export const storageAPI = {
  // Registrar usuario
  register: async (userData) => {
    try {
      // Obtener usuarios existentes
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : {};

      // Verificar si el email ya existe
      const emailExists = Object.values(users).some(
        (user) => user.email === userData.email
      );

      if (emailExists) {
        throw new Error('Email already registered');
      }

      // Crear nuevo usuario
      const userId = generateId();
      const hashedPassword = hashPassword(userData.password);

      const newUser = {
        id: userId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || null,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      users[userId] = newUser;

      // Guardar usuarios
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Guardar usuario actual
      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(userResponse)
      );

      return {
        success: true,
        user: userResponse,
        token: `local_token_${userId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al registrar usuario',
      };
    }
  },

  // Iniciar sesión
  login: async (credentials) => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : {};

      // Buscar usuario por email
      const user = Object.values(users).find(
        (u) => u.email === credentials.email
      );

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña
      const hashedPassword = hashPassword(credentials.password);
      if (user.password !== hashedPassword) {
        throw new Error('Contraseña incorrecta');
      }

      // Guardar usuario actual
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(userResponse)
      );

      return {
        success: true,
        user: userResponse,
        token: `local_token_${user.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión',
      };
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ==================== PROPIEDADES ====================

  // Obtener propiedades del usuario actual
  getProperties: async () => {
    try {
      const currentUser = await storageAPI.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const propertiesJson = await AsyncStorage.getItem(STORAGE_KEYS.PROPERTIES);
      const allProperties = propertiesJson ? JSON.parse(propertiesJson) : {};

      // Filtrar propiedades del usuario actual
      const userProperties = Object.values(allProperties).filter(
        (prop) => prop.user_id === currentUser.id
      );

      return userProperties;
    } catch (error) {
      console.error('Error getting properties:', error);
      return [];
    }
  },

  // Crear propiedad
  createProperty: async (propertyData) => {
    try {
      const currentUser = await storageAPI.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const propertiesJson = await AsyncStorage.getItem(STORAGE_KEYS.PROPERTIES);
      const properties = propertiesJson ? JSON.parse(propertiesJson) : {};

      const propertyId = generateId();
      const newProperty = {
        id: propertyId,
        user_id: currentUser.id,
        name: propertyData.name,
        address: propertyData.address,
        description: propertyData.description || null,
        createdAt: new Date().toISOString(),
      };

      properties[propertyId] = newProperty;

      await AsyncStorage.setItem(
        STORAGE_KEYS.PROPERTIES,
        JSON.stringify(properties)
      );

      return newProperty;
    } catch (error) {
      throw new Error('Error al crear propiedad');
    }
  },

  // ==================== VISITAS ====================

  // Obtener todas las visitas del usuario
  getVisits: async () => {
    try {
      const currentUser = await storageAPI.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const visitsJson = await AsyncStorage.getItem(STORAGE_KEYS.VISITS);
      const allVisits = visitsJson ? JSON.parse(visitsJson) : {};

      // Filtrar visitas del usuario actual
      const userVisits = Object.values(allVisits)
        .filter((visit) => visit.user_id === currentUser.id)
        .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

      return userVisits;
    } catch (error) {
      console.error('Error getting visits:', error);
      return [];
    }
  },

  // Obtener visitas por propiedad
  getVisitsByProperty: async (propertyId) => {
    try {
      const currentUser = await storageAPI.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const visitsJson = await AsyncStorage.getItem(STORAGE_KEYS.VISITS);
      const allVisits = visitsJson ? JSON.parse(visitsJson) : {};

      // Filtrar visitas de la propiedad
      const propertyVisits = Object.values(allVisits)
        .filter(
          (visit) =>
            visit.property_id === propertyId && visit.user_id === currentUser.id
        )
        .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

      return propertyVisits;
    } catch (error) {
      console.error('Error getting property visits:', error);
      return [];
    }
  },

  // Crear visita
  createVisit: async (visitData) => {
    try {
      const currentUser = await storageAPI.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const visitsJson = await AsyncStorage.getItem(STORAGE_KEYS.VISITS);
      const visits = visitsJson ? JSON.parse(visitsJson) : {};

      const visitId = generateId();
      const newVisit = {
        id: visitId,
        property_id: visitData.property_id,
        user_id: currentUser.id,
        visit_date: visitData.visit_date,
        needs_parking: visitData.needs_parking,
        reason: visitData.reason || '', // NUEVO CAMPO
        created_at: new Date().toISOString(),
      };

      visits[visitId] = newVisit;

      await AsyncStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));

      return newVisit;
    } catch (error) {
      throw new Error('Error al crear visita');
    }
  },



  
  // ==================== UTILIDADES ====================

  // Limpiar todos los datos (útil para desarrollo)
  clearAllData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USERS,
        STORAGE_KEYS.CURRENT_USER,
        STORAGE_KEYS.PROPERTIES,
        STORAGE_KEYS.VISITS,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};