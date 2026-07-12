
export function Register({ setPage }){
    const handleSubmit = async(e) => {
        //on every submit it generally refreshes so preventDefault will prevent that
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try{
            const successMessage = await invoke("create_user", {usernameInput: data.username,
                passwordInput: data.password,
                emailInput: data.email,
                roleInput: data.role});
        }catch(err){
            console.log(err);
        }

    };

    return <div>
        {/* back button to go again his/her choice */}
        <button onClick={() => setPage('none')}>Back</button>
        {/* form to register */}
        <form onSubmit={handleSubmit}>
            <div>
                <label>E-mail</label><br/><br/>
                {/* required => for the confirmation like no submit without it */}
                <input type="email" name="email" required />
            </div>
            <br/>
            <div>
                <label>Password</label><br/><br/>
                <input type="password" name="password" required />
            </div>
            <br/>
            <div>
                <label>Confirm Password</label><br/><br/>
                <input type="password" name="confirmPassword" required />
            </div>
            <br/>
            <select name="role" required>
                <option value="">Select Role...</option>
                <option value="Client">Fleet Manager</option>
                <option value="VehicleOps">Driver</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Admin">Financial Analyst</option>
            </select>
            <br/><br/>
            <button type="submit">Register</button>
        </form>
        <br/>
        <br/>
        <p>Already have an account? <button type="button" onClick={() => setPage('signUp')}>
            Login
        </button></p>
    </div>
}