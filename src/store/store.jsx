import { configureStore } from '@reduxjs/toolkit';
import { createTransform, persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import CryptoJS from 'crypto-js';
import rootReducer from '../reducers';

// Ensure you have the secret key defined in your environment variables
const secretKey = import.meta.env.VITE_REDUX_SECRET_KEY;

const encryptionTransformer = createTransform(
  (inboundState) => {
    // Encrypt the state before storing it
    const stringifiedState = JSON.stringify(inboundState);
    const encryptedState = CryptoJS.AES.encrypt(stringifiedState, secretKey).toString();
    return encryptedState;
  },
  (outboundState) => {
    // Decrypt the state when retrieving it
    const bytes = CryptoJS.AES.decrypt(outboundState, secretKey);
    const decryptedState = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedState);
  }
);

const persistConfig = { 
  key: "root", 
  storage, 
  whitelist: ["user"], 
  transforms: [encryptionTransformer]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({ 
      serializableCheck: false,
      immutableCheck: false
    }),
    devTools: false
});

export const persistor = persistStore(store);