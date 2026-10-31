import { AppText } from "@/components/core/app-text";
import { AppView } from "@/components/core/app-view";
import Button from "@/components/core/button";
import ScreenHeader from "@/components/core/screen-header";
import CreateItemModal from "@/components/shared/create-item-modal";
import EmptyState from "@/components/shared/empty-state";
import SwipeableItem from "@/components/shared/swipeable-item";
import { udhaarFriendSchema } from "@/constants/schemas";
import {
  addUdhaarFriend,
  archiveUdhaarFriend,
  deleteUdhaarFriend,
  getUdhaarFriendBalance,
  getUdhaarFriends,
} from "@/services/database";
import type { UdhaarFriend } from "@/types/database";
import { formatAmount } from "@/utils/format";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { z } from "zod";

type FriendWithBalance = UdhaarFriend & {
  balance: number;
  hasTransactions: boolean;
};

type FriendCardProps = {
  id: string;
  name: string;
  amount: number;
  onPress: () => void;
};

function FriendCard({ name, amount, onPress }: FriendCardProps) {
  const isOwe = amount < 0;
  const displayAmount = Math.abs(amount);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <AppView type="secondary" style={styles.card}>
        <AppText style={styles.name}>{name}</AppText>
        <AppText style={[styles.amount, { color: isOwe ? "#ef4444" : "#22c55e" }]}>
          {isOwe ? `You will give ₹${formatAmount(displayAmount)}` : `You will get ₹${formatAmount(displayAmount)}`}
        </AppText>
      </AppView>
    </TouchableOpacity>
  );
}

export default function UdhaarScreen() {
  const [friends, setFriends] = useState<FriendWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const loadFriends = useCallback(async () => {
    try {
      const friendsList = await getUdhaarFriends();
      const friendsWithBalance = await Promise.all(
        friendsList.map(async (friend) => {
          const { balance, hasTransactions } = await getUdhaarFriendBalance(friend.id);
          return { ...friend, balance, hasTransactions };
        })
      );
      setFriends(friendsWithBalance);
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert("Error", "Failed to load udhaar friends");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends])
  );

  const handleCreate = () => {
    setModalVisible(true);
  };

  const handleAddFriend = async (data: { [key: string]: string }) => {
    try {
      const parsedData = udhaarFriendSchema.parse({
        name: data.name?.trim(),
      });

      await addUdhaarFriend(parsedData.name);
      await loadFriends();
      setModalVisible(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        Alert.alert("Invalid Input", error.issues[0].message);
      } else {
        console.error("Error adding friend:", error);
        Alert.alert("Error", "Failed to add friend");
      }
    }
  };

  const handleArchive = async (id: string, name: string) => {
    Alert.alert(
      "Archive Friend",
      `Are you sure you want to archive '${name}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              await archiveUdhaarFriend(id);
              await loadFriends();
            } catch (error) {
              console.error("Error archiving friend:", error);
              Alert.alert("Error", "Failed to archive friend");
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      "Delete Friend",
      `Are you sure you want to delete '${name}'? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUdhaarFriend(id);
              await loadFriends();
            } catch (error) {
              console.error("Error deleting friend:", error);
              Alert.alert("Error", "Failed to delete friend");
            }
          },
        },
      ]
    );
  };

  const handleFriendPress = (friendId: string, friendName: string) => {
    router.push({
      pathname: "/udhaar-detail",
      params: { friendId, friendName },
    });
  };

  return (
    <AppView style={styles.container}>
      <AppView style={styles.headerRow}>
        <ScreenHeader title="Udhaar" subtitle="Track your udhaars" />
        {friends.length > 0 && (
          <Button icon="add-circle-outline" inline onPress={handleCreate} />
        )}
      </AppView>

      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : friends.length === 0 ? (
        <EmptyState
          title="Track who owes you and whom you owe"
          description="Easily manage all your lend and borrow records in one place."
          buttonLabel="Add your first udhaar"
          onPress={handleCreate}
        />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableItem
              onDelete={!item.hasTransactions ? () => handleDelete(item.id, item.name) : undefined}
              onArchive={item.hasTransactions ? () => handleArchive(item.id, item.name) : undefined}
              deleteLabel="Delete"
              archiveLabel="Archive"
            >
              <FriendCard
                id={item.id}
                name={item.name}
                amount={item.balance}
                onPress={() => handleFriendPress(item.id, item.name)}
              />
            </SwipeableItem>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      <CreateItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddFriend}
        title="Add Udhaar Friend"
        fields={[{ key: "name", label: "Friend Name" }]}
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
  card: {
    borderRadius: 12,
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  amount: {
    fontSize: 14,
    marginTop: 6,
  },
});
