import { useMutation } from '@apollo/client'
import { LOGIN, RESET_PASSWORD } from '../graphql/mutations/userMutations'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from '../styles/Login.module.css'

function Login() {
    const [login, { loading }] = useMutation(LOGIN)
    const [resetPassword] = useMutation(RESET_PASSWORD)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verifyStatus, setVerifyStatus] = useState(null)
    const [msg, setMsg] = useState(null)
    const status = searchParams.get('verify')

    useEffect(() => {
        if (status === 'success') {
            setVerifyStatus('Your email was successfully verified. You can now log in.')
        } else if (status === 'failed') {
            setVerifyStatus('Verification link is invalid or expired.')
        } else if (status === 'error') {
            setVerifyStatus('Something went wrong during email verification.')
        }
    }, [searchParams])

    // for redirecting logged in users
    // useEffect(() => {
    //     const token = localStorage.getItem('token')
    //     const id = localStorage.getItem('id')
    //     if (token && id) {
    //         navigate(`/profile/${id}`)
    //     }
    // }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const { data } = await login({ variables: { email: email.trim(), password } })
            if (data?.login?.token) {
                localStorage.setItem("id", data.login.user.id)
                localStorage.setItem("name", data.login.user.name)
                localStorage.setItem("token", data.login.token)
                navigate(`/profile/${data.login.user.id}`)
            }
        } catch (err) {
            if (err.message === `User with ${email} doesn't exist`) {
                setMsg("You are not registered. Try Registering!")
            } else {
                setMsg(err.message)
            }
        }
    }

    const handleResetPassword = async(e) => {
        e.preventDefault()
        try {
            if(!email.trim()) {
                setMsg('Please enter your email before requesting a reset link.')
                return
            }
            await resetPassword({ variables: { email: email.trim() } })
            setMsg("Link for resetting password has been sent to email")
        } catch (err) {
            setMsg(err.msg)
        }
    }

    return (
        <div className={styles.loginForm}>
            <h1>Login</h1>
            {verifyStatus && (<p className={status === 'success' ? styles.success : styles.warning}>{verifyStatus}</p>)}
            <form onSubmit={handleLogin} className={styles.form}>
                <input type='email' name='email' value={email} placeholder='Email' onChange={(e) => setEmail(e.target.value)} required />
                <input type='password' name='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} required />
                {msg && (<p className={msg.includes("resetting password") ? styles.success : styles.warning}>{msg}</p>)}
                <button type='submit' disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <a href="/register">Don’t have an account? <strong>Register</strong></a>
            <a href="#" onClick={handleResetPassword}>Forgot Password?</a>
        </div>
    )
}

export default Login