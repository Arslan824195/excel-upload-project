const broadcastChannel = new BroadcastChannel("logout-modal-sync");

export const sendBroadcastMessage = (channel, message) => 
{
    broadcastChannel.postMessage({ channel, message });
};

export const listenBroadcastMessage = (channel, callback) => 
{
    const listener = (event) =>
    {
        if (event.data.channel === channel) 
        {
            callback(event.data.message);
        }
    };

    broadcastChannel.addEventListener("message", listener);
    return { unsubscribe: () => broadcastChannel.removeEventListener("message", listener) };
};