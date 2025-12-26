import { db } from "../firebase";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

export type WishItem = {
    movieId: number;
    title: string;
    posterPath: string | null;
    addedAt?: unknown;
};

export async function fetchWishIds(uid: string): Promise<number[]> {
    const colRef = collection(db, "users", uid, "myList");
    const snap = await getDocs(colRef);
    return snap.docs
        .map((d) => Number((d.data() as any).movieId ?? d.id))
        .filter((n) => Number.isFinite(n));
}

export async function addWish(uid: string, item: Omit<WishItem, "addedAt">) {
    const ref = doc(db, "users", uid, "myList", String(item.movieId));
    await setDoc(ref, { ...item, addedAt: serverTimestamp() }, { merge: true });
}

export async function removeWish(uid: string, movieId: number) {
    const ref = doc(db, "users", uid, "myList", String(movieId));
    await deleteDoc(ref);
}

export async function fetchWishList(uid: string): Promise<WishItem[]> {
    const colRef = collection(db, "users", uid, "myList");
    const snap = await getDocs(colRef);

    return snap.docs
        .map((d) => {
            const data = d.data() as any;
            return {
                movieId: Number(data.movieId ?? d.id),
                title: String(data.title ?? ""),
                posterPath: (data.posterPath ?? null) as string | null,
                addedAt: data.addedAt,
            } satisfies WishItem;
        })
        .filter((it) => Number.isFinite(it.movieId));
}

/** ✅ RN용 토글: Firestore에서 찜 추가/삭제 */
export async function toggleWishDb(
    uid: string,
    movie: { id: number; title: string; poster_path: string | null },
    wished: boolean
) {
    if (wished) {
        await removeWish(uid, movie.id);
        return false;
    } else {
        await addWish(uid, {
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
        });
        return true;
    }
}
