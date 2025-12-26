import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase";

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { user, loading };
}
