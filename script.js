// import { get } from "http";
import WordsDB from "./words-db.js";

var words = [];
let swRegistration = null;
window.fn = {};
var apiUrl = '';

//tab change
document.addEventListener('prechange', function(event) {
    document.querySelector('ons-toolbar .center')
      .innerHTML = event.tabItem.getAttribute('label');
      // monitor the tab change
      if(event.index == 0) {
        // refresh the list
        // clear the list
        words = [];
        // get all words
        getAll();
      }
});

// document ready
$('document').ready(function() {
    console.log('document ready');
    //registerServiceWorker; 
    registerServiceWorker(); 
    // binding add task button
    $('#add-task-button').on('click', searchWord);
    $('#add-word').on('click', addWord);
    $('#choose-sel').on('change', (event) => {
        editSelects(event);
    });

    $('#notification-switch').on('change', e => {
        if (e.originalEvent.value) {
            requestAction();
        }
    });
    // get all words
    getAll();
});

function createListItem(item) {
    console.log(item);
    return ons.createElement(
        "<div class='item-container'>" + 
        "<ons-list-item  id='list-item'>" +
        '<div class="center">' +
        '<span class="list-item__title">' + item.word + '</span><span class="list-item__subtitle">' + item.level + '</span>' +
        '</div>' +
        '</ons-list-item>' +
        "</div>"
    );
}

// get all words
function getAll() {
    WordsDB.open()
    .then(() => {
        WordsDB.getAll()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                words.push(doc.data());
            });
            var infiniteList = document.getElementById('infinite-list');
            infiniteList.delegate = {
                createItemContent: function(i) {
                    return createListItem(words[i]);
                },
                countItems: function() {
                    return words.length;
                }
            };
            infiniteList.refresh();
            var listItems = document.querySelectorAll('#list-item');
            listItems.forEach((item, index) => {
                item.addEventListener('click', function() {
                    createAlertDialog(querySnapshot.docs[index]);
                });

                // item.addEventListener('longpress', function() {
                //     console.log('long press');
                // });
            });
            if (words.length == 0) {
                $('#no-data-container').show();
            } else {
                $('#no-data-container').hide();
            }
        })
        .catch((error) => {
            $('#no-data-container').show();
        });
    })

}

var addWord = function() {
    var word = $('#search-input').val();
    if (word == '') {
        ons.notification.toast('Please input the word!', { timeout: 1000, animation: 'fall' });
        return;
    }
    if (apiUrl == '') {
        ons.notification.toast('Please search the word first!', { timeout: 1000, animation: 'fall' });
        return;
    }
    var level = $('#choose-sel').val();
    WordsDB.open()
    .then(() => {
        WordsDB.addNewSong(word, level, apiUrl)
        .then((docRef) => {
            ons.notification.toast('Add success!', { timeout: 1000, animation: 'fall' });
            // clear the input
            $('#search-input').val('');
            $('#choose-sel').val('low');
            apiUrl = '';

            // clear content
            $('#result-container').html('');
        })
        .catch((error) => {
            ons.notification.alert(error);
        });
    })
};

// register service worker
function registerServiceWorker() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            swRegistration = registration;
            // listenMessage();
            navigator.serviceWorker.addEventListener('message', event => {
                // let message = event.data;
                // let titleShow = $('#title-show');
                // titleShow.html(message);
            });
        })
        .catch(error => {
            
        });
    }
}

// get permission for notification
function requestAction() {
    Notification.requestPermission()
    .then(permission => {
        if (permission === 'granted') {
            sendAction();
        }
    });
}

// send notification
function sendAction() {
    if (window.Notification && Notification.permission === 'granted') {
        notification();
    } else if (window.Notification && Notification.permission !== 'denied'){
        Notification.requestPermission(permission => {
            if (permission === 'granted') {
                notification();
            } else {
                ons.notification.alert('you denied the permission');
            }
        });
    } else {
        ons.notification.alert('you denied the permission');
    }
}

function notification(registration) {
    // subscription available
    const options = {
        // title: "Time to learn!",
        body: "Time to learn! You have a new word to learn!",
        icon: './images/192@2x.png',
        actions: [
            { action: 'konw', title: 'Got it!' },
        ],
    };
    swRegistration.showNotification("Time to learn!", options);
}

// alert view
var createAlertDialog = function(doc) {
    var dialog = document.getElementById('my-alert-dialog');
    if (dialog) {
        dialog.show();
    } else {
        ons.createElement('alert-dialog.html', { append: true })
        .then(function(dialog) {
          dialog.show();
          $('#alert-cancel').on('click', alertCancel);
          $('#alert-delete').on('click', () => {
              deleteWord(doc);
          });
        });
    }
};

function alertCancel() {
    hideAlertDialog();
};

function hideAlertDialog() {
    document
      .getElementById('my-alert-dialog')
      .remove();
}

function deleteWord(doc) {
    hideAlertDialog();
    WordsDB.open()
    .then(() => {
        WordsDB.remove(doc)
        .then(() => {
            ons.notification.toast('Delete success!', { timeout: 1000, animation: 'fall' });
            words = [];
            getAll();
        })
        .catch((error) => {
            ons.notification.toast(error, { timeout: 1000, animation: 'fall' });
        });
    });
}



function searchWord() {
    if (document.getElementById('search-input').value.trim() === '') {
      displayError('Error: Please enter a word to search.');
      return;
    }
    var word = document.getElementById('search-input').value.trim().toLowerCase();
    apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + word;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        displayResult(data);
      })
      .catch(error => {
        displayError('Error: Unable to fetch data. Please try again later.');
      });
  }

  function displayResult(data) {
    var resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (data.length === 0) {
      resultContainer.textContent = 'No definition found.';
      return;
    }

    var meanings = data[0].meanings;
    var word = data[0].word;

    var heading = document.createElement('h2');
    heading.textContent = word;
    resultContainer.appendChild(heading);

    meanings.forEach(meaning => {
      var partOfSpeech = meaning.partOfSpeech;
      var definition = meaning.definitions[0].definition;

      var definitionElement = document.createElement('p');
      definitionElement.textContent = partOfSpeech + ': ' + definition;
      resultContainer.appendChild(definitionElement);
    });
  }

  function displayError(message) {
    var resultContainer = document.getElementById('result-container');
    resultContainer.textContent = message;
  }


  function editSelects(event) {
    document.getElementById('choose-sel').removeAttribute('modifier');
    if (event.target.value == 'low' || event.target.value == 'normal' || event.target.value == 'high') {
      document.getElementById('choose-sel').setAttribute('modifier', event.target.value);
    }
  }