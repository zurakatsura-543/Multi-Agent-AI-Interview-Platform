import {
  initializeApp
} from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "demointerview-d4566.firebaseapp.com",
  projectId: "demointerview-d4566",
  storageBucket: "demointerview-d4566.firebasestorage.app",
  messagingSenderId: "1086938642130",
  appId: "1:1086938642130:web:f8c9de98ce07f78717df0b"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {
  auth,
  provider
}