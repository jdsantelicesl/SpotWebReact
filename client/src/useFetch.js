import { useState, useEffect } from 'react';

export default function useFetch(url) {
    const [data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const token = sessionStorage.getItem("token");
    console.log("token before pass: ", token);

    useEffect(() => {
        const head = {
            "Authorization": "Bearer " + token
        }
        fetch(url, {
            headers: head
        })
            .then(res => {
                if (!res.ok) { // error coming back from server
                    // throws error that will be caught by catch instead of executing .then
                    throw Error('could not fetch the data for that resource');
                }
                return res.json();
            })
            .then(data => {
                // only executes if data ok
                setIsPending(false);
                setData(data);
                setError(null);
            })
            .catch(err => {
                // auto catches network / connection error
                setIsPending(false);
                setError(err.message);
            })
    }, [url])

    return { data, isPending, error };
}