import Logo from '../assets/logo.svg';

const Loader = () => 
{
    return (
        <div className = "loader d-flex flex-column align-items-start justify-content-center">
            <img src = {Logo} alt = "Logo" />

            <h6 className = "p-0 mb-0 bg-transparent">
                Loading
                <span className = "dot"></span>
                <span className = "dot"></span>
                <span className = "dot"></span>
            </h6>
        </div>
    )
}

export default Loader;