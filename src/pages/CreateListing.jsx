import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.REACT_APP_GEOCODE_API_URL;
const API_KEY = process.env.REACT_APP_GEOCODE_API_KEY;

console.log(process.env);

function CreateListing() {
    const [loading, setLoading] = useState(false);
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitudde: 0,
    });

    // Destructure formData
    const {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude,
    } = formData;

    const auth = getAuth();
    const navigate = useNavigate();
    const isMounted = useRef(true);

    // Assure user is signed in. Ass UserID to formData to know who listed it
    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({ ...formData, userRef: user.uid });
                } else {
                    navigate('/sign-in');
                }
            });
        }

        return () => (isMounted.current = false);
    }, [isMounted]);

    // Handle new listing form submission
    const onSubmit = async (e) => {
        e.preventDefault();

        if (discountedPrice >= regularPrice) {
            setLoading(false);
            toast.error('Discounted price must be lower than regular price');
            return;
        }

        if (images.length > 6) {
            setLoading(false);
            toast.error('Maximum of 6 images');
            return;
        }

        let geolocation = {};
        let location;

        if (geolocationEnabled) {
            const response = await fetch(
                // .env variables
                API_URL + `address=${address}&key=${API_KEY}`
            );

            const data = await response.json();

            // The ? after .results[0] assure WONT BREAK IF results[0]== NULL
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

            location =
                data.status === 'ZERO_RESULTS'
                    ? undefined
                    : data.results[0]?.formatted_address;

            if (location === undefined || location.includes('undefined')) {
                setLoading(false);
                toast.error('Please enter the correct address');
                return;
            }
        } else {
            geolocation.lat = latitude;
            geolocation.lng = longitude;
            location = address;
        }

        // Store images in firebase
        // See: https://firebase.google.com/docs/storage/web/upload-files near bottom of page
        const storeImage = async (image) => {
            // Uploading is async task, return PROMISE
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const fileName = `${auth.currentUser.uid}-${
                    image.name
                }-${uuidv4()}`;
                const storageRef = ref(storage, 'images/' + fileName);
                // Create uploadTask
                const uploadTask = uploadBytesResumable(storageRef, image);

                // Register three observers:
                // 1. 'state_changed' observer, called any time the state changes
                // 2. Error observer, called on failure
                // 3. Completion observer, called on successful completion
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                            100;
                        console.log('Upload is ' + progress + '% done');

                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                            default:
                                console.log(snapshot.state);
                                break;
                        }
                    },
                    (error) => {
                        // Handle unsuccessful uploads
                        toast.error('Unable to upload image(s)');
                        reject(error); // Promise rejected, callback with error
                    },
                    () => {
                        //Callback for COMPLETED UPLOAD
                        // get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then(
                            (downloadURL) => {
                                resolve(downloadURL);
                            }
                        );
                    }
                );
            });
        };

        // If all promises resolve, all images are uploaded to FB storage
        // Urls now stored in imageUrls
        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch((e) => {
            console.log(e);
            setLoading(false);
            toast.error('Unable to upload image(s)');
            return;
        });

        // Wrap form data with image Urls, geoloc, and current time before storing to FS
        const formDataCopy = {
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp(),
        };

        delete formDataCopy.images; // dont need to store - use imageUrl to ref in Storage instead
        delete formDataCopy.address; // in FS: location, lat, lng
        location && (formDataCopy.location = location);
        !formDataCopy.offer && delete formDataCopy.discountedPrice;

        const docRef = await addDoc(collection(db, 'listings'), formDataCopy);

        setLoading(false);

        toast.success('Listing saved!');
        console.log(
            `redirecting to /category/${formDataCopy.type}/${docRef.id}`
        );
        navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    };

    // Handle mutation to any form input
    const onMutate = (e) => {
        let boolean = null;

        if (e.target.value === 'false') {
            boolean = false;
        }
        if (e.target.value === 'true') {
            boolean = true;
        }
        if (e.target.files) {
            // Files
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files,
            }));
        }
        if (!e.target.files) {
            // Text, Bools, Nums
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value, // Set input's value to bool if not null, otherwise set to new target value
            }));
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="profile">
            <header>
                <p className="pageHeader">Create a Listing</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className="formLabel">Sell / Rent</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={
                                type === 'sale'
                                    ? 'formButtonActive'
                                    : 'formButton'
                            }
                            id="type"
                            value="sale"
                            onClick={onMutate}
                        >
                            Sell
                        </button>
                        <button
                            type="button"
                            className={
                                type === 'rent'
                                    ? 'formButtonActive'
                                    : 'formButton'
                            }
                            id="type"
                            value="rent"
                            onClick={onMutate}
                        >
                            Rent
                        </button>
                    </div>

                    <label className="formLabel">Name</label>
                    <input
                        className="formInputName"
                        type="text"
                        id="name"
                        value={name}
                        onChange={onMutate}
                        maxLength="32"
                        minLength="10"
                        required
                    />

                    <div className="formRooms flex">
                        <div>
                            <label className="formLabel">Bedrooms</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="bedrooms"
                                value={bedrooms}
                                onChange={onMutate}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Bathrooms</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="bathrooms"
                                value={bathrooms}
                                onChange={onMutate}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                    </div>

                    <label className="formLabel">Parking spot</label>
                    <div className="formButtons">
                        <button
                            className={
                                parking ? 'formButtonActive' : 'formButton'
                            }
                            type="button"
                            id="parking"
                            value={true}
                            onClick={onMutate}
                            min="1"
                            max="50"
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !parking && parking !== null
                                    ? 'formButtonActive'
                                    : 'formButton'
                            }
                            type="button"
                            id="parking"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Furnished</label>
                    <div className="formButtons">
                        <button
                            className={
                                furnished ? 'formButtonActive' : 'formButton'
                            }
                            type="button"
                            id="furnished"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !furnished && furnished !== null
                                    ? 'formButtonActive'
                                    : 'formButton'
                            }
                            type="button"
                            id="furnished"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Address</label>
                    <textarea
                        className="formInputAddress"
                        type="text"
                        id="address"
                        value={address}
                        onChange={onMutate}
                        required
                    />

                    {!geolocationEnabled && (
                        <div className="formLatLng flex">
                            <div>
                                <label className="formLabel">Latitude</label>
                                <input
                                    className="formInputSmall"
                                    type="number"
                                    id="latitude"
                                    value={latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className="formLabel">Longitude</label>
                                <input
                                    className="formInputSmall"
                                    type="number"
                                    id="longitude"
                                    value={longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <label className="formLabel">Offer</label>
                    <div className="formButtons">
                        <button
                            className={
                                offer ? 'formButtonActive' : 'formButton'
                            }
                            type="button"
                            id="offer"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !offer && offer !== null
                                    ? 'formButtonActive'
                                    : 'formButton'
                            }
                            type="button"
                            id="offer"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Regular Price</label>
                    <div className="formPriceDiv">
                        <input
                            className="formInputSmall"
                            type="number"
                            id="regularPrice"
                            value={regularPrice}
                            onChange={onMutate}
                            min="50"
                            max="1000000000"
                            required
                        />
                        {type === 'rent' && (
                            <p className="formPriceText">$ / Month</p>
                        )}
                    </div>

                    {offer && (
                        <>
                            <label className="formLabel">
                                Discounted Price
                            </label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="discountedPrice"
                                value={discountedPrice}
                                onChange={onMutate}
                                min="50"
                                max="1000000000"
                                required={offer}
                            />
                        </>
                    )}

                    <label className="formLabel">Images</label>
                    <p className="imagesInfo">
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        className="formInputFile"
                        type="file"
                        id="images"
                        onChange={onMutate}
                        max="6"
                        accept=".jpg,.png,.jpeg"
                        multiple
                        required
                    />
                    <button
                        type="submit"
                        className="primaryButton createListingButton"
                    >
                        Create Listing
                    </button>
                </form>
            </main>
        </div>
    );
}

export default CreateListing;
