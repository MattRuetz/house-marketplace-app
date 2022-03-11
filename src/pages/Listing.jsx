import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import Spinner from '../components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Listing() {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareLinkCopied, setShareLinkCopied] = useState(null);

    const navigate = useNavigate();
    const params = useParams();
    const auth = getAuth();

    useEffect(() => {
        const fetchListing = async () => {
            const docRef = doc(db, 'listings', params.listingId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log(docSnap.data());
                setListing(docSnap.data());
                setLoading(false);
            }
        };

        fetchListing();
    }, [navigate, params.listingId]);

    if (loading) {
        return <Spinner />;
    }

    return (
        <main>
            <Swiper slidesPerView={1} pagination={{ clickable: true }}>
                {listing.imgUrls.map((url, index) => (
                    <SwiperSlide key={index}>
                        <div
                            style={{
                                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                                backgroundSize: 'cover',
                            }}
                            className="swiperSlideDiv"
                        ></div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div
                className="shareIconDiv"
                onClick={() => {
                    // COPY TO CLIPBOARD
                    navigator.clipboard.writeText(window.location.href);
                    setShareLinkCopied(true);
                    setTimeout(() => {
                        setShareLinkCopied(false);
                    }, 2000);
                }}
            >
                <img src={shareIcon} alt="Share" />
            </div>
            {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

            <div className="listingDetails">
                <p className="listingName">
                    {listing.name} -{' $'}
                    {listing.offer
                        ? listing.discountedPrice
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        : listing.regularPrice
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </p>

                <p className="listingLocation">{listing.location}</p>
                <p className="listingType">
                    For {listing.type === 'rent' ? 'Rent' : 'Sale'}
                </p>
                {listing.offer && (
                    <p className="discountPrice">
                        $
                        {(listing.regularPrice - listing.discountedPrice)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                        discount
                        <span style={{ color: 'lightgreen' }}>
                            &nbsp;&nbsp;&nbsp;
                            {(
                                -(
                                    listing.regularPrice /
                                        listing.discountedPrice -
                                    1
                                ) * 100
                            ).toFixed(2)}{' '}
                            %
                        </span>
                    </p>
                )}

                <ul className="listingDetailList">
                    <li>
                        {listing.bedrooms > 1
                            ? `${listing.bedrooms} Bedrooms`
                            : '1 Bedroom'}
                    </li>
                    <li>
                        {listing.bathrooms > 1
                            ? `${listing.bathrooms} Bathrooms`
                            : '1 Bathroom'}
                    </li>
                    {listing.parking && <li>Parking Spot ✔️</li>}
                    {listing.furnished && <li>Furnished ✔️</li>}
                </ul>

                <p className="listingLocationTitle">Location</p>
                {/* MAP */}
                <div className="leafletContainer">
                    <MapContainer
                        style={{ height: '100%', width: '100%' }}
                        center={[
                            listing.geolocation.lat,
                            listing.geolocation.lng,
                        ]}
                        zoom={13}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
                        />

                        <Marker
                            position={[
                                listing.geolocation.lat,
                                listing.geolocation.lng,
                            ]}
                        >
                            <Popup>{listing.location}</Popup>
                        </Marker>
                    </MapContainer>
                </div>

                {/* Show Contact button, if current user is not also the lister */}
                {auth.currentUser?.uid !== listing.userRef && (
                    <Link
                        to={`/contact/${listing.userRef}?listingName=${listing.name}`}
                        className="primaryButton"
                    >
                        Contact Landlord
                    </Link>
                )}
            </div>
        </main>
    );
}

export default Listing;
