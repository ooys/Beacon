import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import initFirebase from "../services/firebase.js";
import { useRouter } from "next/router";

initFirebase();
const auth = firebase.auth();

function SignOut() {
    const router = useRouter();
    return (
        auth.currentUser && (
            <button
                className="sign-out"
                onClick={() => {
                    auth.signOut(), router.push("/login");
                }}>
                Sign Out
            </button>
        )
    );
}

export default SignOut;
