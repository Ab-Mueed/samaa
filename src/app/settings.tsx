import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView, 
  SafeAreaView, 
  Dimensions, 
  Platform,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePlayer } from '@/context/player-context';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { Spacing, ThemeAccent } from '@/constants/theme';

const PRESET_THEMES: { id: ThemeAccent; name: string; color: string }[] = [
  { id: 'rose', name: 'Samaa Rose', color: '#8F302A' },
  { id: 'teal', name: 'Mint Teal', color: '#006A5C' },
  { id: 'purple', name: 'Royal Purple', color: '#7E2A8F' },
  { id: 'indigo', name: 'Indigo Ocean', color: '#005FAF' },
  { id: 'slate', name: 'Charcoal Slate', color: '#4F5E70' },
  { id: 'amber', name: 'Forest Amber', color: '#785A00' },
  { id: 'amoled', name: 'AMOLED Dark', color: '#000000' }
];

export default function SettingsScreen() {
  const { themeAccent, setThemeAccent, userName, setUserName } = usePlayer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim().length > 0) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: Math.max(Spacing.three, insets.top) }]}>
          <Pressable 
            onPress={() => router.back()} 
            style={({ pressed }) => [
              styles.backBtn, 
              { backgroundColor: theme.backgroundElement },
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
            ]}
          >
            <Icons.ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.cardSectionTitle}>User Profile</ThemedText>
            
            <View style={styles.profileRow}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.avatarLetter}>
                  {userName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>

              <View style={styles.profileDetails}>
                {isEditingName ? (
                  <View style={styles.editNameWrapper}>
                    <TextInput
                      value={tempName}
                      onChangeText={setTempName}
                      style={[styles.nameInput, { color: theme.text, borderBottomColor: theme.primary }]}
                      placeholder="Enter name..."
                      placeholderTextColor={theme.textSecondary}
                      autoFocus={true}
                      maxLength={15}
                    />
                    <Pressable 
                      onPress={handleSaveName} 
                      style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                    >
                      <Icons.Checked size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.displayNameRow}>
                    <View>
                      <ThemedText type="small" themeColor="textSecondary">Display Name</ThemedText>
                      <ThemedText style={styles.displayName}>{userName}</ThemedText>
                    </View>
                    <Pressable 
                      onPress={() => {
                        setTempName(userName);
                        setIsEditingName(true);
                      }} 
                      style={styles.editBtn}
                    >
                      <Icons.Queue size={18} color={theme.primary} />
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <Pressable 
              onPress={() => setShowThemeModal(true)}
              style={({ pressed }) => [
                styles.optionRow,
                pressed && { opacity: 0.7 }
              ]}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBox, { backgroundColor: theme.primary + '15' }]}>
                  <Icons.Appearance size={20} color={theme.primary} />
                </View>
                <View style={styles.optionTexts}>
                  <ThemedText style={styles.optionTitle}>Appearance</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Theme: {PRESET_THEMES.find(t => t.id === themeAccent)?.name || 'AMOLED Dark'}
                  </ThemedText>
                </View>
              </View>
              <Icons.ArrowRight size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.logoBadgeRow}>
              <Icons.Play size={24} color={theme.primary} />
              <View>
                <ThemedText style={styles.appName}>Samaa</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Version 1.2.0</ThemedText>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* APPEARANCE / THEME SELECTOR MODAL */}
        {showThemeModal && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowThemeModal(false)}
          >
            <Pressable onPress={() => setShowThemeModal(false)} style={styles.modalOverlay}>
              <View style={[styles.themeDialog, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.dialogTitle}>Appearance Settings</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.dialogSubtitle}>
                  Select an accent color to customize your Material Design theme
                </ThemedText>

                <ScrollView style={styles.themeListContainer} showsVerticalScrollIndicator={false}>
                  {PRESET_THEMES.map((item) => {
                    const isSelected = themeAccent === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setThemeAccent(item.id)}
                        style={[
                          styles.themeOptionRow,
                          isSelected && { backgroundColor: 'rgba(255,255,255,0.08)' }
                        ]}
                      >
                        <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />
                        <ThemedText style={[
                          styles.themeName,
                          isSelected && { fontWeight: 'bold', color: theme.primary }
                        ]}>
                          {item.name}
                        </ThemedText>
                        {isSelected && <Icons.Checked size={18} color={theme.primary} />}
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Pressable 
                  onPress={() => setShowThemeModal(false)} 
                  style={[styles.dialogCloseBtn, { backgroundColor: theme.primary }]}
                >
                  <ThemedText style={{ color: theme.onPrimary || '#FFFFFF', fontWeight: 'bold' }}>Apply Theme</ThemedText>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        )}

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  card: {
    borderRadius: 24,
    padding: Spacing.three,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  displayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingVertical: Spacing.one,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTexts: {
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeDialog: {
    width: Dimensions.get('window').width * 0.85,
    borderRadius: 28,
    padding: Spacing.four,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    alignSelf: 'center',
  },
  dialogTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  dialogSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  themeListContainer: {
    width: '100%',
    maxHeight: 240,
    marginBottom: Spacing.three,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 12,
    marginVertical: Spacing.one / 2,
    gap: Spacing.two,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  themeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  dialogCloseBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  aboutContent: {
    gap: Spacing.two,
  },
  logoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
  },
  aboutText: {
    lineHeight: 18,
    marginTop: Spacing.one,
  },
});
