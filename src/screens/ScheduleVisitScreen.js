import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as LocalAuthentication from 'expo-local-authentication';
import { storageAPI } from '../services/storage';

export default function ScheduleVisitScreen({ route, navigation }) {
  const { property } = route.params;
  const [visitDate, setVisitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [needsParking, setNeedsParking] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  };

  const authenticateUser = async () => {
    const biometricSupported = await checkBiometricSupport();

    if (!biometricSupported) {
      Alert.alert(
        'Autenticación no disponible',
        'Tu dispositivo no tiene autenticación biométrica configurada. ¿Deseas continuar sin verificación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => handleSubmit() },
        ]
      );
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verifica tu identidad',
      fallbackLabel: 'Usar código de acceso',
      cancelLabel: 'Cancelar',
    });

    return result.success;
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Por favor indica la razón de tu visita');
      return;
    }

    const authenticated = await authenticateUser();
    
    if (authenticated || authenticated === undefined) {
      await handleSubmit();
    } else {
      Alert.alert('Error', 'Autenticación fallida. No se pudo registrar la visita.');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await storageAPI.createVisit({
        property_id: property.id,
        visit_date: visitDate.toISOString(),
        needs_parking: needsParking,
        reason: reason.trim(),
      });

      Alert.alert('Éxito', 'Visita registrada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la visita');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(visitDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setVisitDate(newDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(visitDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setVisitDate(newDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyAddress}>{property.address}</Text>
        </View>

        <Text style={styles.sectionTitle}>Detalles de la Visita</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Razón de la visita *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Inspección de mantenimiento, reunión con inquilino, etc."
            placeholderTextColor="#999"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
          />

          <Text style={styles.label}>Fecha de la visita</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(visitDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={visitDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Hora aproximada</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateText}>{formatTime(visitDate)}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={visitDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>¿Necesitas estacionamiento?</Text>
              <Text style={styles.switchSubtext}>
                Indica si requieres un espacio de estacionamiento
              </Text>
            </View>
            <Switch
              value={needsParking}
              onValueChange={setNeedsParking}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔐 Se te pedirá verificar tu identidad mediante huella digital, reconocimiento
            facial o código de seguridad antes de confirmar la visita.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirmar Visita</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  propertyInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});