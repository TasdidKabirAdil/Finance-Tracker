import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CONFIRM_PASSWORD } from "../graphql/mutations/userMutations";
import { useMutation } from "@apollo/client";
import styles from '../styles/ResetPassword.module.css'

function ResetPassword() {
    const [confirmReset, { loading }] = useMutation(CONFIRM_PASSWORD)
    const [password, setPassword] = useState('')
    const [confirmPass, setConfirmPass] = useState('')
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const handleReset = async (e) => {
        e.preventDefault()
        try {
            if (!token) {
                setMsg("Invalid or expired token")
                return
            }
            await confirmReset({ variables: { token, newPassword: password } })
            setMsg('Password updated! Redirecting to login…')
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setMsg(err.message)
        }
    }

    return (
        <div className={styles.resetPasswordForm}>
            <h1>Reset Password</h1>
            {msg && (<p className={msg.includes("Invalid") ? styles.warning : styles.success}>{msg}</p>)}
            <form onSubmit={handleReset} className={styles.form}>
                <input type="password" placeholder="Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="password" placeholder="Confirm Password" name="confirmPass" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
                {confirmPass && confirmPass !== password && (
                    <p className={styles.warning}>Passwords do not match</p>
                )}
                <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Password'}</button>
            </form> 
        </div>
    )
}

export default ResetPassword