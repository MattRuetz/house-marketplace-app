import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { db } from '../firebase.config';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import VisibilityIcon from '../assets/svg/visibilityIcon.svg';

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const { name, email, password } = formData;

    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value, // === ['email']: email, ['password']: password
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const auth = getAuth();

            // Register user with our firebase auth here
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            updateProfile(auth.currentUser, {
                displayName: name,
            });

            const formDataCopy = { ...formData };
            delete formDataCopy.password; //NEVER store passwords as plain text
            formDataCopy.timestamp = serverTimestamp();

            await setDoc(doc(db, 'users', user.uid), formDataCopy);

            navigate('/');
        } catch (error) {
            console.log(error);
        }

        // GOOGLE'S SAMPLE CODE TO SIGN UP NEW USERS ...
        // https://firebase.google.com/docs/auth/web/start

        // import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
        // const auth = getAuth();
        // createUserWithEmailAndPassword(auth, email, password)
        //     .then((userCredential) => {
        //         // Signed in
        //         const user = userCredential.user;
        //         // ...
        //     })
        //     .catch((error) => {
        //         const errorCode = error.code;
        //         const errorMessage = error.message;
        //         // ..
        //     });

        // GOOGLE'S SAMPLE CODE FOR SETTING A DOC IN FIRESTORE DATABASE
        // https://firebase.google.com/docs/firestore/manage-data/add-data

        // import { doc, setDoc } from 'firebase/firestore';

        // // Add a new document in collection "cities"
        // await setDoc(doc(db, 'cities', 'LA'), {
        //     name: 'Los Angeles',
        //     state: 'CA',
        //     country: 'USA',
        // });
    };

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>
                <main>
                    <form onSubmit={onSubmit}>
                        <input
                            type="text"
                            className="nameInput"
                            placeholder="Name"
                            id="name"
                            value={name}
                            onChange={onChange}
                        />
                        <input
                            type="email"
                            className="emailInput"
                            placeholder="Email"
                            id="email"
                            value={email}
                            onChange={onChange}
                        />

                        <div className="passwordInputDiv">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="passwordInput"
                                placeholder="Password"
                                id="password"
                                value={password}
                                onChange={onChange}
                            />
                            <img
                                src={VisibilityIcon}
                                alt="show password"
                                className="showPassword"
                                onClick={
                                    () =>
                                        setShowPassword(
                                            (prevState) => !prevState
                                        ) //toggle vis
                                }
                            />
                        </div>
                        <Link
                            to={'/forgot-password'}
                            className="forgotPasswordLink"
                        >
                            Forgot Password
                        </Link>

                        <div className="signUpBar">
                            <p className="signUpText">Sign Up</p>
                            <button className="signUpButton">
                                <ArrowRightIcon
                                    fill="#fff"
                                    width="34px"
                                    height="34px"
                                />
                            </button>
                        </div>
                    </form>
                    {/* Google OAuth */}
                    <p>
                        Already have an account?
                        <Link to="/sign-in">Sign In</Link>
                    </p>
                </main>
            </div>
        </>
    );
}

export default SignUp;
