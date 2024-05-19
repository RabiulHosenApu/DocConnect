// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQYOqn9eqm4EIK_iJhNfn-RLTkN3K31As",
  authDomain: "docconnect-fef56.firebaseapp.com",
  databaseURL: "https://docconnect-fef56-default-rtdb.firebaseio.com",
  projectId: "docconnect-fef56",
  storageBucket: "docconnect-fef56.appspot.com",
  messagingSenderId: "306330824455",
  appId: "1:306330824455:web:910dc2334a2b32660f9fa2",
  measurementId: "G-YYC67SZBYP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);