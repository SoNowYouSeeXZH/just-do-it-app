import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';

interface ChineseKeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  currentLength: number;
}

/**
 * 中文输入键盘
 * 通过隐藏 TextInput 调起系统中文输入法，同时提供视觉键盘界面
 */
export const ChineseKeyboard = React.memo(({
  onInput,
  onDelete,
  onSubmit,
  currentLength,
}: ChineseKeyboardProps) => {
  const inputRef = useRef<TextInput>(null);
  const pendingRef = useRef('');

  const handleChangeText = (text: string) => {
    const prev = pendingRef.current;
    if (text.length > prev.length) {
      // 新增字符
      const added = text.slice(prev.length);
      const chinese = added.match(/[\u4e00-\u9fa5]/g);
      if (chinese) {
        chinese.forEach((ch) => onInput(ch));
      }
    } else {
      // 删除字符
      onDelete();
    }
    pendingRef.current = text;
    // 保持输入框清空，避免积累
    if (inputRef.current) {
      inputRef.current.setNativeProps({ text: '' });
      pendingRef.current = '';
    }
  };

  return (
    <View style={styles.container}>
      {/* 隐藏的原生输入框，用于触发系统输入法 */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        onChangeText={handleChangeText}
        autoCorrect={false}
        autoComplete="off"
        keyboardType="default"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        multiline={false}
        blurOnSubmit={false}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.inputBtn}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={0.7}
        >
          <Text style={styles.inputBtnText}>
            {currentLength < 4 ? `点击输入汉字 (${currentLength}/4)` : '4字已输入'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
          <Text style={styles.actionText}>⌫ 删除</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, currentLength === 4 ? styles.submitActive : styles.submitInactive]}
          onPress={onSubmit}
          disabled={currentLength < 4}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>提交</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  buttonRow: {
    marginBottom: 12,
  },
  inputBtn: {
    backgroundColor: '#818384',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  inputBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#818384',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 1,
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
