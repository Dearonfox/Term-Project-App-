import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    Pressable,
    Text,
    View,
    StyleSheet,
} from "react-native";
import { tmdb } from "../api/tmdb";
import MovieDetailModal from "./MovieDetailModal";

type Movie = {
    id: number;
    title: string;
    overview: string;
    backdrop_path: string | null;
};

type Resp = { results: Movie[] };

function backdropUrl(path: string | null) {
    return path ? `https://image.tmdb.org/t/p/w1280${path}` : "";
}

export default function Banner() {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [error, setError] = useState("");

    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setError("");

                const res = await tmdb.get<Resp>("/api/tmdb/movie/popular", {
                    params: { page: 1 },
                });

                const list = res.data.results ?? [];
                const picked = list.length ? list[Math.floor(Math.random() * list.length)] : null;

                if (alive) setMovie(picked);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "배너 로드 실패");
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const bg = backdropUrl(movie?.backdrop_path ?? null);

    return (
        <View>
            <ImageBackground
                source={bg ? { uri: bg } : undefined}
                style={styles.banner}
                imageStyle={styles.bannerImg}
            >
                {/* overlay */}
                <View style={styles.overlay} />

                <View style={styles.content}>
                    {error ? (
                        <Text style={{ color: "salmon" }}>Error: {error}</Text>
                    ) : !movie ? (
                        <ActivityIndicator />
                    ) : (
                        <>
                            <Text style={styles.title} numberOfLines={2}>
                                {movie.title}
                            </Text>

                            <Text style={styles.overview} numberOfLines={4}>
                                {movie.overview || "줄거리 정보가 없습니다."}
                            </Text>

                            <View style={styles.btnRow}>
                                <Pressable style={styles.btnGhost} onPress={() => {}}>
                                    <Text style={styles.btnTextDark}>▶ 재생</Text>
                                </Pressable>

                                <Pressable
                                    style={styles.btnDark}
                                    onPress={() => {
                                        if (movie?.id) setDetailOpen(true);
                                    }}
                                >
                                    <Text style={styles.btnTextLight}>ⓘ 상세 정보</Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </ImageBackground>

            {/* 상세 모달 */}
            {detailOpen && movie?.id && (
                <MovieDetailModal movieId={movie.id} onClose={() => setDetailOpen(false)} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        height: 360,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#111",
        justifyContent: "flex-end",
    },
    bannerImg: {
        borderRadius: 14,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",
        // web의 linear-gradient 대체: 검정 반투명 레이어 + 아래쪽 더 진하게 느낌
        // (더 예쁘게 하려면 expo-linear-gradient 사용 가능)
        opacity: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 18,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    title: {
        color: "white",
        fontSize: 30,
        fontWeight: "900",
        letterSpacing: -0.5,
    },
    overview: {
        marginTop: 10,
        color: "#e5e5e5",
        lineHeight: 20,
    },
    btnRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    btnGhost: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.85)",
    },
    btnDark: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "rgba(0,0,0,0.55)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    btnTextDark: { fontWeight: "900", color: "#111" },
    btnTextLight: { fontWeight: "900", color: "white" },
});
