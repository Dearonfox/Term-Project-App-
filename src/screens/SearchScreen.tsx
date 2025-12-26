import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Keyboard,
    Pressable,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { tmdb } from "../api/tmdb";
import MovieCard from "../components/MovieCard";
import MovieDetailModal from "../components/MovieDetailModal";
import { useAuthUser } from "../hooks/useAuthUser";
import { fetchWishIds, toggleWishDb } from "../utils/wishlist";

type Movie = { id: number; title: string; poster_path: string | null };
type Resp = { results: Movie[] };

/** ✅ 최근 검색어 AsyncStorage */
const LS_RECENT = "recentSearches";

async function readRecent(): Promise<string[]> {
    try {
        const raw = await AsyncStorage.getItem(LS_RECENT);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch {
        return [];
    }
}

async function writeRecent(list: string[]) {
    await AsyncStorage.setItem(LS_RECENT, JSON.stringify(list));
}

async function pushRecent(term: string, limit = 8): Promise<string[]> {
    const t = term.trim();
    if (!t) return readRecent();
    const prev = await readRecent();
    const next = [t, ...prev.filter((x) => x !== t)].slice(0, limit);
    await writeRecent(next);
    return next;
}

export default function SearchScreen() {
    const [q, setQ] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const { user } = useAuthUser();

    useEffect(() => {
        (async () => {
            if (!user) return;
            setWishIds(await fetchWishIds(user.uid));
            setRecent(await readRecent());
        })();
    }, [user?.uid]);
    const [recent, setRecent] = useState<string[]>([]);
    const [wishIds, setWishIds] = useState<number[]>([]);
    const [detailId, setDetailId] = useState<number | null>(null);

    const canSearch = useMemo(() => q.trim().length >= 1, [q]);

    // 3열 그리드 계산
    const numColumns = 3;
    const gap = 10;
    const sidePadding = 18;
    const cardWidth = useMemo(() => {
        const w = Dimensions.get("window").width;
        const totalGap = gap * (numColumns - 1);
        const usable = w - sidePadding * 2 - totalGap;
        return Math.floor(usable / numColumns);
    }, []);

    const doSearch = async (override?: string) => {
        const term = (override ?? q).trim();
        if (term.length < 1) return;

        try {
            Keyboard.dismiss();
            setLoading(true);
            setError("");
            setSearched(true);

            const res = await tmdb.get<Resp>("/api/tmdb/search/movie", {
                params: { query: term, page: 1 },
            });

            setMovies(res.data.results ?? []);

            // ✅ 최근 검색어 저장/갱신
            const nextRecent = await pushRecent(term, 8);
            setRecent(nextRecent);

            // ✅ 칩 검색 시 입력창도 맞추기
            setQ(term);
        } catch (e: any) {
            setError(e?.message ?? "검색 실패");
        } finally {
            setLoading(false);
        }
    };

    // ✅ 진입 시: 찜 상태 + 최근검색어 로드
    useEffect(() => {
        (async () => {
            setRecent(await readRecent());
            if (!user) return;
            setWishIds(await fetchWishIds(user.uid));
        })();
    }, [user?.uid]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
            <View style={{ paddingHorizontal: sidePadding, paddingTop: 12 }}>
                <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>찾아보기</Text>

                {/* ✅ 최근 검색어 칩 */}
                {recent.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                            <Text style={{ color: "#bbb", fontSize: 12, fontWeight: "800" }}>최근 검색어</Text>

                            <Pressable
                                onPress={async () => {
                                    await AsyncStorage.removeItem(LS_RECENT);
                                    setRecent([]);
                                }}
                                disabled={loading}
                                style={{ marginLeft: "auto", paddingVertical: 6, paddingHorizontal: 10 }}
                            >
                                <Text style={{ color: "salmon", fontSize: 12, fontWeight: "900" }}>전체삭제</Text>
                            </Pressable>
                        </View>

                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {recent.map((term) => (
                                <Pressable
                                    key={term}
                                    onPress={() => doSearch(term)}
                                    disabled={loading}
                                    style={{
                                        paddingVertical: 6,
                                        paddingHorizontal: 10,
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: "#333",
                                        backgroundColor: "#0f0f0f",
                                        opacity: loading ? 0.6 : 1,
                                    }}
                                >
                                    <Text style={{ color: "white", fontSize: 12, fontWeight: "800" }}>{term}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* 검색바 */}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="영화 제목 검색"
                        placeholderTextColor="#888"
                        returnKeyType="search"
                        onSubmitEditing={() => doSearch()}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#333",
                            backgroundColor: "#0f0f0f",
                            color: "white",
                        }}
                    />

                    <Pressable
                        onPress={() => doSearch()}
                        disabled={!canSearch || loading}
                        style={{
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#333",
                            backgroundColor: !canSearch || loading ? "#222" : "#e50914",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "900" }}>검색</Text>
                    </Pressable>
                </View>

                {loading && (
                    <View style={{ marginTop: 12 }}>
                        <ActivityIndicator />
                    </View>
                )}
                {!!error && <Text style={{ color: "salmon", marginTop: 12 }}>Error: {error}</Text>}
                {!loading && !error && searched && movies.length === 0 && (
                    <Text style={{ color: "#bbb", marginTop: 12 }}>검색 결과가 없습니다.</Text>
                )}
            </View>

            {/* 결과 그리드 */}
            <FlatList
                data={movies}
                keyExtractor={(m) => String(m.id)}
                numColumns={numColumns}
                columnWrapperStyle={{ gap }}
                contentContainerStyle={{
                    paddingHorizontal: sidePadding,
                    paddingTop: 14,
                    paddingBottom: 20,
                    gap,
                }}
                renderItem={({ item }) => {
                    const wished = wishIds.includes(item.id);

                    return (
                        <View style={{ width: cardWidth }}>
                            <MovieCard
                                title={item.title}
                                posterPath={item.poster_path}
                                onPress={() => setDetailId(item.id)} // 포스터 탭 = 상세
                                wished={wished}
                                onToggleWish={async () => {
                                    if (!user) return;
                                    const wished = wishIds.includes(item.id);

                                    const nowWished = await toggleWishDb(user.uid, item, wished);

                                    setWishIds((prev) => {
                                        if (nowWished) return [item.id, ...prev];
                                        return prev.filter((id) => id !== item.id);
                                    });
                                }}
                            />
                        </View>
                    );
                }}
            />

            {detailId !== null && (
                <MovieDetailModal movieId={detailId} onClose={() => setDetailId(null)} />
            )}
        </SafeAreaView>
    );
}
