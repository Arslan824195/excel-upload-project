const initial_state = {};

const GetUser = (state = initial_state, action) =>
{
    const { type, payload } = action;

    switch (type)
    {
        case "SET_USER":
            return payload;
        default:
            return state;
    }
}

export default GetUser;