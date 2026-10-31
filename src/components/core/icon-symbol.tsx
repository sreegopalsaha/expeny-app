import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { type ColorValue, type StyleProp, type TextStyle } from "react-native";

const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>["name"]> = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "wallet.pass.fill": "account-balance-wallet",
  "person.2.fill": "people",
  "flame.fill": "local-fire-department",
  "clock.fill": "history",
  "gearshape.fill": "settings",
};

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | ColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color as string} size={size} name={MAPPING[name] || "help"} style={style} />;
}
