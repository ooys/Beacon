import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useRouter } from "next/router";
import React, { useState } from "react";
import initFirebase from "../services/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";

initFirebase();
const auth = firebase.auth();
const db = firebase.firestore();

// function startReq(key) {
//     console.log("loading");
//     gapi.client
//         .init({
//             apiKey: key,
//             // Your API key will be automatically added to the Discovery Document URLs.
//             discoveryDocs: [
//                 "https://people.googleapis.com/$discovery/rest?version=v1",
//             ],
//             // clientId and scope are optional if auth is not required.
//         })
//         .then(function () {
//             // 3. Initialize and make the API request.
//             return gapi.client.people.people.get({
//                 resourceName: "people/me",
//                 "requestMask.includeField": "person.names",
//             });
//         })
//         .then(
//             function (response) {
//                 console.log(response.result);
//             },
//             function (reason) {
//                 console.log("Error: " + reason.result.error.message);
//             }
//         );
// }

// function authAPI(key) {
//     console.log(key);
//     const script = document.createElement("script");
//     script.src = "https://apis.google.com/js/client.js";
//     script.onload = () => {
//         console.log("load1");
//         gapi.load("client", startReq(key));
//         console.log("load2");
//     };

// var xhttp = new XMLHttpRequest();
// axios
//     .post("https://oauth2.googleapis.com/tokeninfo?id_token=" + key)
//     .then((res) => {
//         console.log(`statusCode: ${res.statusCode}`);
//         console.log(res);
//     })
//     .catch((error) => {
//         console.error(error);
//     });
// xhttp.open(
//     "GET",
//     "https://oauth2.googleapis.com/tokeninfo?access_token=" + key,
//     true
// );
// xhttp.send();
// }

function SignIn() {
    const router = useRouter();
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        // provider.addScope(
        //     "https://www.googleapis.com/auth/user.organization.read"
        // );
        auth.signInWithPopup(provider).then((results) => {
            console.log(results);
            // const API_KEY = results.credential.accessToken;
            // console.log(API_KEY);
            // authAPI(API_KEY);
            try {
                var profile = results.additionalUserInfo.profile;
                var credential = results.credential;
                if (profile.hd != "lcps.org") {
                    throw "Organization not in LCPS. Access denied.";
                }
                updateProfile(profile, credential);
            } catch (error) {
                console.error(error);
                alert(error);
                auth.signOut();
                router.push("/login");
            }
        });
    };

    async function updateProfile(profile, credential) {
        const userRef = db
            .collection("users")
            .doc(firebase.auth().currentUser.uid);

        await userRef.set({
            first: profile.given_name,
            last: profile.family_name,
            email: profile.email,
            organization: profile.hd,
            profilePicture: profile.picture,
            accessToken: credential.accessToken,
            idToken: credential.idToken,
            lastLogin: new firebase.firestore.Timestamp.now(),
        });
    }

    return (
        <>
            <button className="sign-in" onClick={signInWithGoogle}>
                Sign in with Google
            </button>
            <p>Hello world!</p>
        </>
    );
}

function Login() {
    const router = useRouter();
    const [user, loading, error] = useAuthState(auth);

    if (loading) {
        return <>Fetching data...</>;
    }
    if (error != undefined || user == undefined) {
        return <SignIn />;
    } else {
        router.push("/home");
        return <>Signed in!</>;
    }
}

export default Login;
