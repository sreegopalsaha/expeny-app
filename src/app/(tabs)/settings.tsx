import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import ScreenHeader from "@/components/core/screen-header";
import { Colors } from "@/constants/colors";
import { clearAllData, deleteUser, getUser } from "@/services/database";
import type { User } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await getUser();
      setUser(currentUser);
    } catch (e) {
      console.error("Error fetching user for settings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Cannot open URL: ${url}`);
      }
    } catch (e) {
      console.error("Failed to open link:", e);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to permanently erase all transactions, pockets, and udhaar records? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllData();
              Alert.alert("Success", "All transactions and records have been cleared.");
            } catch (err) {
              console.error("Failed to clear data:", err);
              Alert.alert("Error", "Failed to clear app data. Please try again.");
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser();
              router.replace("/welcome");
            } catch (err) {
              console.error("Failed to logout:", err);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <AppView style={styles.container}>
      <ScreenHeader title="Settings" subtitle="Preferences & account" />

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Profile Card */}
          <AppView type="secondary" style={styles.profileCard}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AppText>
            </View>
            <View style={styles.profileInfo}>
              <AppText type="defaultSemiBold" style={styles.profileName} numberOfLines={1}>
                {user?.name || "User"}
              </AppText>
              <AppText style={styles.profileEmail} numberOfLines={1}>
                {user?.email || "No email"}
              </AppText>
              {memberSince && (
                <AppText style={styles.memberSince}>
                  Member since {memberSince}
                </AppText>
              )}
            </View>
          </AppView>

          {/* Legal Section */}
          <AppText style={styles.sectionTitle}>LEGAL & POLICIES</AppText>
          <AppView type="secondary" style={styles.groupCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={() => handleOpenLink("https://expeny.vercel.app/privacy")}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: "rgba(96, 165, 250, 0.15)" }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#60A5FA" />
                </View>
                <AppText style={styles.rowLabel}>Privacy Policy</AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={() => handleOpenLink("https://expeny.vercel.app/terms")}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: "rgba(167, 139, 250, 0.15)" }]}>
                  <Ionicons name="document-text-outline" size={20} color="#A78BFA" />
                </View>
                <AppText style={styles.rowLabel}>Terms & Conditions</AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>
          </AppView>

          {/* Data Management Section */}
          <AppText style={styles.sectionTitle}>DATA & STORAGE</AppText>
          <AppView type="secondary" style={styles.groupCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={handleClearData}
              disabled={isClearing}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: "rgba(250, 204, 21, 0.15)" }]}>
                  <Ionicons name="trash-outline" size={20} color="#FACC15" />
                </View>
                <View style={styles.rowTextCol}>
                  <AppText style={styles.rowLabel}>Clear Data</AppText>
                  <AppText style={styles.rowSubtitle}>
                    Erase transactions, pockets, and balances
                  </AppText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>
          </AppView>

          {/* Account Section */}
          <AppText style={styles.sectionTitle}>ACCOUNT</AppText>
          <AppView type="secondary" style={styles.groupCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={handleLogout}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </View>
                <View style={styles.rowTextCol}>
                  <AppText style={[styles.rowLabel, { color: "#EF4444" }]}>Logout</AppText>
                  <AppText style={styles.rowSubtitle}>Sign out of your session</AppText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>
          </AppView>

          {/* App Version Footer */}
          <View style={styles.footer}>
            <AppText style={styles.footerText}>Expeny • v1.0.0</AppText>
          </View>
        </ScrollView>
      )}
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.tint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 11,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
    textTransform: "uppercase",
  },
  groupCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowTextCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#2E2E2E",
    marginLeft: 66,
  },
  footer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#4B5563",
  },
});
