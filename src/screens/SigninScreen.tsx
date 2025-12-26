import React, { useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

// 웹에서 쓰던 키 유지하고 싶으면 동일 이름으로 가져가면 됨
export const STORAGE_KEYS = {
    KEEP_LOGIN: "KEEP_LOGIN",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SigninScreen({ navigation }: any) {
    const [mode, setMode] = useState<"signin" | "signup">("signin");

    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");

    const [remember, setRemember] = useState(true);
    const [agree, setAgree] = useState(false);

    const [busy, setBusy] = useState(false);

    const isSignin = useMemo(() => mode === "signin", [mode]);

    const signup = async () => {
        if (!id.trim() || !pw.trim() || !pw2.trim()) return Alert.alert("안내", "모두 입력하세요.");
        if (!emailRegex.test(id)) return Alert.alert("안내", "이메일 형식으로 입력하세요.");
        if (pw !== pw2) return Alert.alert("안내", "비밀번호 확인이 일치하지 않습니다.");
        if (!agree) return Alert.alert("안내", "약관에 동의해야 합니다.");

        try {
            setBusy(true);

            // ✅ RN에서는 setPersistence(browserLocalPersistence...) 사용 X
            await createUserWithEmailAndPassword(auth, id.trim(), pw);

            await AsyncStorage.setItem(STORAGE_KEYS.KEEP_LOGIN, remember ? "1" : "0");

            Alert.alert("완료", "회원가입 완료! 로그인되었습니다.");
            navigation.replace("Home");
        } catch (e: any) {
            const code = e?.code ?? "";
            if (code.includes("auth/email-already-in-use")) return Alert.alert("오류", "이미 가입된 이메일입니다.");
            if (code.includes("auth/weak-password")) return Alert.alert("오류", "비밀번호가 너무 약합니다(6자 이상).");
            if (code.includes("auth/invalid-email")) return Alert.alert("오류", "이메일 형식이 올바르지 않습니다.");
            return Alert.alert("오류", e?.message ?? "회원가입 실패");
        } finally {
            setBusy(false);
        }
    };

    const signin = async () => {
        if (!id.trim() || !pw.trim()) return Alert.alert("안내", "아이디/비밀번호를 입력하세요.");
        if (!emailRegex.test(id)) return Alert.alert("안내", "이메일 형식으로 입력하세요.");

        try {
            setBusy(true);

            await signInWithEmailAndPassword(auth, id.trim(), pw);

            await AsyncStorage.setItem(STORAGE_KEYS.KEEP_LOGIN, remember ? "1" : "0");

            navigation.replace("Home");
        } catch (e: any) {
            const code = e?.code ?? "";
            if (code.includes("auth/invalid-credential")) return Alert.alert("오류", "이메일 또는 비밀번호가 틀렸습니다.");
            if (code.includes("auth/user-not-found")) return Alert.alert("오류", "가입된 계정이 없습니다.");
            if (code.includes("auth/wrong-password")) return Alert.alert("오류", "비밀번호가 틀렸습니다.");
            if (code.includes("auth/invalid-email")) return Alert.alert("오류", "이메일 형식이 올바르지 않습니다.");
            return Alert.alert("오류", e?.message ?? "인증 중 오류가 발생했습니다.");
        } finally {
            setBusy(false);
        }
    };

    const resetPw = async () => {
        if (!id.trim()) return Alert.alert("안내", "비밀번호를 찾을 이메일을 먼저 입력하세요.");
        if (!emailRegex.test(id)) return Alert.alert("안내", "이메일 형식으로 입력하세요.");

        try {
            setBusy(true);
            await sendPasswordResetEmail(auth, id.trim());
            Alert.alert("완료", "비밀번호 재설정 메일을 보냈습니다.");
        } catch (e: any) {
            return Alert.alert("오류", e?.message ?? "메일 전송 실패");
        } finally {
            setBusy(false);
        }
    };

    return (
        <SafeAreaView style={styles.bg}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        <Text style={styles.title}>{isSignin ? "Login Form" : "Signup Form"}</Text>

                        {/* 탭 */}
                        <View style={styles.tabs}>
                            <Pressable
                                onPress={() => setMode("signin")}
                                disabled={busy}
                                style={[styles.tab, isSignin && styles.tabActive]}
                            >
                                <Text style={[styles.tabText, isSignin && styles.tabTextActive]}>Login</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setMode("signup")}
                                disabled={busy}
                                style={[styles.tab, !isSignin && styles.tabActive]}
                            >
                                <Text style={[styles.tabText, !isSignin && styles.tabTextActive]}>Signup</Text>
                            </Pressable>
                        </View>

                        {/* 입력 폼 */}
                        <View style={{ marginTop: 14 }}>
                            <View style={styles.field}>
                                <TextInput
                                    placeholder="Email Address"
                                    placeholderTextColor="#8b8b8b"
                                    value={id}
                                    onChangeText={setId}
                                    editable={!busy}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    style={styles.input}
                                />
                            </View>

                            <View style={styles.field}>
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#8b8b8b"
                                    value={pw}
                                    onChangeText={setPw}
                                    editable={!busy}
                                    secureTextEntry
                                    style={styles.input}
                                />
                            </View>

                            {!isSignin && (
                                <View style={styles.field}>
                                    <TextInput
                                        placeholder="Confirm password"
                                        placeholderTextColor="#8b8b8b"
                                        value={pw2}
                                        onChangeText={setPw2}
                                        editable={!busy}
                                        secureTextEntry
                                        style={styles.input}
                                    />
                                </View>
                            )}

                            {/* Remember / Forgot / Agree */}
                            {isSignin ? (
                                <View style={styles.row}>
                                    <Pressable
                                        onPress={() => setRemember((v) => !v)}
                                        disabled={busy}
                                        style={styles.checkRow}
                                    >
                                        <View style={[styles.checkbox, remember && styles.checkboxOn]} />
                                        <Text style={styles.checkText}>Remember me</Text>
                                    </Pressable>

                                    <Pressable onPress={resetPw} disabled={busy}>
                                        <Text style={styles.link}>Forgot password?</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={() => setAgree((v) => !v)}
                                    disabled={busy}
                                    style={[styles.checkRow, { marginTop: 6 }]}
                                >
                                    <View style={[styles.checkbox, agree && styles.checkboxOn]} />
                                    <Text style={styles.checkText}>I agree to Terms & Conditions</Text>
                                </Pressable>
                            )}

                            {/* Submit */}
                            <Pressable
                                onPress={isSignin ? signin : signup}
                                disabled={busy}
                                style={[styles.submit, busy && { opacity: 0.7 }]}
                            >
                                <Text style={styles.submitText}>{busy ? "Loading..." : isSignin ? "Login" : "Signup"}</Text>
                            </Pressable>

                            {/* Bottom */}
                            <View style={styles.bottom}>
                                <Text style={{ color: "#cfcfcf" }}>
                                    {isSignin ? "Not a member? " : "Already have an account? "}
                                </Text>

                                <Pressable
                                    onPress={() => setMode(isSignin ? "signup" : "signin")}
                                    disabled={busy}
                                >
                                    <Text style={styles.link}>{isSignin ? "Signup now" : "Login"}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* 바닥 패널 느낌 */}
                    <View style={styles.floor} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: "#0b0b0b" },
    wrapper: { padding: 18, alignItems: "center" },

    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#151515",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#262626",
    },

    title: { color: "white", fontSize: 22, fontWeight: "900" },

    tabs: {
        marginTop: 12,
        flexDirection: "row",
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2a2a2a",
        backgroundColor: "#0f0f0f",
        alignItems: "center",
    },
    tabActive: { backgroundColor: "#e50914", borderColor: "#e50914" },
    tabText: { color: "#cfcfcf", fontWeight: "800" },
    tabTextActive: { color: "white" },

    field: { marginTop: 10 },
    input: {
        backgroundColor: "#0f0f0f",
        borderWidth: 1,
        borderColor: "#2a2a2a",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: "white",
    },

    row: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#444",
        backgroundColor: "transparent",
    },
    checkboxOn: { backgroundColor: "#e50914", borderColor: "#e50914" },
    checkText: { color: "#cfcfcf", fontWeight: "700" },

    link: { color: "#86b7ff", fontWeight: "800" },

    submit: {
        marginTop: 14,
        backgroundColor: "#e50914",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    submitText: { color: "white", fontWeight: "900", fontSize: 16 },

    bottom: { marginTop: 12, flexDirection: "row", justifyContent: "center", alignItems: "center" },

    floor: {
        width: "100%",
        maxWidth: 420,
        height: 18,
        marginTop: 14,
        borderRadius: 999,
        backgroundColor: "#121212",
        borderWidth: 1,
        borderColor: "#262626",
    },
});
