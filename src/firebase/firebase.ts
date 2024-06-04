// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// import json from "../data/recipes.json";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const imageStorage = getStorage(app)

// const recipesListRef = ref(database, 'recipes')

// const jsonRecipes = json.recipes

// jsonRecipes.forEach((recipe: any) => {
//   let newRecipesRef = push(recipesListRef)
//   set(newRecipesRef, recipe)}
// )

export { imageStorage, database as default }

// function writeUserData(userId, name) {
//   const db = getDatabase();
//   set(ref(db, 'recipes/' + userId), {
//     username: name
//   });
// }

// writeUserData('234243', 'Ivan')