// IndustryScreen.tsx —— 行业知识库（Phase 2）
//
// 展示可转行进入的几个主流行业方向，每个是一张彩色卡片。
// 点击进入行业详情页（IndustryDetail），查看知识点与外部学习资料。

import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';

import { tokens } from '@/theme/tokens';
import { fetchIndustries } from '@/services/content';
import type { Industry } from '@/content/types';
import type { RootStackParamList } from '@/navigation/types';

export default function IndustryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [industries, setIndustries] = useState<Industry[] | null>(null);

  useEffect(() => {
    fetchIndustries().then(setIndustries);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>行业知识库</Text>
        <Text style={styles.subtitle}>了解各方向的岗位认知与学习资料</Text>
      </View>

      {industries === null ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={industries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('IndustryDetail', { industryId: item.id })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.accent }]}>
                <Text style={styles.icon}>{item.emoji}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardTag}>{item.summary}</Text>
              </View>
              <ChevronRight color={tokens.colors.textDim} size={22} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  title: { fontSize: tokens.fontSize.xl, fontWeight: '800', color: tokens.colors.text },
  subtitle: {
    marginTop: tokens.spacing.xs,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: tokens.spacing.lg, gap: tokens.spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderBottomWidth: 4,
    padding: tokens.spacing.lg,
  },
  cardPressed: { opacity: 0.9 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: tokens.fontSize.md, fontWeight: '800', color: tokens.colors.text },
  cardTag: { marginTop: 2, fontSize: tokens.fontSize.sm, color: tokens.colors.textMuted },
});
