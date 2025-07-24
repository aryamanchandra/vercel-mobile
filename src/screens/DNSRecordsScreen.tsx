import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { DNSRecord } from '../types';

export const DNSRecordsScreen = ({ route }: any) => {
  const { domain } = route.params;
  const { api } = useAuth();
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form states
  const [recordName, setRecordName] = useState('');
  const [recordType, setRecordType] = useState<DNSRecord['type']>('A');
  const [recordValue, setRecordValue] = useState('');
  const [recordTTL, setRecordTTL] = useState('3600');
  const [creating, setCreating] = useState(false);

  const fetchRecords = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      const response = await api.getDNSRecords(domain);
      setRecords(response.records || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch DNS records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecords(true);
  }, []);

  const handleDelete = (record: DNSRecord) => {
    Alert.alert(
      'Delete DNS Record',
      `Delete ${record.type} record for ${record.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(record.id),
        },
      ]
    );
  };

  const confirmDelete = async (recordId: string) => {
    if (!api) return;

    try {
      await api.deleteDNSRecord(domain, recordId);
      Alert.alert('Success', 'DNS record deleted');
      fetchRecords();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete record');
    }
  };

  const handleCreate = async () => {
    if (!recordName.trim() || !recordValue.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!api) return;

    try {
      setCreating(true);
      await api.createDNSRecord(domain, {
        name: recordName,
        type: recordType,
        value: recordValue,
        ttl: parseInt(recordTTL) || 3600,
      });
      Alert.alert('Success', 'DNS record created');
      setModalVisible(false);
      resetForm();
      fetchRecords();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create record');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setRecordName('');
    setRecordType('A');
    setRecordValue('');
    setRecordTTL('3600');
  };

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      A: '#0070f3',
      AAAA: '#7928ca',
      CNAME: '#f5a623',
      MX: '#ff0080',
      TXT: '#50e3c2',
      NS: '#f81ce5',
      SRV: '#79ffe1',
      CAA: '#eb367f',
      ALIAS: '#0070f3',
    };
    return colors[type] || '#888';
  };

  const recordTypes: DNSRecord['type'][] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA', 'ALIAS'];

  const renderRecord = ({ item }: { item: DNSRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={[styles.typeBadge, { backgroundColor: getRecordTypeColor(item.type) }]}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.recordBody}>
        <View style={styles.recordRow}>
          <Text style={styles.recordLabel}>Name:</Text>
          <Text style={styles.recordValue}>{item.name || '@'}</Text>
        </View>
        <View style={styles.recordRow}>
          <Text style={styles.recordLabel}>Value:</Text>
          <Text style={styles.recordValue} numberOfLines={2}>{item.value}</Text>
        </View>
        <View style={styles.recordRow}>
          <Text style={styles.recordLabel}>TTL:</Text>
          <Text style={styles.recordValue}>{item.ttl || 3600}s</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{domain}</Text>
          <Text style={styles.subtitle}>DNS Records</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {records.length === 0 ? (
        <EmptyState
          icon="server-outline"
          title="No DNS Records"
          message="Add your first DNS record to get started."
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecord}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add DNS Record</Text>

              <Text style={styles.label}>Record Type</Text>
              <View style={styles.typeOptions}>
                {recordTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      recordType === type && { backgroundColor: getRecordTypeColor(type) },
                    ]}
                    onPress={() => setRecordType(type)}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      recordType === type && { color: '#fff' },
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="@ or subdomain"
                placeholderTextColor="#666"
                value={recordName}
                onChangeText={setRecordName}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Value</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={recordType === 'A' ? '192.0.2.1' : 'Record value'}
                placeholderTextColor="#666"
                value={recordValue}
                onChangeText={setRecordValue}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>TTL (seconds)</Text>
              <TextInput
                style={styles.input}
                placeholder="3600"
                placeholderTextColor="#666"
                value={recordTTL}
                onChangeText={setRecordTTL}
                keyboardType="numeric"
              />

              <Button
                title="Create Record"
                onPress={handleCreate}
                loading={creating}
                style={styles.createButton}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                variant="secondary"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  listContent: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  deleteText: {
    fontSize: 14,
    color: '#ff0000',
  },
  recordBody: {
    gap: 8,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordLabel: {
    fontSize: 12,
    color: '#888',
    width: 60,
  },
  recordValue: {
    fontSize: 12,
    color: '#fff',
    flex: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  createButton: {
    marginBottom: 12,
  },
});

