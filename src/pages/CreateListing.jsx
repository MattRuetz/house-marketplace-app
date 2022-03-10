import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

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

        setLoading(false);
    };

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
