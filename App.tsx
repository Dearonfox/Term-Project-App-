import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthUser } from "./src/hooks/useAuthUser";
import { Pressable, Text } from "react-native";
import SigninScreen from "./src/screens/SigninScreen";
import HomeScreen from "./src/screens/HomeScreen";
import PopularScreen from "./src/screens/PopularScreen";
import SearchScreen from "./src/screens/SearchScreen";
import WishlistScreen from "./src/screens/WishlistScreen";
import { signOut } from "firebase/auth";
import { auth } from "./src/firebase";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** ✅ 웹의 Layout(헤더+Outlet) 역할을 TabNavigator로 대체 */
function AuthedTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: "#111" },
                headerTitleStyle: { color: "white" },
                tabBarStyle: { backgroundColor: "#111", borderTopColor: "#222" },
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "#888",

                // ✅ 여기 추가: 헤더 우측 로그아웃 버튼
                headerRight: () => (
                    <Pressable
                        onPress={() => signOut(auth)}
                        style={{ paddingHorizontal: 14, paddingVertical: 6 }}
                    >
                        <Text style={{ color: "salmon", fontWeight: "900" }}>로그아웃</Text>
                    </Pressable>
                ),
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "홈" }} />
            <Tab.Screen name="Popular" component={PopularScreen} options={{ title: "인기" }} />
            <Tab.Screen name="Search" component={SearchScreen} options={{ title: "검색" }} />
            <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: "찜" }} />
        </Tab.Navigator>
    );
}
export default function App() {
    const { user, loading } = useAuthUser();
    const isLogin = !!user;

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* ✅ 로그인 페이지는 가드 밖 */}
                {!isLogin ? (
                    <Stack.Screen name="Signin" component={SigninScreen} />
                ) : (
                    /* ✅ 나머지는 가드 안 (웹의 ProtectedRoute) */
                    <Stack.Screen name="Main" component={AuthedTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

