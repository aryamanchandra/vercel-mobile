import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { FileText } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { RuntimeLog } from '../types';

export const RuntimeLogsScreen = ({ route }: any) => {
  const { projectId, deploymentId, deploymentUrl } = route.params;
  const { api } = useAuth();
  const [logs, setLogs] = useState<RuntimeLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<RuntimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchQuery, selectedSource, logs]);

  const fetchLogs = async () => {
    if (!api) return;

    try {
      setLoading(true);
      const response = await api.getRuntimeLogs(projectId, deploymentId);
      // Parse logs if they come as an array
      const logData = Array.isArray(response) ? response : response.logs || [];
      setLogs(logData);
      setFilteredLogs(logData);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch runtime logs');
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSource) {
      filtered = filtered.filter(log => log.source === selectedSource);
    }

    setFilteredLogs(filtered);
  };

  const copyLog = (log: RuntimeLog) => {
    const logText = `[${new Date(log.timestamp).toISOString()}] [${log.source}] ${log.message}`;
    Clipboard.setString(logText);
    Alert.alert('Copied', 'Log copied to clipboard');
  };

  const copyAllLogs = () => {
    const allLogsText = filteredLogs
      .map(log => `[${new Date(log.timestamp).toISOString()}] [${log.source}] ${log.message}`)
      .join('\n');
    Clipboard.setString(allLogsText);
    Alert.alert('Copied', `${filteredLogs.length} logs copied to clipboard`);
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      stdout: '#0070f3',
      stderr: '#ff0000',
      static: '#888',
      lambda: '#f5a623',
      external: '#50e3c2',
    };
    return colors[source] || '#888';
  };

  const getTypeIcon = (type?: string) => {
    const icons: { [key: string]: string } = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    return type ? icons[type] || '' : '';
  };

  const sources = ['stdout', 'stderr', 'static', 'lambda', 'external'];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{deploymentUrl}</Text>
        <Text style={styles.subtitle}>{filteredLogs.length} logs</Text>
      </View>

      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sourceFilters}>
          <TouchableOpacity
            style={[styles.sourceFilter, !selectedSource && styles.sourceFilterActive]}
            onPress={() => setSelectedSource(null)}
          >
            <Text style={[styles.sourceFilterText, !selectedSource && styles.sourceFilterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {sources.map((source) => (
            <TouchableOpacity
              key={source}
              style={[
                styles.sourceFilter,
                selectedSource === source && { borderColor: getSourceColor(source) },
              ]}
              onPress={() => setSelectedSource(source)}
            >
              <Text
                style={[
                  styles.sourceFilterText,
                  selectedSource === source && { color: getSourceColor(source) },
                ]}
              >
                {source}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredLogs.length > 0 && (
          <TouchableOpacity style={styles.copyAllButton} onPress={copyAllLogs}>
            <Text style={styles.copyAllText}>📋 Copy All</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={logs.length === 0 ? 'No Logs' : 'No Results'}
          message={logs.length === 0 ? 'No runtime logs available for this deployment.' : 'No logs match your search.'}
        />
      ) : (
        <ScrollView style={styles.logsContainer}>
          {filteredLogs.map((log, index) => (
            <TouchableOpacity
              key={index}
              style={styles.logEntry}
              onLongPress={() => copyLog(log)}
            >
              <View style={styles.logHeader}>
                <View style={[styles.sourceDot, { backgroundColor: getSourceColor(log.source) }]} />
                <Text style={styles.logSource}>{log.source}</Text>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
                {log.type && (
                  <Text style={styles.logIcon}>{getTypeIcon(log.type)}</Text>
                )}
              </View>
              <Text style={[
                styles.logMessage,
                log.type === 'error' && styles.logMessageError,
                log.type === 'warn' && styles.logMessageWarn,
              ]}>
                {log.message}
              </Text>
              {log.requestId && (
                <Text style={styles.logRequestId}>Request: {log.requestId}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  controls: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  searchInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  sourceFilters: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sourceFilter: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  sourceFilterActive: {
    borderColor: '#0070f3',
  },
  sourceFilterText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  sourceFilterTextActive: {
    color: '#0070f3',
  },
  copyAllButton: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  copyAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
  },
  logEntry: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  logSource: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginRight: 8,
  },
  logTime: {
    fontSize: 10,
    color: '#666',
    flex: 1,
  },
  logIcon: {
    fontSize: 12,
  },
  logMessage: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Courier',
    lineHeight: 18,
  },
  logMessageError: {
    color: '#ff6b6b',
  },
  logMessageWarn: {
    color: '#ffd43b',
  },
  logRequestId: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Courier',
  },
});

