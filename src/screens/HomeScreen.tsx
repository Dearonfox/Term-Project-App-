import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import Banner from "../components/Banner";
import MovieRow from "../components/MovieRow";

export default function HomeScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
                <View style={{ paddingHorizontal: 18 }}>
                    <Banner />
                </View>

                <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
                    <MovieRow title="인기 영화" endpoint="/movie/popular" />
                    <MovieRow title="최신 영화" endpoint="/movie/now_playing" />
                    <MovieRow
                        title="액션 영화"
                        endpoint="/discover/movie"
                        params={{ with_genres: 28, sort_by: "popularity.desc" }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
