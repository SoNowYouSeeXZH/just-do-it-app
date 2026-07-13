import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';

interface ChineseKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChineseKeyboard = React.memo(({
  value,
  onChange,
  onSubmit,
}: ChineseKeyboardProps) => {
  const handleChangeText = useCallback((text: string) => {
    const normalized = (text.match(/[\u4e00-\u9fa5]/g) || []).join('').slice(0, 4);
    onChange(normalized);
  }, [onChange]);

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        style={styles.input}
        placeholder="输入四字成语"
        placeholderTextColor="#818384"
        autoCorrect={false}
        autoComplete="off"
        keyboardType="default"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        maxLength={8}
        multiline={false}
      />

      <TouchableOpacity
        style={[styles.submitBtn, value.length === 4 ? styles.submitActive : styles.submitInactive]}
        onPress={onSubmit}
        disabled={value.length < 4}
        activeOpacity={0.7}
      >
        <Text style={styles.actionText}>提交 ({value.length}/4)</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    gap: 12,
  },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3a3a3c',
    backgroundColor: '#1a1a1b',
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
    paddingHorizontal: 16,
  },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitActive: {
    backgroundColor: '#538d4e',
  },
  submitInactive: {
    backgroundColor: '#3a3a3c',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
