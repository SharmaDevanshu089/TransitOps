import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export function SignIn({ setPage }) {

    const [error,setError] = useState(false)

    const handleSubmit = async (e) => {
        //to prevent refresh
        e.preventDefault();

        //to get data from form
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            // to get the user role from database
            const role = await invoke("authenticate_user", {
                username: data.username,
                password: data.password,
            });
            // condition to check if role is defined or not 
            if (role) {
                console.log(`Success! Logged in as: ${role}`);
                // here we will assign page as per data given
                setError(false)
            } else {
                console.log("Login failed: Invalid username or password.");
                // Now it is working

                setError(true)
            }
            // catch any error
        } catch (err) {
            console.error("error:", err);
            setError(true)
        }
    };

    return <div>
        <button onClick={() => setPage('none')}>Back</button>
        <form onSubmit={handleSubmit}>
            <div><label>User Name</label><br /><br /><input type="text" name="username" required /></div>
            <br />
            <div><label>Password</label><br /><br /><input type="password" name="password" required /></div>
            {error&&<span color="red">Wrong Username or Password</span>}
            <br />
            <button type="submit">Login</button>
        </form>
        <br />
        <br />
        <p>Don't have an account? <button type="button" onClick={() => setPage('register')}>Register</button></p>
    </div>
}