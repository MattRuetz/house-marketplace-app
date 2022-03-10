import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Category() {
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);

    const params = useParams();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                // Get Listings collection from DB
                const listingsRef = collection(db, 'listings');
                //Get 10 listings of category (rent or sale) from newest->oldest
                const q = query(
                    listingsRef,
                    where('type', '==', params.categoryName),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                );

                // Execute Query
                const querySnap = await getDocs(q);

                let listings = [];

                // destucture listings from DB into the listings array
                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data(),
                    });
                });

                setListings(listings);
                setLoading(false);
            } catch (error) {
                toast.error('Could not fetch listings');
            }
        };

        fetchListings();
    }, [params.categoryName]); //End of useEffect

    return (
        <div className="category">
            <header>
                <p className="pageHeader">
                    {params.categoryName === 'rent'
                        ? 'Places for Rent'
                        : 'Places for Sale'}
                </p>
            </header>

            {loading ? (
                <Spinner />
            ) : listings && listings.length > 0 ? (
                <>
                    <main>
                        <ul className="categoryListings">
                            {listings.map((listing) => (
                                <ListingItem
                                    listing={listing.data}
                                    id={listing.id}
                                    key={listing.id}
                                />
                            ))}
                        </ul>
                    </main>
                </>
            ) : (
                <p>No listings for {params.categoryName}</p>
            )}
        </div>
    );
}

export default Category;
