// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// uncomment to import items.json to db, make sure to delete items in db first
// import json from "../data/items.json";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const imageStorage = getStorage(app)

// uncomment below to import items.json
// add "ref, push, set" to "firebase/database" imports
// const listRef = ref(database, 'items')
// const jsonRecipes = json.items
// jsonRecipes.forEach((item: any) => {
//   let newRef = push(listRef)
//   set(newRef, item)}
// )

export { imageStorage, database as default }

// function writeUserData(userId, name) {
//   const db = getDatabase();
//   set(ref(db, 'recipes/' + userId), {
//     username: name
//   });
// }

// writeUserData('234243', 'Ivan')