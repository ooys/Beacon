import { useRouter } from "next/router";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import initFirebase from "/services/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";

initFirebase();
const auth = firebase.auth();
const db = firebase.firestore();

const servers = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
            ],
        },
    ],
    iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

async function initCall() {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    webcamVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;

    // callButton.disabled = false;
    // answerButton.disabled = false;
    // webcamButton.disabled = true;
}

function Rooms() {
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        const webcamButton = document.getElementById("webcamButton");
        const webcamVideo = document.getElementById("webcamVideo");
        const callButton = document.getElementById("callButton");
        const callInput = document.getElementById("callInput");
        const answerButton = document.getElementById("answerButton");
        const remoteVideo = document.getElementById("remoteVideo");
        const hangupButton = document.getElementById("hangupButton");
    });

    return (
        <>
            Room: {id}
            <button onClick={async () => initCall()}>Call</button>
            <div class="videos">
                <span>
                    <h3>Local Stream</h3>
                    <video id="webcamVideo" autoPlay playsInline></video>
                </span>
                <span>
                    <h3>Remote Stream</h3>
                    <video id="remoteVideo" autoPlay playsInline></video>
                </span>
            </div>
        </>
    );
}

export default Rooms;
