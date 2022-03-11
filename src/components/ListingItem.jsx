import { Link } from 'react-router-dom';
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg';
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg';
import bedIcon from '../assets/svg/bedIcon.svg';
import bathtubIcon from '../assets/svg/bathtubIcon.svg';

function ListingItem({ listing, id, onDelete, onEdit }) {
    return (
        <li className="categoryListing">
            <Link
                className="categoryListingLink"
                to={`/category/${listing.type}/${id}`}
            >
                <div className="flexCard">
                    <img
                        src={listing.imgUrls[0]}
                        alt={listing.name}
                        className="categoryListingImg"
                    />
                    <div className="categoryListingDetails">
                        <p className="categoryListingLocation">
                            {listing.location}
                        </p>
                        <p className="categoryListingName">{listing.name}</p>

                        <p className="categryListingPrice">
                            {/* Show relevant price, formatted to $xxx,xxx */}$
                            {listing.offer
                                ? listing.discountedPrice
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                : listing.regularPrice
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            {listing.type === 'rent' && ' / Month'}
                        </p>
                        <div className="categoryListingInfoDiv">
                            <div className="stat">
                                <img src={bedIcon} alt="bedrooms" />
                                <p className="categoryListingInfoText">
                                    {listing.bedrooms > 1
                                        ? `${listing.bedrooms} Bedrooms`
                                        : '1 Bedroom'}
                                </p>
                            </div>
                            <div className="stat">
                                <img src={bathtubIcon} alt="bath" />
                                <p className="categoryListingInfoText">
                                    {listing.bathrooms > 1
                                        ? `${listing.bathrooms} Bathrooms`
                                        : '1 Bathroom'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
            <div className="listingControls">
                <div className="listingControl">
                    {onEdit && (
                        <EditIcon
                            className="editIcon"
                            onClick={() => onEdit(id)}
                        />
                    )}
                </div>
                <div className="listingControl">
                    {onDelete && (
                        <DeleteIcon
                            className="removeIcon"
                            fill="rgb(230, 75, 60)"
                            onClick={() => onDelete(listing.id, listing.name)}
                        />
                    )}
                </div>
            </div>
        </li>
    );
}

export default ListingItem;
