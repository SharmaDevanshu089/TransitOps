export function SignUp({ setPage }){
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Login successful!");
        // Here you would typically handle the login authentication
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