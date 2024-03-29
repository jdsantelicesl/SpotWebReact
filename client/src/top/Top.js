import { useState, useEffect } from "react";
import fetchData from "../fetchData.js";

import { logIn, getToken } from "../logIn.js";

export default function Top() {
    const [range, setRange] = useState("long_term");
    const [type, setType] = useState("tracks");

    const [content, setContent] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const unpackToken = sessionStorage.getItem("token") === "null" ? null : sessionStorage.getItem("token");
    const [token, setToken] = useState(unpackToken);

    const unpackExpiry = sessionStorage.getItem("expiry");
    const expiry = unpackExpiry === "null" ? null : parseFloat(unpackExpiry);
    console.log("session token: ", token);


    const unpackState = sessionStorage.getItem("state") === "null" ? null : sessionStorage.getItem("state");
    const [state, setState] = useState(unpackState);

    useEffect(() => {
        console.log("log in update");

        if (!state) {
            sessionStorage.setItem("redirect", "top");
            console.log("redir: ", sessionStorage.getItem("redirect"));
            logIn();
            console.log("logging in");
        }

        else if (state && !token) {
            getToken()
                .then(() => {
                const newToken = sessionStorage.getItem("token");
                setToken(newToken);
                console.log("newToken: ", newToken);
            })
            .catch(() =>{
                console.log("Could not fetch token");
            });
        }
    }, [state, token]);

    useEffect(() => {
        console.log(expiry);
        const current_time = new Date().getHours() + new Date().getMinutes() / 60;
        console.log(current_time);
        if (expiry) {
            if (current_time - expiry >= 1 || current_time < expiry) {
                console.log("reset fired");
                setState(null);
                setToken(null);
                sessionStorage.setItem("state", null);
                sessionStorage.setItem("token", null);
                sessionStorage.setItem("expiry", null);
                console.log("creds set to null");
            }
        }

        console.log("token: ", token);

        if (token) {
            console.log("fetch fired");
            fetchData(`https://api.spotify.com/v1/me/top/${type}?time_range=${range}&limit=50&offset=0`, updateData);
        }

    }, [range, type, token, state]);

    const updateData = (newData, pend, err) => {
        setContent(newData);
        setPending(pend);
        setError(err);
    }

    return (
        <div className="Top">
            <h1 className="headings">Search</h1>
            <hr />
            <p className="sHeading">Your Top Content:</p>

            <div style={{ textAlign: "center" }}>
                <span style={{ display: "inline-block", textAlign: "left" }}>Select Filters:</span>
                <label htmlFor="range"> Time Range: </label>
                <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="short_term">Short Term</option>
                    <option value="medium_term">Medium Term</option>
                    <option value="long_term" selected>Long Term</option>
                </select>

                <label htmlFor="type"> Type: </label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="tracks" selected>Tracks</option>
                    <option value="artists">Artists</option>
                </select>
                <button id="submit">Submit</button>
            </div>

            <div style={{ paddingLeft: "5vw", paddingRight: "5vw" }}><hr /></div>

            {content && <div id="top">
                {content.items.map((song) => (

                    <div className="list">
                        <br />
                        <br />

                        <div className="images"> <img src={
                            (type === "tracks") ? song.album?.images?.[0].url : 
                            (type === "artists") ? song.images?.[0].url :
                            null
                            } style={{ width: "8vh", height: "8vh" }} /> </div>

                        {song.name}
                        <br />
                        <br />
                    </div>

                ))}
            </div>}

            {pending && <p> Loading... </p>}
            {error && <p> An error ocurred, please refresh. {error} </p>}

        </div>
    );
}
