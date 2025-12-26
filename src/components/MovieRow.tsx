import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { tmdb } from "../api/tmdb";
import MovieCard from "./MovieCard";
import MovieDetailModal from "./MovieDetailModal";

type Movie = { id: number; title: string; poster_path: string | null };
type Resp = { results: Movie[] };

type Props = {
    title: string;
    endpoint: string;
    params?: Record<string, any>;
};

export default function MovieRow({ title, endpoint, params = {} }: Props) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [detailId, setDetailId] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const res = await tmdb.get<Resp>(`/api/tmdb${endpoint}`, {
                    params: { ...params, page: 1 },
                });

                if (alive) setMovies(res.data.results ?? []);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "목록 로드 실패");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [endpoint, JSON.stringify(params)]);

    return (
        <View style={{ marginTop: 18 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "900", marginBottom: 10 }}>
                {title}
            </Text>

            {loading && <ActivityIndicator />}
            {!!error && <Text style={{ color: "salmon", marginBottom: 6 }}>Error: {error}</Text>}

            <FlatList
                data={movies}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                    <MovieCard
                        title={item.title}
                        posterPath={item.poster_path}
                        onPress={() => setDetailId(item.id)}
                    />
                )}
            />

            {detailId !== null && (
                <MovieDetailModal movieId={detailId} onClose={() => setDetailId(null)} />
            )}
        </View>
    );
}
