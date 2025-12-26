import React from "react";
import { Image, Pressable, Text, View } from "react-native";

type Props = {
    title: string;
    posterPath: string | null;

    // 포스터 탭: 상세 열기
    onPress?: () => void;

    // ★ 찜 토글(선택)
    wished?: boolean;
    onToggleWish?: () => void;
};

export default function MovieCard({ title, posterPath, onPress, wished, onToggleWish }: Props) {
    const img = posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : "";

    return (
        <Pressable onPress={onPress} style={{ width: "100%" }}>
            {/* ★ 버튼(있을 때만) */}
            {onToggleWish && (
                <Pressable
                    onPress={(e) => {
                        e.stopPropagation();
                        onToggleWish();
                    }}
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        paddingHorizontal: 6,
                        paddingVertical: 4,
                    }}
                    hitSlop={10}
                >
                    <Text style={{ fontSize: 18, color: wished ? "gold" : "#aaa" }}>★</Text>
                </Pressable>
            )}

            {img ? (
                <Image
                    source={{ uri: img }}
                    style={{ width: "100%", height: 210, borderRadius: 10 }}
                    resizeMode="cover"
                />
            ) : (
                <View style={{ height: 210, backgroundColor: "#333", borderRadius: 10 }} />
            )}

            <Text
                numberOfLines={1}
                style={{ color: "white", marginTop: 6, fontSize: 13, fontWeight: "700" }}
            >
                {title}
            </Text>
        </Pressable>
    );
}

