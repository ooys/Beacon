import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";

const config = {
    apiKey: "AIzaSyBZHnMyuE9EOPFgIKWS3cO9uvNkhPUVCM8",
    authDomain: "secret-math-society.firebaseapp.com",
    projectId: "secret-math-society",
    storageBucket: "secret-math-society.appspot.com",
    messagingSenderId: "700564675926",
    appId: "1:700564675926:web:0797161f114c0cd6370af7",
    measurementId: "G-488FWKGSB8",
};

export default function initFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
}
