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

let localStream = null;
let remoteStream = null;

async function initCall(uid, pc) {
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

    const callDoc = db.collection("rooms").doc(uid);
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    pc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };

    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
        }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const candidate = new RTCIceCandidate(change.doc.data());
                pc.addIceCandidate(candidate);
            }
        });
    });

    pc.oniceconnectionstatechange = function () {
        if (pc.iceConnectionState == "disconnected") {
            console.log("Disconnected");
            deleteCollection(db, answerCandidates);
            deleteCollection(db, offerCandidates);
            alert("Someone disconnected.");
        }
    };
}

async function answerCall(callId, pc) {
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

    const callDoc = db.collection("rooms").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            console.log(change);
            if (change.type === "added") {
                let data = change.doc.data();
                pc.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });

    pc.oniceconnectionstatechange = function () {
        if (pc.iceConnectionState == "disconnected") {
            console.log("Disconnected");
            deleteCollection(db, answerCandidates);
            deleteCollection(db, offerCandidates);
            alert("Someone disconnected.");
        }
    };
}

async function deleteCollection(db, collectionPath) {
    const collectionRef = collectionPath;
    const query = collectionRef.orderBy("__name__");

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

function Rooms() {
    const router = useRouter();
    const { id } = router.query;
    const [user, loading, error] = useAuthState(auth);
    if (loading) {
        useEffect(() => {});
        return <>Fetching data...</>;
    }
    if (error != undefined || user == undefined) {
        router.push("/login");
        return <div>Unauthorized, back to login!</div>;
    }
    if (user.uid == id) {
        useEffect(() => {
            const webcamButton = document.getElementById("webcamButton");
            const webcamVideo = document.getElementById("webcamVideo");
            const callButton = document.getElementById("callButton");
            const callInput = document.getElementById("callInput");
            const answerButton = document.getElementById("answerButton");
            const remoteVideo = document.getElementById("remoteVideo");
            const hangupButton = document.getElementById("hangupButton");

            var pc = new RTCPeerConnection(servers);
            initCall(user.uid, pc);
            // setupBeforeUnloadListener = () => {
            //     window.addEventListener("beforeunload", (ev) => {
            //         ev.preventDefault();
            //         return deleteCollection(
            //             db,
            //             db
            //                 .collection("rooms")
            //                 .doc(uid)
            //                 .collection("offerCandidates")
            //         );
            //     });
            // };
        });

        return (
            <>
                Room: {id}
                <button onClick={async () => initCall()}>Call</button>
                <div className="videos">
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
    } else {
        useEffect(() => {
            const webcamButton = document.getElementById("webcamButton");
            const webcamVideo = document.getElementById("webcamVideo");
            const callButton = document.getElementById("callButton");
            const callInput = document.getElementById("callInput");
            const answerButton = document.getElementById("answerButton");
            const remoteVideo = document.getElementById("remoteVideo");
            const hangupButton = document.getElementById("hangupButton");

            var pc = new RTCPeerConnection(servers);
            answerCall(id, pc);
        });

        return (
            <>
                Room: {id}
                <button onClick={async () => initCall()}>Call</button>
                <div className="videos">
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
}

export default Rooms;
