import { useMutation } from '@apollo/client'
import { LOGIN, RESET_PASSWORD } from '../graphql/mutations/userMutations'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import styles from '../styles/Cred.module.css'

function Login() {
    const [login, { loading }] = useMutation(LOGIN)
    const [resetPassword] = useMutation(RESET_PASSWORD)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
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
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate(`/dashboard`)
        }
    }, [])

    useEffect(() => {
        if (location.state?.demo) {
            setEmail(location.state.email || '')
            setPassword(location.state.password || '')
        }
    }, [location.state])

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const { data } = await login({ variables: { email: email.trim(), password } })
            if (data?.login?.token) {
                localStorage.setItem("id", data.login.user.id)
                localStorage.setItem("token", data.login.token)
                navigate(`/dashboard`)
            }
        } catch (err) {
            if (err.message === `User with ${email} doesn't exist`) {
                setMsg("You are not registered. Try Registering!")
            } else {
                setMsg(err.message)
            }
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        try {
            if (!email.trim()) {
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
        <div className={styles.loginWrapper}>
            <div className={styles.cover}>
                <div className={styles.svgContainer}>
                    <svg viewBox="0 0 900 900" className={styles.topRight} xmlns="http://www.w3.org/2000/svg" version="1.1">
                        <g transform="translate(900, 0)"><path d="M 0 700 C -72.8 650.6 -145.6 601 -238.8 576.6 C -332 552 -445.2 552.6 -495 495 C -544.8 437.4 -530.8 321.8 -554.4 229.6 C -577.8 137.4 -639 68.8 -700 0 L 0 0 Z" fill="#003333"></path></g>
                    </svg>
                    <svg viewBox="0 0 900 900" className={styles.bottomLeft} xmlns="http://www.w3.org/2000/svg" version="1.1">
                        <g transform="translate(0, 900)"><path d="M 0 -700 C 71.2 -633.6 142.4 -567 221.2 -534 C 300 -501 386.6 -501.2 463.8 -463.8 C 541 -426.6 609 -351.4 646.8 -267.8 C 684.6 -184.4 692.2 -92.2 700 0 L 0 0 Z" fill="#003333"></path></g>
                    </svg>
                    <div className={styles.imgContainer}><img src='/bg.svg' /></div>
                </div>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <div>KaneFlow</div>
                        <h1>Build Better Habits. Achieve Bigger Goals</h1>
                    </div>
                    <div className={styles.btnContainer}>
                        <NavLink to='/login' end className={({ isActive }) => `${isActive ? styles.btnFocus : ''}`}><button>Login</button></NavLink>
                        <NavLink to='/register' end className={({ isActive }) => `${isActive ? styles.btnFocus : ''}`}><button>Register</button></NavLink>
                    </div>
                </div>
            </div>
            <div className={styles.formContainer} style={{minHeight: '500px'}}>
                <div className={styles.loginFormLayout}>
                    <div className={styles.logo}><a href='/'>K</a></div>
                    <div className={styles.formTitle}>
                        <h1>Login to your <br /> account</h1>
                        <p>Hello, welcome back to your account</p>
                    </div>
                    <div className={styles.loginForm}>
                        {verifyStatus && (<p className={status === 'success' ? styles.success : styles.warning}>{verifyStatus}</p>)}
                        <form onSubmit={handleLogin}>
                            <div className={styles.inputGroup}>
                                <input type='email' name='email' value={email} placeholder='' onChange={(e) => setEmail(e.target.value)} required />
                                <span>Email</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <input type='password' name='password' value={password} placeholder='' onChange={(e) => setPassword(e.target.value)} required />
                                <span>Password</span>
                            </div>
                            {msg && (<p style={{margin: '20px 0 10px 0'}} className={msg.includes("resetting password") ? styles.success : styles.warning}>{msg}</p>)}
                            <div className={styles.actionBtns}>
                                <a href="#" onClick={handleResetPassword}>Forgot Password?</a>
                                <button type='submit' disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}><a href="/register">Don’t have an account? <strong>Register</strong></a></div>
                
            </div>
        </div>
    )
}

export default Login