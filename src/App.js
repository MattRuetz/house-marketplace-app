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

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Explore />}></Route>
                    <Route path="/offers" element={<Offers />}></Route>
                    <Route path="/profile" element={<PrivateRoute />}>
                        {/* This is <Outlet/> component of private route */}
                        {/* Only show if user is logged in, else go to /sign-in */}
                        <Route path="/profile" element={<Profile />}></Route>
                    </Route>
                    <Route path="/sign-in" element={<SignIn />}></Route>
                    <Route path="/sign-up" element={<SignUp />}></Route>
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    ></Route>
                    <Route path="/*" element={<NotFound />}></Route>
                </Routes>
                <Navbar />
            </Router>
            {/* Toastify for styled alerts*/}
            <ToastContainer />
        </>
    );
}

export default App;
