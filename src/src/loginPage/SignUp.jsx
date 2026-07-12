import { invoke } from "@tauri-apps/api/core";

export function SignIn({ setPage }){

    const handleSubmit = async (e) => {
        //to prevent refresh
        e.preventDefault();
     
        //to get data from form
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            // to get the user role from database
            const role = await invoke("authenticate_user", {
                usernameInput: data.username,
                passwordInput: data.password,
            });
            // condition to check if role is defined or not 
            if (role) {
                console.log(`Success! Logged in as: ${role}`);
                // here we will assign page as per data given
            } else {
                console.log("Login failed: Invalid username or password.");
            }
        // catch any error
        } catch (err) {
            console.error("error:", err);
        }
    };

    return <div>
        <button onClick={() => setPage('none')}>Back</button>
        <form onSubmit={handleSubmit}>
            <div><label>User Name</label><br/><br/><input type="text" name="username" required /></div>
            <br/>
            <div><label>Password</label><br/><br/><input type="password" name="password" required /></div>
            <br/>
            <button type="submit">Login</button>
        </form>
        <br/>
        <br/>
        <p>Don't have an account? <button type="button" onClick={() => setPage('register')}>Register</button></p>
    </div>
}