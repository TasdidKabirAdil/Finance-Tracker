// GraphQL queries & mutations
import { GET_USER } from "../graphql/queries/userQueries";
import { UPDATE_USER, DELETE_USER } from "../graphql/mutations/userMutations";

// Components & utilities
import { VerifiedIcon } from "../components/Icons";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { CustomSelect2 } from "../components/CustomSelect";
import Spinner from "../components/Spinner";
import styles from '../styles/Profile.module.css';

function Profile() {
    const id = localStorage.getItem('id');
    const navigate = useNavigate();

    // GraphQL hooks
    const { data: userData, loading } = useQuery(GET_USER, { variables: { userId: id } });
    const [updateUser] = useMutation(UPDATE_USER);
    const [deleteUser] = useMutation(DELETE_USER);

    // Form and state management
    const [updateForm, setUpdateForm] = useState({
        name: '',
        estimatedMonthlyIncome: '',
        address: '',
        country: '',
        currency: ''
    });
    const [msg, setMsg] = useState(null);
    const [isEditable, setIsEditable] = useState(false);

    const toggleEdit = () => setIsEditable(prev => !prev);

    // Format createdAt into readable string
    const formattedDate = (targetDate) => {
        const date = new Date(targetDate);
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeek = weekdays[date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${dayOfWeek} ${day}, ${month} ${year}`;
    };

    // Select dropdown options
    const countryOptions = [
        { value: 'Canada', label: 'Canada' },
        { value: 'USA', label: 'USA' },
        { value: 'Bangladesh', label: 'Bangladesh' },
    ];

    const currencyOptions = [
        { value: 'CAD', label: 'CAD' },
        { value: 'USD', label: 'USD' },
        { value: 'BDT', label: 'BDT' },
    ];

    const isDemo = id === '6871e21e774631cc34075c75'

    // Preload user data into form
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

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdateForm({
            ...updateForm,
            [name]: name === 'estimatedMonthlyIncome' ? parseFloat(value) : value
        });
    };

    // Submit updated profile data
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUser({ variables: { updateProfileId: id, ...updateForm } });
            setMsg("Profile Information Updated");
            setIsEditable(false);
            setTimeout(() => setMsg(null), 2000);
        } catch (err) {
            console.log(err.message);
        }
    };

    // Delete user account
    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const ok = window.confirm('Are you sure you want to delete your account?');
            if (!ok) return;
            await deleteUser({ variables: { deleteUserId: id } });
            localStorage.clear();
            alert('Your account has been deleted!');
            navigate('/');
        } catch (err) {
            console.log(err.message);
        }
    };

    // Show spinner while loading
    if (loading) return <Spinner />;

    return (
        <div className={styles.homeContainer}>
            <h1>Welcome {userData.user.name.split(' ')[0]}</h1>
            <p style={{ marginBottom: '3%' }}>{formattedDate(userData.user.createdAt)}</p>

            <div className={styles.profileContainer}>
                <div className={styles.barImgContainer}><img src="/profileHeader.jpg" /></div>

                <div className={styles.holder}>
                    {/* Profile header with avatar, name, email, edit buttons */}
                    <div className={styles.profileHeader}>
                        <div className={styles.wrapper}>
                            <div className={styles.profileImg}>
                                <h2>{userData.user.name.charAt(0)}</h2>
                            </div>
                            <div className={styles.headerText}>
                                <h2>{userData.user.name}
                                    <div className={styles.tooltipWrapper}>
                                        <VerifiedIcon size={20} color="#009191" />
                                        <span className={styles.tooltipText}>Verified</span>
                                    </div>
                                </h2>
                                <p>{userData.user.email}</p>
                            </div>
                        </div>

                        {/* Edit mode buttons */}
                        {!isEditable ? (
                            <button className={styles.editBtn} onClick={toggleEdit}>Edit</button>
                        ) : (
                            <div className={styles.btnContainer}>
                                <button className={styles.editBtn} type="submit" form="profileForm">Update</button>
                                <button className={styles.cancelBtn} onClick={toggleEdit}>Cancel</button>
                            </div>
                        )}
                    </div>

                    {msg && <p className={styles.success}>{msg}</p>}

                    {/* Profile form */}
                    <form id="profileForm" className={styles.profileForm} onSubmit={handleUpdate}>
                        <div>
                            <label htmlFor="name">Full Name</label>
                            <input type="text" name="name"
                                value={updateForm.name}
                                onChange={handleChange}
                                className={!isEditable ? styles.blurred : ''}
                                disabled={!isEditable}
                                required={isEditable} />
                        </div>

                        <div>
                            <label htmlFor="estimatedMonthlyIncome">Monthly Income</label>
                            <input type="number" name="estimatedMonthlyIncome"
                                value={updateForm.estimatedMonthlyIncome}
                                onChange={handleChange}
                                className={!isEditable ? styles.blurred : ''}
                                disabled={!isEditable}
                                required={isEditable} />
                        </div>

                        <div>
                            <label htmlFor="address">Address</label>
                            <input type="text" name="address"
                                value={updateForm.address}
                                onChange={handleChange}
                                className={!isEditable ? styles.blurred : ''}
                                disabled={!isEditable}
                                required={isEditable} />
                        </div>

                        <div>
                            <label htmlFor="country">Country</label>
                            <CustomSelect2
                                options={countryOptions}
                                value={updateForm.country}
                                onChange={(val) => handleChange({ target: { name: 'country', value: val } })}
                                padding={'8px'}
                                isDisabled={!isEditable}
                            />
                        </div>

                        <div>
                            <label htmlFor="currency">Currency</label>
                            <CustomSelect2
                                options={currencyOptions}
                                value={updateForm.currency}
                                onChange={(val) => handleChange({ target: { name: 'currency', value: val } })}
                                padding={'8px'}
                                isDisabled={!isEditable}
                            />
                        </div>

                        <div style={{ transform: 'translateY(40%)' }}>
                            <button
                                className={styles.deleteBtn}
                                onClick={handleDelete}
                                disabled={isDemo}
                                title={isDemo ? "Demo account cannot be deleted" : ""}
                            >Delete Account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
