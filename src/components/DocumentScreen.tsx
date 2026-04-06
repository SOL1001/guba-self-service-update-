import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageStyle,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService } from '../services/api';

interface Document {
  name: string;
  attachement: string;
  file_name: string;
  file_size: string;
  file_id: string;
}

interface DocumentScreenProps {
  onBack: () => void;
}

export default function DocumentScreen({ onBack }: DocumentScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await apiService.getDocumentList();

      if (response && response.data && Array.isArray(response.data)) {
        const isSuccess = (response.message || '').toLowerCase().includes('success');
        if (isSuccess) {
          setDocuments(response.data);
        } else {
          setDocuments([]); // Treat 500/Connection error as empty state
        }
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('/')) {
      const baseUrl = apiService.getBaseUrl();
      if (baseUrl) return `${baseUrl}${imagePath}`;
    }
    return imagePath;
  };

  const getFileIconConfig = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return { icon: 'document-text', color: '#EF4444' };
      case 'doc':
      case 'docx': return { icon: 'document', color: '#3B82F6' };
      case 'xls':
      case 'xlsx': return { icon: 'grid', color: '#10B981' };
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return { icon: 'image', color: '#8B5CF6' };
      case 'svg': return { icon: 'color-palette', color: '#F59E0B' };
      default: return { icon: 'document-outline', color: '#9CA3AF' };
    }
  };

  const renderDocumentCard = ({ item, index }: { item: Document, index: number }) => {
    const imageUrl = getImageUrl(item.attachement);
    const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(item.file_name.split('.').pop()?.toLowerCase() || '');
    const config = getFileIconConfig(item.file_name);

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <TouchableOpacity
          style={[styles.docCard, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: config.color + '15' }]}>
              {isImage && imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name={config.icon as any} size={28} color={config.color} />
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={2}>
                {item.file_name}
              </Text>
              <Text style={[styles.fileSize, { color: theme.secondary }]}>
                {item.file_size || 'Size Unknown'}
              </Text>
            </View>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.border + '30' }]}>
              <Ionicons name="download-outline" size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardFooter, { backgroundColor: theme.background }]}>
            <View style={styles.footerItem}>
              <Ionicons name="key-outline" size={12} color={theme.secondary} />
              <Text style={[styles.footerText, { color: theme.secondary }]}>ID: {item.file_id || item.name}</Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="folder-open-outline" size={12} color={theme.secondary} />
              <Text style={[styles.footerText, { color: theme.secondary }]}>Storage</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <SafeAreaView>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>RESOURCES</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Documents</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.countText, { color: theme.primary }]}>{documents.length}</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.bentoStats}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <View style={[styles.statIconBox, { backgroundColor: '#3B82F615' }]}>
            <Ionicons name="cloud-done-outline" size={22} color="#3B82F6" />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>Sync Active</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>All files up to date</Text>
          </View>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={styles.statIndicator} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={documents}
        renderItem={renderDocumentCard}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Animated.View entering={FadeIn} style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
                <Ionicons name="document-text-outline" size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No documents found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                Important records and attachments will appear here after they are uploaded.
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.centerSection}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.secondary }]}>Indexing records...</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  headerContainer: {
    paddingBottom: 8,
  } as ViewStyle,
  navHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  } as ViewStyle,
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  } as ViewStyle,
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  } as TextStyle,
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: -2,
  } as TextStyle,
  countBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  } as ViewStyle,
  countText: {
    fontSize: 14,
    fontWeight: '900',
  } as TextStyle,
  bentoStats: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  } as ViewStyle,
  statCard: {
    padding: 20,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  } as TextStyle,
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -1,
  } as TextStyle,
  statIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  } as TextStyle,
  listContent: {
    paddingBottom: 100,
  } as ViewStyle,
  docCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 36,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  } as ViewStyle,
  previewImage: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  headerInfo: {
    flex: 1,
    gap: 4,
  } as ViewStyle,
  fileName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 22,
  } as TextStyle,
  fileSize: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  } as ViewStyle,
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 20,
  } as ViewStyle,
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,
  footerText: {
    fontSize: 11,
    fontWeight: '700',
  } as TextStyle,
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 120,
  } as ViewStyle,
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
  } as TextStyle,
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  } as TextStyle,
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  } as ViewStyle,
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  } as TextStyle,
});
