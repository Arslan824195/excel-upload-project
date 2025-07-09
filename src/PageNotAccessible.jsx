const PageNotAccessible = () => 
{
    return (
        <div id = "invalid">
            <div className = "invalid">
                <div className = "invalid-code">
                    <h1>403</h1>
                </div>
                <h2>Page Not Accessible</h2>
                <p>You do not have permission to view this page.</p>
                <a href = "/">Go to Homepage</a>
            </div>
        </div>
    );
}

export default PageNotAccessible;