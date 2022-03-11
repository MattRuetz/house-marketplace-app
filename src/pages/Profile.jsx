import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, updateProfile } from 'firebase/auth';
import {
    doc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import ListingItem from '../components/ListingItem';

function Profile() {
    const auth = getAuth();
    const [changeDetails, setChangeDetails] = useState(false);
    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
    });
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState(null);

    const { name, email } = formData;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserListings = async () => {
            const listingsRef = collection(db, 'listings');
            const q = query(
                listingsRef,
                where('userRef', '==', auth.currentUser.uid),
                orderBy('timestamp', 'desc')
            );

            const querySnap = await getDocs(q);

            let listings = [];

            querySnap.forEach((doc) =>
                listings.push({ id: doc.id, data: doc.data() })
            );

            setListings(listings);
            setLoading(false);
        };

        fetchUserListings();
    }, [auth.currentUser.uid]);

    const onLogout = (e) => {
        auth.signOut();
        navigate('/');
    };

    const onSubmit = async (e) => {
        try {
            if (auth.currentUser.displayName !== name) {
                //Update stored firebase user authentication details
                await updateProfile(auth.currentUser, {
                    displayName: name,
                });

                // Update in firestore DB
                const userRef = doc(db, 'users', auth.currentUser.uid); // find user in DB
                await updateDoc(userRef, { name /* : {name} */ });
            }
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Could not update profile details!');
        }
    };

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    };

    const onDelete = async (listingId) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            await deleteDoc(doc(db, 'listings', listingId)); //Delete selected

            const updatedListings = listings.filter(
                (listing) => listing.id !== listingId
            );
            setListings(updatedListings);

            toast.success('Success! Deleted listing');
        }
    };

    const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`);

    return (
        <div className="profile">
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type="button" className="logOut" onClick={onLogout}>
                    Log Out
                </button>
            </header>
            <main>
                <div className="profileDetailsHeader">
                    <p className="profileDetailsText">Personal Details</p>
                    <p
                        className="changePersonalDetails"
                        onClick={() => {
                            changeDetails && onSubmit();
                            setChangeDetails((prevState) => !prevState);
                        }}
                    >
                        {changeDetails ? 'done' : 'change'}
                    </p>
                </div>
                <div className="profileCard">
                    <form>
                        <input
                            type="text"
                            id="name"
                            className={
                                !changeDetails
                                    ? 'profileName'
                                    : 'profileNameActive'
                            }
                            disabled={!changeDetails}
                            value={name}
                            onChange={onChange}
                        />
                        <input
                            type="text"
                            id="email"
                            className={
                                !changeDetails
                                    ? 'profileEmail'
                                    : 'profileEmailActive'
                            }
                            disabled={!changeDetails}
                            value={email}
                            onChange={onChange}
                        />
                    </form>
                </div>
                <Link to="/create-listing" className="createListing">
                    <img src={homeIcon} alt="Home" />
                    <p>Sell or rent your home</p>
                    <img src={arrowRight} alt="arrow-right" />
                </Link>

                {!loading && listings?.length > 0 && (
                    <>
                        <p className="listingsText">Your Listings</p>
                        <ul className="listingsList">
                            {listings.map((listing) => (
                                <ListingItem
                                    key={listing.id}
                                    listing={listing.data}
                                    id={listing.id}
                                    onDelete={() => onDelete(listing.id)}
                                    onEdit={() => onEdit(listing.id)}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </main>
        </div>
    );
}

export default Profile;
