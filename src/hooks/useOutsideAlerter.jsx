import { useEffect, useState } from 'react';

const useOutsideAlerter = (ref) =>
{
    const [isOutsideClick, setIsOutsideClick] = useState(false);

    useEffect(() => 
    {
        const handleClickOutside = (event) =>
        {
            if (ref?.current && !ref.current?.contains(event.target)) 
            {
                setIsOutsideClick(true);
            }
            else
            {
                setIsOutsideClick(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => 
        {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [ref]);

    return isOutsideClick;
}

export default useOutsideAlerter;