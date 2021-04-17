import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Profile from "../components/Profile";
import initFirebase from "../services/firebase.js";
import Signout from "../components/Signout";

initFirebase();
const auth = firebase.auth();
const db = firebase.firestore();

function StartRoom({ uid }) {
    const router = useRouter();
    // console.log(uid);
    return (
        <>
            <button onClick={() => router.push("/rooms/" + uid)}>
                Match a tutor
            </button>
        </>
    );
}

function Home() {
    const router = useRouter();
    const [user, loading, error] = useAuthState(auth);
    if (loading) {
        return <>Fetching data...</>;
    }
    if (error != undefined || user == undefined) {
        router.push("/login");
        return <div>Unauthorized, back to login!</div>;
    } else {
        return (
            <>
                <Profile uid={user.uid} />
                <StartRoom uid={user.uid} />
                <Signout />
            </>
        );
    }
}

export default Home;
