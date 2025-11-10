import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { storageAPI } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function VisitsScreen() {
  const [visits, setVisits] = useState([]);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitsData, propertiesData] = await Promise.all([
        storageAPI.getVisits(),
        storageAPI.getProperties(),
      ]);

      setVisits(visitsData);

      const propertiesMap = {};
      propertiesData.forEach((prop) => {
        propertiesMap[prop.id] = prop;
      });
      setProperties(propertiesMap);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las visitas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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

  const renderVisit = ({ item }) => {
    const property = properties[item.property_id];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName}>
              {property?.name || 'Propiedad'}
            </Text>
            <Text style={styles.propertyAddress}>
              {property?.address || ''}
            </Text>
          </View>
          {item.needs_parking && (
            <View style={styles.parkingBadge}>
              <Text style={styles.parkingText}>🅿️</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Fecha de visita:</Text>
          <Text style={styles.dateValue}>{formatDate(item.visit_date)}</Text>
        </View>

        <Text style={styles.registeredText}>
          Registrada: {formatDate(item.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={visits}
        renderItem={renderVisit}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay visitas registradas</Text>
            <Text style={styles.emptySubtext}>
              Las visitas que registres aparecerán aquí
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
  },
  parkingBadge: {
    backgroundColor: '#E3F2FD',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkingText: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  dateInfo: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  registeredText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  reasonContainer: {
  marginVertical: 8,
},
reasonLabel: {
  fontSize: 12,
  color: '#999',
  marginBottom: 4,
},
reasonText: {
  fontSize: 14,
  color: '#333',
  lineHeight: 20,
},

});