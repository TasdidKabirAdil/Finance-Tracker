import { useState } from "react"
import { useMutation } from "@apollo/client"
import { REGISTER, RESEND_VERIFICATION } from "../graphql/mutations/userMutations"
import styles from '../styles/Register.module.css'


function Register() {
    const [register, { loading }] = useMutation(REGISTER)
    const [resendVerification] = useMutation(RESEND_VERIFICATION)
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        estimatedMonthlyIncome: 0,
        currency: ''
    })
    const [confirmPass, setConfirmPass] = useState('')
    const [stateMsg, setStateMsg] = useState('')
    const [showResend, setShowResend] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setRegisterForm({ ...registerForm, [name]: name === 'estimatedMonthlyIncome' ? parseFloat(value) : value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStateMsg('')
        setShowResend(false)
        try {
            await register({ variables: registerForm })
            setStateMsg('Account created! Please check your email to verify your account.')
        } catch (err) {
            setStateMsg(err.message)
            if (err.message === "User already exists but not verified") {
                setShowResend(true)
            }
            console.error(err.message)
        }
    }

    const handleResend = async () => {
        try {
            await resendVerification({ variables: { email: registerForm.email } })
            setStateMsg("Verification link sent. Please check your email.")
        } catch (err) {
            setStateMsg(err.message)
        }
    }

    return (
        <div className={styles.registerForm}>
            <h1>Register</h1>
            {stateMsg && (
                <>
                    <p className={styles.success}>{stateMsg} &nbsp; {showResend ? (<a href="#" onClick={handleResend}>Resend Verificatoin Link</a>) : null}</p>
                    
                </>
            )}
            <form onSubmit={handleSubmit} className={styles.form}>
                <input type="text" placeholder="Full Name" name="name" value={registerForm.name} onChange={handleChange} required />
                <input type="email" placeholder="Email" name="email" value={registerForm.email} onChange={handleChange} required />
                <input type="password" placeholder="Password" name="password" value={registerForm.password} onChange={handleChange} required />
                <input type="password" placeholder="Confirm Password" name="confirmPass" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
                {confirmPass && confirmPass !== registerForm.password && (
                    <p className={styles.warning}>Passwords do not match</p>
                )}
                <input type="number" placeholder="Estimated Monthly Income" name="estimatedMonthlyIncome" value={registerForm.estimatedMonthlyIncome} onChange={handleChange} required />
                <select name="currency" value={registerForm.currency} onChange={handleChange} required>
                    <option value="" disabled>Select Currency</option>
                    <option value="CAD">CAD</option>
                    <option value="USD">USD</option>
                    <option value="BDT">BDT</option>
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Register'}
                </button>
            </form>
            <a href="/login">Already have an account? <strong>Login</strong></a>
        </div>
    )
}

export default Register