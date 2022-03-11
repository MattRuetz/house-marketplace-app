import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Explore from './pages/Explore';
import ForgotPassword from './pages/ForgotPassword';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import Category from './pages/Category';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Listing from './pages/Listing';
import Contact from './pages/Contact';

function App() {
    return (
        <>
            <Router>
                <Routes>
                    {/* Home Page */}
                    <Route path="/" element={<Explore />} />
                    {/* Offers Page */}
                    <Route path="/offers" element={<Offers />} />
                    <Route
                        path="/category/:categoryName"
                        element={<Category />}
                    />
                    {/* Profile Page */}
                    <Route path="/profile" element={<PrivateRoute />}>
                        {/* This is <Outlet/> component of private route */}
                        {/* Only show if user is logged in, else go to /sign-in */}
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                    {/* Sign-in Page */}
                    <Route path="/sign-in" element={<SignIn />} />
                    {/* Sign-up Page */}
                    <Route path="/sign-up" element={<SignUp />} />
                    {/* Forgot Password Page */}
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    {/* Create new Listing Page */}
                    <Route path="/create-listing" element={<CreateListing />} />
                    {/* Edit Listing Page */}
                    <Route
                        path="/edit-listing/:listingId"
                        element={<EditListing />}
                    />
                    {/* Show Single Listing Page */}
                    <Route
                        path="/category/:categoryName/:listingId"
                        element={<Listing />}
                    />
                    {/* Contact/[Uid] Page */}
                    <Route path="/contact/:landlordId" element={<Contact />} />
                    {/* Catch All -> 404 */}
                    <Route path="/*" element={<NotFound />} />
                </Routes>
                <Navbar />
            </Router>
            {/* Toastify for styled alerts*/}
            <ToastContainer />
        </>
    );
}

export default App;
