
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

    return <div className="register-page">
        {/* back button to go again his/her choice */}
        <button className="back-btn" onClick={() => setPage('none')}>Back</button>
        {/* form to register */}
        <form className="form" onSubmit={handleSubmit}>
            <div className="e-mail-input">
                <label className="label">E-mail</label><br/><br/>
                {/* required => for the confirmation like no submit without it */}
                <input className="input" type="email" name="email" required />
            </div>
            <br/>
            <div className="password-input">
                <label className="label">Password</label><br/><br/>
                <input className="input" type="password" name="password" required />
            </div>
            <br/>
            <div>
                <label className="label">Confirm Password</label><br/><br/>
                <input className="input" type="password" name="confirmPassword" required />
            </div>
            <br/>
            <select className="select" name="role" required>
                <option value="">Select Role...</option>
                <option value="Client">Fleet Manager</option>
                <option value="VehicleOps">Driver</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Admin">Financial Analyst</option>
            </select>
            <br/><br/>
            <button className="btn" type="submit">Register</button>
        </form>
        <br/>
        <br/>
        <p>Already have an account? <button className="btn" type="button" onClick={() => setPage('signUp')}>
            Login
        </button></p>
    </div>
}