import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    Text,
    View,
    Dimensions,
} from "react-native";
import { tmdb } from "../api/tmdb";
import MovieCard from "../components/MovieCard";
import MovieDetailModal from "../components/MovieDetailModal";

type Movie = { id: number; title: string; poster_path: string | null };
type Resp = { results: Movie[]; page: number; total_pages: number };

export default function PopularScreen() {
    const [items, setItems] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false); // 첫 로드/추가 로드
    const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
    const [error, setError] = useState("");

    const [detailId, setDetailId] = useState<number | null>(null);

    const canLoadMore = useMemo(() => page < totalPages && !loading, [page, totalPages, loading]);

    // 3열 그리드 간격 맞추기
    const numColumns = 3;
    const gap = 10;
    const sidePadding = 18;
    const cardWidth = useMemo(() => {
        const w = Dimensions.get("window").width;
        const totalGap = gap * (numColumns - 1);
        const usable = w - sidePadding * 2 - totalGap;
        return Math.floor(usable / numColumns);
    }, []);

    const fetchPage = async (nextPage: number, mode: "replace" | "append") => {
        try {
            setError("");
            setLoading(true);

            const res = await tmdb.get<Resp>("/api/tmdb/movie/popular", {
                params: { page: nextPage },
            });

            const list = res.data.results ?? [];
            setTotalPages(res.data.total_pages ?? 1);

            if (mode === "replace") {
                setItems(list);
            } else {
                // 중복 방지
                setItems((prev) => {
                    const seen = new Set(prev.map((m) => m.id));
                    const merged = [...prev];
                    for (const m of list) if (!seen.has(m.id)) merged.push(m);
                    return merged;
                });
            }

            setPage(nextPage);
        } catch (e: any) {
            setError(e?.message ?? "인기 영화 로드 실패");
        } finally {
            setLoading(false);
        }
    };

    // 최초 로드
    useEffect(() => {
        fetchPage(1, "replace");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchPage(1, "replace");
        } finally {
            setRefreshing(false);
        }
    };

    const loadMore = () => {
        if (!canLoadMore) return;
        fetchPage(page + 1, "append");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
            <View style={{ paddingHorizontal: sidePadding, paddingTop: 12, paddingBottom: 8 }}>
                <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>인기 영화</Text>
                {!!error && <Text style={{ color: "salmon", marginTop: 6 }}>Error: {error}</Text>}
            </View>

            <FlatList
                data={items}
                keyExtractor={(m) => String(m.id)}
                numColumns={numColumns}
                columnWrapperStyle={{ gap }}
                contentContainerStyle={{ paddingHorizontal: sidePadding, paddingBottom: 20, gap }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReachedThreshold={0.6}
                onEndReached={loadMore}
                renderItem={({ item }) => (
                    <View style={{ width: cardWidth }}>
                        <MovieCard
                            title={item.title}
                            posterPath={item.poster_path}
                            onPress={() => setDetailId(item.id)}
                        />
                    </View>
                )}
                ListFooterComponent={
                    <View style={{ paddingVertical: 14, alignItems: "center" }}>
                        {loading ? (
                            <ActivityIndicator />
                        ) : canLoadMore ? (
                            <Pressable
                                onPress={loadMore}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: "#2a2a2a",
                                    backgroundColor: "#0f0f0f",
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "900" }}>더 불러오기</Text>
                            </Pressable>
                        ) : (
                            <Text style={{ color: "#888" }}>마지막 페이지</Text>
                        )}
                    </View>
                }
            />

            {detailId !== null && (
                <MovieDetailModal movieId={detailId} onClose={() => setDetailId(null)} />
            )}
        </SafeAreaView>
    );
}
