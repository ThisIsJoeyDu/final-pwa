import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';


class WordsDB {
    constructor() {
        this.db = null;
        this.isAvailable = false;
    }

    // open database
    open() {
        return new Promise((resolve, reject) => {
            try {
                // For Firebase JS SDK v7.20.0 and later, measurementId is optional
                const firebaseConfig = {
                    apiKey: "AIzaSyA-esOOUu1E24BKXrFi-Y6uQqPXcaBACXQ",
                    authDomain: "mypwa-1551a.firebaseapp.com",
                    databaseURL: "https://mypwa-1551a-default-rtdb.firebaseio.com",
                    projectId: "mypwa-1551a",
                    storageBucket: "mypwa-1551a.appspot.com",
                    messagingSenderId: "762241293743",
                    appId: "1:762241293743:web:9e65eb42e5b67c6b2ca35a",
                    measurementId: "G-YLKWXL8C76"
                };
            
                const app = initializeApp(firebaseConfig);
                const db = getFirestore(app);
                if (db) {
                    this.db = db;
                    this.isAvailable = true;
                    resolve();
                } else {
                    reject('No database');
                }
            }
            catch (error) {
                reject(error.message);
            }
        });
   
    }

    //add new song
    addNewSong(word, level, url) {
        return new Promise((resolve, reject) => {
            const dbCollection = collection(this.db, "vocabulary");
            addDoc(dbCollection, {
                word: word,
                level: level,
                url: url
            })
            .then((docRef) => {
                resolve(docRef);
            })
            .catch((error) => {
                reject(error.message);
            });
         });
    }

    // get all songs
    getAll() {
        return new Promise((resolve, reject) => {
            const dbCollection = collection(this.db, "vocabulary");
            getDocs(dbCollection)
            .then((querySnapshot) => {
                resolve(querySnapshot);
            })
            .catch((error) => {
                reject(error.message);
            });
        });
    }

    // delete word
    remove(item) {
        return new Promise((resolve, reject) => {
            const dbCollection = collection(this.db, "vocabulary");
            const docRef = doc(dbCollection, item.id);
            deleteDoc(docRef)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error.message);
            });
        });
    }
}

export default new WordsDB();