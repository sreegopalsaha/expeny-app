import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { AppText } from "./app-text";

type ButtonProps = {
  onPress?: (event?: GestureResponderEvent) => void;
  inline?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

export default function Button({
  onPress,
  inline,
  icon,
  iconColor = Colors.accent,
  children,
  style,
  textStyle,
  disabled,
}: ButtonProps) {
  if (inline) {
    return (
      <TouchableOpacity
        style={[styles.iconBtn, style, disabled && { opacity: 0.5 }]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {icon && <Ionicons name={icon} size={26} color={iconColor} />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {icon && <Ionicons name={icon} size={20} color={iconColor} />}
      {children && <AppText style={[styles.text, textStyle]}>{children}</AppText>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.buttonBackground,
    paddingVertical: 14,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
});
