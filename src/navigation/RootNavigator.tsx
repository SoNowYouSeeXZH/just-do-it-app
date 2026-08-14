// RootNavigator.tsx —— 全局导航结构
//
// 结构说明（两层）：
//   RootStack（堆栈导航）
//   ├── Tabs（底部标签栏）→ 里面有 4 个主页面：首页 / 行业 / 转型 / 游戏
//   └── LearningPath（学习步骤详情）→ 盖在 Tab 上层，点职业时 push 进来
//
// 为什么这样分层：
// 「学习步骤详情」是从多个入口（首页、转型推荐）跳进去的二级页面，
// 放在最外层堆栈里，任何 Tab 都能 navigate 过去，且自带返回按钮。

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, BookOpen, Compass, Gamepad2 } from "lucide-react-native";

import { tokens } from "@/theme/tokens";
import type { RootStackParamList, TabParamList } from "@/navigation/types";

import HomeScreen from "@/screens/HomeScreen";
import IndustryScreen from "@/screens/IndustryScreen";
import CareerMatchScreen from "@/screens/CareerMatchScreen";
import LearningPathScreen from "@/screens/LearningPathScreen";
import GameScreen from "@/screens/GameScreen";
import QuizScreen from "@/screens/QuizScreen";

import QuizResultScreen from "@/screens/QuizResultScreen";
import IndustryDetailScreen from "@/screens/IndustryDetailScreen";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// 底部标签栏
function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // 主页面各自管理自己的头部
        tabBarActiveTintColor: tokens.colors.primary, // 选中态用主色
        tabBarInactiveTintColor: tokens.colors.textDim,
        tabBarStyle: {
          backgroundColor: tokens.colors.surface,
          borderTopColor: tokens.colors.border,
        },
        tabBarLabelStyle: { fontSize: tokens.fontSize.xs, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "学习",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Industry"
        component={IndustryScreen}
        options={{
          title: "行业",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CareerMatch"
        component={CareerMatchScreen}
        options={{
          title: "转型",
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{
          title: "游戏",
          tabBarIcon: ({ color, size }) => (
            <Gamepad2 color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 最外层导航容器
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Tab 容器本身不显示顶部标题栏 */}
        <Stack.Screen
          name="Tabs"
          component={TabsNavigator}
          options={{ headerShown: false }}
        />
        {/* 学习步骤详情页：标题由路由参数动态决定 */}
        <Stack.Screen
          name="LearningPath"
          component={LearningPathScreen}
          options={({ route }) => ({
            title: route.params.title,
            headerTintColor: tokens.colors.text,
            headerStyle: { backgroundColor: tokens.colors.surface },
          })}
        />
        {/* 行业详情页：带原生头部返回，标题固定 */}
        <Stack.Screen
          name="IndustryDetail"
          component={IndustryDetailScreen}
          options={{
            title: "行业详情",
            headerTintColor: tokens.colors.text,
            headerStyle: { backgroundColor: tokens.colors.surface },
          }}
        />
        {/* 答题页：全屏无头部，自带关闭按钮 */}
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ headerShown: false }}
        />
        {/* 结算页：全屏无头部，禁用手势返回（避免滑回半途的答题态） */}
        <Stack.Screen
          name="QuizResult"
          component={QuizResultScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
