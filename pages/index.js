import styles from "../styles/Index.module.css";
import { useRouter } from "next/router";
import React, { useState } from "react";

function Index() {
    const router = useRouter();
    return (
        <div>
            Hello
            <button onClick={() => router.push("/login")}>Login</button>
        </div>
    );
}

export default Index;
