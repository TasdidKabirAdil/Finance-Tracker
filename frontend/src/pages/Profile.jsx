import { GET_USER } from "../graphql/queries/userQueries"
import { UPDATE_USER } from "../graphql/mutations/userMutations"
import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import Modal from '../components/Modal'
import styles from '../styles/Profile.module.css'

function Profile() {
    const id = localStorage.getItem('id')
    const { data: userData, loading, error } = useQuery(GET_USER, { variables: { userId: id } })
    const [updateUser] = useMutation(UPDATE_USER)
    const [updateForm, setUpdateForm] = useState({
        name: '',
        estimatedMonthlyIncome: null,
        address: '',
        country: '',
        currency: ''
    })
    const [showModal, setShowModal] = useState(false);
    const [msg, setMsg] = useState(null)

    useEffect(() => {
        if (userData?.user) {
            const { name, estimatedMonthlyIncome, address, country, currency } = userData.user;
            setUpdateForm({
                name: name || '',
                estimatedMonthlyIncome: estimatedMonthlyIncome || 0,
                address: address || '',
                country: country || '',
                currency: currency || ''
            });
        }
    }, [userData]);


    const handleChange = (e) => {
        const { name, value } = e.target
        setUpdateForm({ ...updateForm, [name]: name === 'estimatedMonthlyIncome' ? parseFloat(value) : value })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            await updateUser({ variables: { updateProfileId: id, ...updateForm } })
            setMsg("Profile Information Updated")
            setTimeout(() => {
                setShowModal(false)
                setMsg(null)
            }, 2000)
        } catch (err) {
            console.log(err.message)
        }
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error.message}</p>

    return (
        <>
            <div className={styles.profileInfo}>
                <h1>Personal Profile</h1>
                <p>Full Name: {userData.user.name}</p>
                <p>Email: {userData.user.email}</p>
                <p>Monthly Income: {userData.user.estimatedMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, })} {userData.user.currency}</p>
                <p>Address: {userData.user.address ? userData.user.address : 'Not yet selected'}</p>
                <p>Country: {userData.user.country ? userData.user.country : 'Not yet selected'}</p>
                <p>{userData.user.verified === true ? "Verified User" : "Unverified User"}</p>
                <button onClick={() => setShowModal(true)}>Edit Profile</button>
            </div>

            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <div className={styles.updateForm}>
                        <h2 style={{ textAlign: 'center' }}>Edit Profile</h2>
                        {msg && <p className={styles.success}>{msg}</p>}
                        <form onSubmit={handleUpdate}>
                            <div className={styles.formRow}>
                                <label htmlFor="name">Name: </label>
                                <input type="text" name="name" value={updateForm.name} onChange={handleChange} required />
                            </div>
                            <div className={styles.formRow}>
                                <label htmlFor="estimatedMonthlyIncome">Monthly Income: </label>
                                <input type="number" name="estimatedMonthlyIncome" value={updateForm.estimatedMonthlyIncome} onChange={handleChange} required />
                            </div>
                            <div className={styles.formRow}>
                                <label htmlFor="address">Address: </label>
                                <input type="text" name="address" value={updateForm.address} onChange={handleChange} required />
                            </div>
                            <div className={styles.formRow}>
                                <label htmlFor="country">Country: </label>
                                <select name="country" value={updateForm.country} onChange={handleChange} required >
                                    <option value="" disabled>Select Country</option>
                                    <option value="Canada">Canada</option>
                                    <option value="USA">USA</option>
                                    <option value="Bangladesh">Bangladesh</option>
                                </select>
                            </div>
                            <div className={styles.formRow}>
                                <label htmlFor="currency">Currency: </label>
                                <select name="currency" value={updateForm.currency} onChange={handleChange} required >
                                    <option value="" disabled>Select Currency</option>
                                    <option value="CAD">CAD</option>
                                    <option value="USD">USD</option>
                                    <option value="BDT">BDT</option>
                                </select>
                            </div>
                            <div className={styles.centerItem}><button type="submit">Update</button></div>
                        </form>
                    </div>
                </Modal>
            )}
        </>
    )
}

export default Profile