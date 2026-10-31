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

function RightActionsView({
  progress,
  actionWidth,
  onArchive,
  archiveLabel,
  onDelete,
  deleteLabel,
  swipeableMethods,
}: {
  progress: SharedValue<number>;
  actionWidth: number;
  onArchive?: () => void;
  archiveLabel: string;
  onDelete?: () => void;
  deleteLabel: string;
  swipeableMethods: { close: () => void };
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: (1 - progress.value) * actionWidth }],
      opacity: progress.value > 0.02 ? 1 : 0,
    };
  });

  return (
    <Animated.View style={[styles.actionsContainer, { width: actionWidth }, animatedStyle]}>
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
    </Animated.View>
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

  const numActions = (onArchive ? 1 : 0) + (onDelete ? 1 : 0);
  const actionWidth = numActions * 75;

  const renderRightActions = (
    progress: SharedValue<number>,
    _translation: SharedValue<number>,
    swipeableMethods: { close: () => void }
  ) => {
    return (
      <RightActionsView
        progress={progress}
        actionWidth={actionWidth}
        onArchive={onArchive}
        archiveLabel={archiveLabel}
        onDelete={onDelete}
        deleteLabel={deleteLabel}
        swipeableMethods={swipeableMethods}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ReanimatedSwipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        containerStyle={styles.swipeableContainer}
        childrenContainerStyle={styles.childrenContainer}
      >
        {children}
      </ReanimatedSwipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  swipeableContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  childrenContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  actionsContainer: {
    flexDirection: "row",
    height: "100%",
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
