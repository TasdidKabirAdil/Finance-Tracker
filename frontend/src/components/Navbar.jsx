import { NavLink, useNavigate } from 'react-router-dom'
import { DashboardIcon, ExpensesIcon, SavingsIcon, ReportsIcon, LogoutIcon } from './Icons'
import { GET_USER } from '../graphql/queries/userQueries'
import styles from '../styles/Navbar.module.css'
import { useQuery } from '@apollo/client'

const Navbar = ({ collapsed, mobileOpen, onMobileClose }) => {
    const token = localStorage.getItem('token')
    const id = localStorage.getItem('id')

    const { data } = useQuery(GET_USER, { variables: { userId: id } })

    const navigate = useNavigate()

    const handleLogout = (e) => {
        e.preventDefault()
        localStorage.clear()
        navigate('/login')
    }

    if (!token) return null

    return (
        <>
            {mobileOpen && <div className={styles.backdrop} onClick={onMobileClose} />}
            <nav className={mobileOpen ? styles.mobileOpen : ''}>
                <div className={styles.navWrapper}>
                    <div className={styles.navLinks}>
                        <NavLink to="/" end className={styles.titleName}>
                            {collapsed ? <h1>K</h1> :
                                <div>
                                    <h1>KaneFlow</h1>
                                </div>
                            }
                        </NavLink>
                        <NavLink to="/dashboard" end className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
                            <DashboardIcon size={20} color='white' />
                            {!collapsed && <span>Dashboard</span>}
                        </NavLink>
                        <NavLink to="/expenses" end className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
                            <ExpensesIcon size={20} color='white' />
                            {!collapsed && <span>Expenses</span>}
                        </NavLink>
                        <NavLink to="/savings" end className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
                            <SavingsIcon size={20} color='white' />
                            {!collapsed && <span>Savings</span>}
                        </NavLink>
                        <NavLink to="/reports" end className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
                            <ReportsIcon size={20} color='white' />
                            {!collapsed && <span>Reports</span>}
                        </NavLink>
                    </div>
                    <NavLink to={`/profile/${id}`} end className={({ isActive }) => `${styles.profile} ${isActive ? styles.activeLink : ''}`}>
                        <div className={styles.initial}><p>{data?.user.name.charAt(0)}</p></div> &nbsp;&nbsp;
                        {!collapsed &&
                            <div className={styles.logout}>
                                <p>{data?.user.name}</p>
                                <div className={styles.tooltipWrapper}>
                                    <button className={styles.logoutBtn} onClick={handleLogout}>
                                        <LogoutIcon size={20} />
                                    </button>
                                    <span className={styles.tooltipText}>Logout</span>
                                </div>
                            </div>}
                    </NavLink>
                </div>
            </nav>

        </>
    )
}

export default Navbar
