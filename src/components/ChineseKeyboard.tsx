import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { guofeng } from '../theme/guofeng';

interface ChineseKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

// 非受控输入：不给 TextInput 传 value/onChangeText 驱动的受控回填。
// 原因：中文输入法在拼字过程中有中间态（拼音候选串），如果每个 keystroke 都用
// 正则过滤后的 value 强制回写 TextInput，会和输入法的内部合成状态打架，
// 表现为“第二次输入直接卡死、输入法闪烁但输入框没反应”。
// 改用 ref 命令式读取/清空，输入法自己管理组字过程，我们只在提交/清空时同步。
export const ChineseKeyboard = React.memo(({
  value,
  onChange,
  onSubmit,
}: ChineseKeyboardProps) => {
  const inputRef = useRef<TextInput>(null);
  const [length, setLength] = useState(value.length);

  // value 被外部清空（提交成功/切换新的一天）时，同步清空原生输入框。
  useEffect(() => {
    if (value === '') {
      inputRef.current?.clear();
      setLength(0);
    }
  }, [value]);

  const handleChangeText = useCallback((text: string) => {
    const normalized = (text.match(/[\u4e00-\u9fa5]/g) || []).join('').slice(0, 4);
    setLength(normalized.length);
    onChange(normalized);
  }, [onChange]);

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.label}>落笔成语</Text>
        <TextInput
          ref={inputRef}
          defaultValue={value}
          onChangeText={handleChangeText}
          style={styles.input}
          placeholder="输入四字成语"
          placeholderTextColor={guofeng.colors.textDim}
          autoCorrect={false}
          autoComplete="off"
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          maxLength={8}
          multiline={false}
        />

        <TouchableOpacity
          style={[styles.submitBtn, length === 4 ? styles.submitActive : styles.submitInactive]}
          onPress={onSubmit}
          disabled={length < 4}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, length === 4 ? styles.actionActive : styles.actionInactive]}>
            提交答案  {length}/4
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: guofeng.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  panel: {
    borderRadius: guofeng.radius.xl,
    borderWidth: 1,
    borderColor: guofeng.colors.borderSoft,
    backgroundColor: 'rgba(27, 20, 13, 0.94)',
    padding: guofeng.spacing.md,
    shadowColor: guofeng.shadow.color,
    shadowOpacity: guofeng.shadow.opacity,
    shadowRadius: guofeng.shadow.radius,
    shadowOffset: guofeng.shadow.offset,
    elevation: guofeng.shadow.elevation,
  },
  label: {
    color: guofeng.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: guofeng.spacing.sm,
  },
  input: {
    height: 54,
    borderRadius: guofeng.radius.md,
    borderWidth: 1.5,
    borderColor: guofeng.colors.border,
    backgroundColor: guofeng.colors.ink,
    color: guofeng.colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 5,
    paddingHorizontal: 16,
    marginBottom: guofeng.spacing.md,
  },
  submitBtn: {
    borderRadius: guofeng.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitActive: {
    backgroundColor: guofeng.colors.gold,
  },
  submitInactive: {
    backgroundColor: guofeng.colors.absent,
    borderWidth: 1,
    borderColor: guofeng.colors.absentBorder,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '900',
  },
  actionActive: {
    color: guofeng.colors.ink,
  },
  actionInactive: {
    color: guofeng.colors.textDim,
  },
});
