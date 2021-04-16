import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import initFirebase from "../services/firebase.js";
import firebase from "firebase/app";

initFirebase();
const db = firebase.firestore();

function Profile(props) {
    const userRef = db.collection("users").doc(props.uid);
    const [value, loading, error] = useDocumentDataOnce(userRef);

    if (loading) {
        return <>Fetching data...</>;
    }
    if (error != undefined || value == undefined) {
        return alert(error) && <div>error</div>;
    } else {
        return (
            <>
                <div>
                    Welcome, {value.first} {value.last}!
                </div>
                <div>Email: {value.email}</div>
            </>
        );
    }
}
export default Profile;
