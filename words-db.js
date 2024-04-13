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

    // save to local storage
    saveToLocalStorage(words) {
        const data = [];
        words.forEach((doc) => {
            const item = doc.data();
            const id = doc.id;
            let word = {
                id: id,
                word: item.word,
                level: item.level,
                url: item.url
            };
            data.push(word);
        });
        // 2. Open a connection to IndexedDB
        const request = indexedDB.open("myDatabase", 1);

        request.onerror = function(event) {
            console.error("IndexedDB error:", event.target.error);
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            
            // 3. Store the data in IndexedDB
            const transaction = db.transaction(["data"], "readwrite");
            const objectStore = transaction.objectStore("data");
            data.forEach(item => {
                const request = objectStore.add(item);
                request.onerror = function(event) {
                    console.error("Error adding item to IndexedDB:", event.target.error);
                };
            });
            
            transaction.oncomplete = function(event) {
                console.log("Data saved to IndexedDB successfully");
            };
        };
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            console.log("Upgrade needed");
            // Create an object store if it doesn't exist
            if (!db.objectStoreNames.contains("data")) {
              db.createObjectStore("data", { keyPath: "id" });
            }
          };

    }

    syncData() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('myDatabase', 1);
      
          request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['data'], 'readonly');
            const objectStore = transaction.objectStore('data');
      
            const getData = objectStore.getAll();
      
            getData.onsuccess = function() {
              const data = getData.result;
              // Send data to Firebase (e.g., using Firebase SDK)
              // Assume you have a function to send data to Firebase
              sendDataToFirebase(data)
                .then(() => {
                  // Data sent successfully, clear data from IndexedDB
                  const clearRequest = objectStore.clear();
                  clearRequest.onsuccess = function() {
                    console.log('Data sent and cleared from IndexedDB');
                    resolve();
                  };
                })
                .catch(error => {
                  console.error('Error sending data to Firebase:', error);
                  reject(error);
                });
            };
          };
        });
      }

     sendDataToFirebase(data) {
        return new Promise((resolve, reject) => {
          // Send data to Firebase (using Firebase SDK or other methods)
          // For example:
          const db = firebase.firestore();
      
          // Loop through the data and save it to Firebase
          data.forEach(item => {
            db.collection('data').add(item);
          });
      
          // Resolve the promise once all data is sent
          resolve();
        });
      }
}

export default new WordsDB();