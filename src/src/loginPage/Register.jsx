
export function Register({ setPage }){
    const handleSubmit = (e) => {
        //on every submit it generally refreshes so preventDefault will prevent that
        e.preventDefault();
        // we are taking the form data in the form of object instance which on clg won't display anything but store data
        const formData = new FormData(e.target);
        // to store this in the form of data that we can clg
        const data = Object.fromEntries(formData.entries());
        
        // this to check password
        if (data.password !== data.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        //here we will take data and then send to home page
        setPage('none'); // returns to main menu
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
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Driver">Driver</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
                <option value="Admin">Admin</option>
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