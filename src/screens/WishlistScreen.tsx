import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    SafeAreaView,
    Text,
    View,
} from "react-native";
import { useAuthUser } from "../hooks/useAuthUser";
import { fetchWishList, removeWish, WishItem } from "../utils/wishlist";

export default function WishlistScreen() {
    const { user, loading } = useAuthUser();

    const [items, setItems] = useState<WishItem[]>([]);
    const [busy, setBusy] = useState(false);

    const numColumns = 3;
    const gap = 10;
    const sidePadding = 18;
    const cardWidth = useMemo(() => {
        const w = Dimensions.get("window").width;
        const totalGap = gap * (numColumns - 1);
        const usable = w - sidePadding * 2 - totalGap;
        return Math.floor(usable / numColumns);
    }, []);

    const load = async () => {
        if (!user) return;
        const list = await fetchWishList(user.uid);
        setItems(list);
    };

    useEffect(() => {
        if (!loading && user) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user?.uid]);

    const onRemove = async (movieId: number) => {
        if (!user) return;
        setBusy(true);
        try {
            await removeWish(user.uid, movieId);
            await load();
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#111", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#111", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "white" }}>로그인이 필요합니다.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
            <View style={{ paddingHorizontal: sidePadding, paddingTop: 12, paddingBottom: 8 }}>
                <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>내가 찜한 리스트</Text>
            </View>

            {items.length === 0 ? (
                <View style={{ paddingHorizontal: sidePadding, paddingTop: 10 }}>
                    <Text style={{ color: "#aaa" }}>아직 찜한 콘텐츠가 없어요.</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(it) => String(it.movieId)}
                    numColumns={numColumns}
                    columnWrapperStyle={{ gap }}
                    contentContainerStyle={{
                        paddingHorizontal: sidePadding,
                        paddingBottom: 20,
                        paddingTop: 10,
                        gap,
                    }}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                width: cardWidth,
                                borderWidth: 1,
                                borderColor: "#222",
                                borderRadius: 12,
                                overflow: "hidden",
                                backgroundColor: "#151515",
                            }}
                        >
                            {/* 포스터 영역 (2:3 비율 느낌) */}
                            <View style={{ width: "100%", height: Math.floor((cardWidth * 3) / 2), backgroundColor: "#222" }}>
                                {item.posterPath ? (
                                    <Image
                                        source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }}
                                        style={{ width: "100%", height: "100%" }}
                                        resizeMode="cover"
                                    />
                                ) : null}
                            </View>

                            <View style={{ padding: 10 }}>
                                <Text
                                    style={{ color: "white", fontWeight: "800", fontSize: 13, marginBottom: 8, lineHeight: 18 }}
                                    numberOfLines={2}
                                >
                                    {item.title}
                                </Text>

                                <Pressable
                                    disabled={busy}
                                    onPress={() => onRemove(item.movieId)}
                                    style={{
                                        width: "100%",
                                        paddingVertical: 8,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: "#333",
                                        backgroundColor: "transparent",
                                        alignItems: "center",
                                        opacity: busy ? 0.6 : 1,
                                    }}
                                >
                                    <Text style={{ color: "salmon", fontWeight: "900" }}>찜 해제</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
