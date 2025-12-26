import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { tmdb } from "../api/tmdb";

type Genre = { id: number; name: string };

type MovieDetail = {
    id: number;
    title: string;
    overview: string;
    tagline: string | null;
    release_date: string | null;
    runtime: number | null;
    genres: Genre[];
    vote_average: number;
    vote_count: number;
    poster_path: string | null;
    backdrop_path: string | null;
};

type Credits = {
    cast: { id: number; name: string; character: string }[];
};

function posterUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w342${path}` : "";
}
function backdropUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w1280${path}` : "";
}

export default function MovieDetailModal({
                                             movieId,
                                             onClose,
                                         }: {
    movieId: number;
    onClose: () => void;
}) {
    const [data, setData] = useState<MovieDetail | null>(null);
    const [cast, setCast] = useState<Credits["cast"]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const [detailRes, creditRes] = await Promise.all([
                    tmdb.get<MovieDetail>(`/api/tmdb/movie/${movieId}`),
                    tmdb.get<Credits>(`/api/tmdb/movie/${movieId}/credits`),
                ]);

                if (!alive) return;
                setData(detailRes.data);
                setCast((creditRes.data.cast ?? []).slice(0, 6));
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "상세 정보 불러오기 실패");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [movieId]);

    const bg = backdropUrl(data?.backdrop_path ?? null);
    const poster = posterUrl(data?.poster_path ?? null);

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose} // Android back 버튼 닫기
        >
            {/* 바깥(어두운) 영역 클릭 시 닫기 */}
            <Pressable style={styles.backdrop} onPress={onClose}>
                {/* 카드 영역 클릭은 닫히면 안 되므로 stopPropagation */}
                <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
                    {/* 헤더(백드롭) */}
                    <ImageBackground
                        source={bg ? { uri: bg } : undefined}
                        style={styles.header}
                        imageStyle={{ opacity: bg ? 1 : 0 }}
                    >
                        <View style={styles.headerOverlay} />

                        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                            <Text style={styles.closeText}>×</Text>
                        </Pressable>
                    </ImageBackground>

                    <ScrollView contentContainerStyle={{ padding: 14 }}>
                        {loading && <ActivityIndicator />}
                        {!!error && <Text style={{ color: "salmon" }}>Error: {error}</Text>}

                        {!loading && !error && data && (
                            <View style={{ flexDirection: "row", gap: 12 }}>
                                {/* 포스터 */}
                                <View style={{ width: 120 }}>
                                    {poster ? (
                                        <Image
                                            source={{ uri: poster }}
                                            style={{ width: 120, height: 180, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={{ width: 120, height: 180, backgroundColor: "#333", borderRadius: 10 }} />
                                    )}
                                </View>

                                {/* 텍스트 정보 */}
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={styles.title} numberOfLines={2}>
                                        {data.title}
                                    </Text>

                                    {!!data.tagline && (
                                        <Text style={styles.tagline} numberOfLines={2}>
                                            {data.tagline}
                                        </Text>
                                    )}

                                    <Text style={styles.meta}>
                                        <Text style={styles.metaBold}>개봉</Text>: {data.release_date ?? "-"}  •{" "}
                                        <Text style={styles.metaBold}>러닝타임</Text>:{" "}
                                        {data.runtime ? `${data.runtime}분` : "-"}
                                    </Text>

                                    <Text style={styles.meta}>
                                        <Text style={styles.metaBold}>장르</Text>:{" "}
                                        {data.genres?.length ? data.genres.map((g) => g.name).join(", ") : "-"}
                                    </Text>

                                    <Text style={styles.meta}>
                                        <Text style={styles.metaBold}>평점</Text>:{" "}
                                        {data.vote_average?.toFixed(1)} ({data.vote_count}명)
                                    </Text>
                                </View>
                            </View>
                        )}

                        {!loading && !error && data && (
                            <>
                                <Text style={styles.overview}>
                                    {data.overview ? data.overview : "줄거리 정보가 없습니다."}
                                </Text>

                                {cast.length > 0 && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={styles.sectionTitle}>주요 출연진</Text>
                                        {cast.map((c) => (
                                            <Text key={c.id} style={styles.castLine}>
                                                {c.name} <Text style={{ color: "#888" }}>({c.character})</Text>
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.72)",
        justifyContent: "center",
        padding: 16,
    },
    card: {
        backgroundColor: "#151515",
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2a2a2a",
        maxHeight: "85%",
    },
    header: {
        height: 220,
        backgroundColor: "#222",
        justifyContent: "flex-start",
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    closeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#333",
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    closeText: { color: "white", fontSize: 22, fontWeight: "900", marginTop: -2 },

    title: { color: "white", fontSize: 20, fontWeight: "900" },
    tagline: { color: "#cfcfcf", marginTop: 6, fontStyle: "italic" },
    meta: { color: "#bbb", marginTop: 8, fontSize: 12, lineHeight: 18 },
    metaBold: { color: "#ddd", fontWeight: "900" },
    overview: { marginTop: 12, color: "#e5e5e5", lineHeight: 20 },
    sectionTitle: { color: "white", fontWeight: "900", marginBottom: 6 },
    castLine: { color: "#cfcfcf", lineHeight: 18, fontSize: 13 },
});
