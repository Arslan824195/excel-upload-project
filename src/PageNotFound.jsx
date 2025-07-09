const PageNotFound = () => 
{
    return (
        <div id = "invalid">
            <div className = "invalid">
                <div className = "invalid-code">
                    <h1>404</h1>
                </div>
                <h2>Page Not Found</h2>
                <p>The page you are looking for might have been removed, had its name changed or be temporarily unavailable.</p>
                <a href = "/">Go to Homepage</a>
            </div>
        </div>
    );
}

export default PageNotFound;