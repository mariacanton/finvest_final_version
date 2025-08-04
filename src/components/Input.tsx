import React from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TextInput as RNTextInput,
} from "react-native";

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<RNTextInput>;
}

const Input = ({
  icon,
  containerStyle,
  inputStyle,
  inputRef,
  ...rest
}: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon}
      <TextInput
        ref={inputRef}
        style={[styles.input, inputStyle]}
        placeholderTextColor="#999999"
        {...rest}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
  },
});
