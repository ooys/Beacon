import styles from "../styles/Index.module.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import Router from "next/router";
import React, { useState } from "react";
import initFirebase from "../services/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
//import { gapi } from "googleapis";

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
            var profile = results.additionalUserInfo.profile;
            var credential = results.credential;
            updateProfile(profile, credential);
        });
    };

    async function updateProfile(profile, credential) {
        const userRef = db
            .collection("users")
            .doc(firebase.auth().currentUser.uid);
        console.log(userRef);

        await userRef.set({
            first: String(profile.given_name),
            last: String(profile.family_name),
            email: String(profile.email),
            organization: String(profile.hd),
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

function SignOut() {
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                Sign Out
            </button>
        )
    );
}

function Profile(user) {
    return <></>;
}

function Index() {
    const [user] = useAuthState(auth);
    //console.log(user);

    return (
        <div>
            {user ? (
                <>
                    <Profile />
                    <SignOut />
                </>
            ) : (
                <SignIn />
            )}
        </div>
    );
}

export default Index;
