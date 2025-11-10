import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { storageAPI } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;
  const [visits, setVisits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchVisits();
    }, [])
  );

  const fetchVisits = async () => {
    try {
      const data = await storageAPI.getVisitsByProperty(property.id);
      setVisits(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las visitas');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVisits();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.propertyCard}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyAddress}>{property.address}</Text>
          {property.description && (
            <Text style={styles.propertyDescription}>{property.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Historial de Visitas ({visits.length})
          </Text>

          {visits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay visitas registradas</Text>
              <Text style={styles.emptySubtext}>
                Registra una nueva visita usando el botón inferior
              </Text>
            </View>
          ) : (
            visits.map((visit) => (
              <View key={visit.id} style={styles.visitCard}>
                <View style={styles.visitHeader}>
                  <Text style={styles.visitDate}>{formatDate(visit.visit_date)}</Text>
                  {visit.needs_parking && (
                    <View style={styles.parkingBadge}>
                      <Text style={styles.parkingText}>🅿️ Estacionamiento</Text>
                    </View>
                  )}
                 {visit.reason && (
      <Text style={styles.visitReason}>{visit.reason}</Text>
    )}
    <Text style={styles.visitCreated}>
      Registrada: {formatDate(visit.created_at)}
    </Text>
                  
                </View>
                <Text style={styles.visitCreated}>
                  Registrada: {formatDate(visit.created_at)}
                </Text>
              </View>
              
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('ScheduleVisit', { property })
        }
      >
        <Text style={styles.buttonText}>Registrar Nueva Visita</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 140 : 120,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  propertyAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  propertyDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  parkingBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  parkingText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  visitCreated: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 105 : 90,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  visitReason: {
  fontSize: 14,
  color: '#666',
  marginVertical: 8,
  lineHeight: 20,
},
});

