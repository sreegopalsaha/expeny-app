import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import ScreenHeader from "@/components/core/screen-header";
import PocketCard from "@/components/pockets/pocket-card";
import CreateItemModal from "@/components/shared/create-item-modal";
import EmptyState from "@/components/shared/empty-state";
import SwipeableItem from "@/components/shared/swipeable-item";
import { pocketSchema } from "@/constants/schemas";
import {
  addPocket,
  archivePocket,
  deletePocket,
  getPockets,
  type PocketWithMeta,
} from "@/services/database";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { z } from "zod";

export default function PocketsScreen() {
  const [pockets, setPockets] = useState<PocketWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const loadPockets = useCallback(async () => {
    try {
      const pocketsData = await getPockets();
      setPockets(pocketsData);
    } catch (error) {
      console.error("Error loading pockets:", error);
      Alert.alert("Error", "Failed to load pockets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPockets();
    }, [loadPockets])
  );

  const handleCreate = () => {
    setModalVisible(true);
  };

  const handleAddPocket = async (data: { [key: string]: string }) => {
    try {
      const parsedData = pocketSchema.parse({
        title: data.title?.trim(),
        total: parseFloat(data.total || "0"),
      });

      await addPocket(parsedData.title, parsedData.total);
      await loadPockets();
      setModalVisible(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        Alert.alert("Invalid Input", error.issues[0].message);
      } else {
        console.error("Error adding pocket:", error);
        Alert.alert("Error", "Failed to add pocket");
      }
    }
  };

  const handleArchive = async (id: string, title: string) => {
    Alert.alert(
      "Archive Pocket",
      `Are you sure you want to archive '${title}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              await archivePocket(id);
              await loadPockets();
            } catch (error) {
              console.error("Error archiving pocket:", error);
              Alert.alert("Error", "Failed to archive pocket");
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (id: string, title: string) => {
    Alert.alert(
      "Delete Pocket",
      `Are you sure you want to delete '${title}'? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePocket(id);
              await loadPockets();
            } catch (error) {
              console.error("Error deleting pocket:", error);
              Alert.alert("Error", "Failed to delete pocket");
            }
          },
        },
      ]
    );
  };

  return (
    <AppView style={styles.container}>
      <AppView style={styles.headerRow}>
        <ScreenHeader title="Pockets" subtitle="Keep your spending sorted" />
        {pockets.length > 0 && (
          <Button icon="add-circle-outline" inline onPress={handleCreate} />
        )}
      </AppView>

      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : pockets.length === 0 ? (
        <EmptyState
          title="No pockets yet"
          description="Create a pocket for temporary budgets like trips or shopping to track spending easily."
          buttonLabel="Add your first pocket"
          onPress={handleCreate}
        />
      ) : (
        <FlatList
          data={pockets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableItem
              onDelete={!item.hasTransactions ? () => handleDelete(item.id, item.title) : undefined}
              onArchive={item.hasTransactions ? () => handleArchive(item.id, item.title) : undefined}
              deleteLabel="Delete"
              archiveLabel="Archive"
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/pocket-detail",
                    params: {
                      pocketId: item.id,
                      title: item.title,
                      total: item.total.toString(),
                    },
                  })
                }
              >
                <PocketCard
                  title={item.title}
                  spent={item.spent}
                  total={item.total}
                />
              </TouchableOpacity>
            </SwipeableItem>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      <CreateItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddPocket}
        title="Create Pocket"
        fields={[
          { key: "title", label: "Pocket Name (e.g. October Shopping)" },
          { key: "total", label: "Total Budget", keyboardType: "numeric" },
        ]}
      />
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
