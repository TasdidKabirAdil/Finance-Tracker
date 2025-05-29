import { useNavigate } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'

const Navbar = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const id = localStorage.getItem('id')
    const handleLogout = (e) => {
        e.preventDefault()
        localStorage.clear()
        navigate('/')
    }
    return (
        <>
            <nav>
                <div className={styles.navHolder}>
                    <div className={styles.navWrapper}>
                        <a href="/" style={{ textDecoration: 'none' }}><div className={styles.title}>Finance Tracker</div></a>
                        {token && (
                            <ul className={styles.navLinks}>
                                <li><a href="/dashboard">Dashboard</a></li>
                                <li><a href={`/profile/${id}`}>Profile</a></li>
                            </ul>
                        )}
                    </div>
                    <div>
                        {token ? (<button className={styles.logoutButton} onClick={handleLogout}>Logout</button>)
                            : (<a href='/login'><button className={styles.loginButton}>Login</button></a>)}
                    </div>
                </div>
            </nav>
        </>

    )
}

export default Navbar
