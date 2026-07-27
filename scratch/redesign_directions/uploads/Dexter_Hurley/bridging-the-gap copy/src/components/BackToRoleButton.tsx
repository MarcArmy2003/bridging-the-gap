import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "../navigation/compatTypes";
import { useAppContext } from "../store/AppContext";

export default function BackToRoleButton() {
  const navigation = useNavigation();
  const { setCurrentUser } = useAppContext();

  const handlePress = () => {
    // Clear current user and navigate to role select
    setCurrentUser(null);
    if ((navigation as any).navigate) {
      (navigation as any).navigate("RoleSelect");
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Text style={styles.text}>Change role</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 12, paddingVertical: 6 },
  text: { color: "#4a6cf7", fontWeight: "600" },
});
