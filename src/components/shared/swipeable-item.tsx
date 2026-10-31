import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  deleteLabel?: string;
  archiveLabel?: string;
}

function ActionButton({
  icon,
  label,
  backgroundColor,
  onPress,
  progress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  backgroundColor: string;
  onPress: () => void;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: progress.value }],
    };
  });

  return (
    <RectButton style={[styles.rightAction, { backgroundColor }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="white" />
      <Animated.Text style={[styles.actionText, animatedStyle]}>{label}</Animated.Text>
    </RectButton>
  );
}

export default function SwipeableItem({
  children,
  onDelete,
  onArchive,
  deleteLabel = "Delete",
  archiveLabel = "Archive",
}: SwipeableItemProps) {
  if (!onDelete && !onArchive) {
    return <View style={styles.container}>{children}</View>;
  }

  const renderRightActions = (
    progress: SharedValue<number>,
    _translation: SharedValue<number>,
    swipeableMethods: { close: () => void }
  ) => {
    return (
      <View style={styles.actionsContainer}>
        {onArchive && (
          <ActionButton
            icon="archive-outline"
            label={archiveLabel}
            backgroundColor="#4caf50"
            onPress={() => {
              swipeableMethods.close();
              onArchive();
            }}
            progress={progress}
          />
        )}
        {onDelete && (
          <ActionButton
            icon="trash-outline"
            label={deleteLabel}
            backgroundColor="#dd2c00"
            onPress={() => {
              swipeableMethods.close();
              onDelete();
            }}
            progress={progress}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ReanimatedSwipeable renderRightActions={renderRightActions} overshootRight={false}>
        {children}
      </ReanimatedSwipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionsContainer: {
    width: 140,
    flexDirection: "row",
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 10,
    backgroundColor: "transparent",
    fontWeight: "600",
    marginTop: 4,
  },
});
