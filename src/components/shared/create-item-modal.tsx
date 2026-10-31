import { AppText } from "@/components/core/app-text";
import Button from "@/components/core/button";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export type ModalField = {
  key: string;
  label: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
};

type CreateItemModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: { [key: string]: string }) => void;
  fields: ModalField[];
};

export default function CreateItemModal({
  visible,
  title,
  onClose,
  onSubmit,
  fields,
}: CreateItemModalProps) {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <AppText type="subtitle" style={styles.title}>
                {title}
              </AppText>
              <Ionicons
                name="close"
                size={24}
                color="#9ca3af"
                onPress={onClose}
              />
            </View>

            {fields.map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <AppText style={styles.label}>{field.label}</AppText>
                <TextInput
                  style={styles.input}
                  placeholder={field.label}
                  placeholderTextColor="#6b7280"
                  value={formData[field.key] || ""}
                  onChangeText={(text) => handleChange(field.key, text)}
                  keyboardType={field.keyboardType || "default"}
                  autoCapitalize="sentences"
                />
              </View>
            ))}

            <Button onPress={handleSubmit} style={styles.submitBtn}>
              Submit
            </Button>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    textTransform: "capitalize",
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: "#d1d5db",
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  submitBtn: {
    marginTop: 8,
  },
});
