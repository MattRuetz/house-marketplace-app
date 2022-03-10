import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="pageContainer">
            <header style={{ textAlign: 'center' }}>
                <h1>ERROR 404</h1>
                <p className="pageHeader">Page Not Found!</p>
                <Link className="primaryButton" to="/">
                    Back to Safety
                </Link>
            </header>
        </div>
    );
}

export default NotFound;
