import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { REGISTER, RESEND_VERIFICATION } from "../graphql/mutations/userMutations"
import styles from '../styles/Cred.module.css'


function Register() {
    const navigate = useNavigate()
    const [register, { loading }] = useMutation(REGISTER)
    const [resendVerification] = useMutation(RESEND_VERIFICATION)
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        estimatedMonthlyIncome: '',
        currency: ''
    })
    const [confirmPass, setConfirmPass] = useState('')
    const [stateMsg, setStateMsg] = useState('')
    const [showResend, setShowResend] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate(`/dashboard`)
        }
    }, [])

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
            if (err.message === "User already exists but not verified!") {
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
        <div className={styles.registerWrapper}>
            <div className={styles.cover}>
                <div className={styles.svgContainer}>
                    <svg viewBox="0 0 900 900" className={styles.topRight} xmlns="http://www.w3.org/2000/svg" version="1.1">
                        <g transform="translate(900, 0)"><path d="M 0 700 C -72.8 650.6 -145.6 601 -238.8 576.6 C -332 552 -445.2 552.6 -495 495 C -544.8 437.4 -530.8 321.8 -554.4 229.6 C -577.8 137.4 -639 68.8 -700 0 L 0 0 Z" fill="#003333"></path></g>
                    </svg>
                    <svg viewBox="0 0 900 900" className={styles.bottomLeft} xmlns="http://www.w3.org/2000/svg" version="1.1">
                        <g transform="translate(0, 900)"><path d="M 0 -700 C 71.2 -633.6 142.4 -567 221.2 -534 C 300 -501 386.6 -501.2 463.8 -463.8 C 541 -426.6 609 -351.4 646.8 -267.8 C 684.6 -184.4 692.2 -92.2 700 0 L 0 0 Z" fill="#003333"></path></g>
                    </svg>
                    <div className={styles.imgContainer}><img src='/public/bg.svg' /></div>
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

            <div className={styles.formContainer} style={{ minHeight: '700px' }}>
                <div className={styles.registerFormLayout}>
                    <div className={styles.logo}><a href='/'>K</a></div>
                    <div className={styles.registerFormTitle}>
                        <h1>Register with us</h1>
                        <p>Create your account today</p>
                    </div>
                    <div className={styles.registerForm}>
                        {stateMsg && (
                            <p className={`${stateMsg === "User already exists but not verified!" ||
                                stateMsg === "User already exists" ? styles.warning : styles.success
                                }`}>{stateMsg} {showResend ? (<a href="#" onClick={handleResend}>Resend Verification Link</a>) : null}</p>
                        )}
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <input type="text" placeholder="" name="name" value={registerForm.name} onChange={handleChange} required />
                                <span>Full Name</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <input type="email" placeholder="" name="email" value={registerForm.email} onChange={handleChange} required />
                                <span>Email</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <input type="password" placeholder="" name="password" value={registerForm.password} onChange={handleChange} required />
                                <span>Password</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <input type="password" placeholder="" name="confirmPass" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
                                <span>Confirm Password</span>
                            </div>

                            {confirmPass && confirmPass !== registerForm.password && (
                                <p className={styles.warning}>Passwords do not match</p>
                            )}

                            <div className={styles.inputGroup}>
                                <input type="number" placeholder="" name="estimatedMonthlyIncome" value={registerForm.estimatedMonthlyIncome} onChange={handleChange} required />
                                <span>Monthly Income</span>
                            </div>
                            <div className={styles.actionBtns}>
                                <select name="currency" value={registerForm.currency} onChange={handleChange} required>
                                    <option value="" disabled>Select Currency</option>
                                    <option value="CAD">CAD</option>
                                    <option value="USD">USD</option>
                                    <option value="BDT">BDT</option>
                                </select>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><a href="/login">Already have an account? <strong>Login</strong></a></div>
            </div>
        </div>

    )
}

export default Register