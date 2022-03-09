import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import VisibilityIcon from '../assets/svg/visibilityIcon.svg';

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

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

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            // successful Auth, signed in, go to Home
            userCredential.user && navigate('/');
        } catch (error) {
            // Unable to authenticate
            toast.error('Incorrect credentials!');
        }
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

                        <div className="signInBar">
                            <p className="signInText">Sign In</p>
                            <button className="signInButton">
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
                        Don't have an account?<Link to="/sign-up">Sign Up</Link>
                    </p>
                </main>
            </div>
        </>
    );
}

export default SignIn;
