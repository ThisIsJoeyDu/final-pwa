// import { get } from "http";
import WordsDB from "./words-db.js";

var tasks = [];
let swRegistration = null;
window.fn = {};

//tab change
document.addEventListener('prechange', function(event) {
    document.querySelector('ons-toolbar .center')
      .innerHTML = event.tabItem.getAttribute('label');
      // monitor the tab change
      if(event.index == 0) {
        // refresh the list
        // clear the list
        tasks = [];
        // get all tasks
        getAll();
      }
});

// document ready
$('document').ready(function() {
    //registerServiceWorker; 
    registerServiceWorker(); 
    // binding add task button
    $('#add-task-button').on('click', searchWord);
    $('#notification-switch').on('change', e => {
        if (e.originalEvent.value) {
            requestAction();
        }
    });
    // get all tasks
    getAll();
});

function createListItem(task) {
    return ons.createElement(
        "<div class='item-container'>" + 
        "<ons-list-item  id='list-item'>" +
        '<div class="center">' +
        '<span class="list-item__title">' + task.title + '</span><span class="list-item__subtitle">' + task.des + '</span>' +
        '</span><span class="list-item__subtitle">' + task.date + '</span>' +
        '</div>' +
        '</ons-list-item>' +
        "</div>"
    );
}

// get all tasks
function getAll() {
    WordsDB.open()
    .then(() => {
        WordsDB.getAll()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                tasks.push(doc.data());
            });
            var infiniteList = document.getElementById('infinite-list');
            infiniteList.delegate = {
                createItemContent: function(i) {
                    return createListItem(tasks[i]);
                },
                countItems: function() {
                    return tasks.length;
                }
            };
            infiniteList.refresh();
            var listItems = document.querySelectorAll('#list-item');
            listItems.forEach((item, index) => {
                item.addEventListener('click', function() {
                    createAlertDialog(querySnapshot.docs[index]);
                });
            });

            console.log(tasks);
            if (tasks.length == 0) {
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
    var title = $('#task-title').val();
    let des = $('#task-des').val();
    let date = $('#task-date').val();

    if (title == '') {
        ons.notification.alert('Title is required!');
        return;
    }

    if (des == '') {
        ons.notification.alert('Description is required!');
        return;
    }

    if (date == '') {
        ons.notification.alert('Date is required!');
        return;
    }

    WordsDB.open()
    .then(() => {
        WordsDB.addNewSong(title, des, date)
        .then((docRef) => {
            ons.notification.toast('Add success!', { timeout: 1000, animation: 'fall' });
            // clear the input
            $('#task-title').val('');
            $('#task-des').val('');
            $('#task-date').val('');
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
                let message = event.data;
                let titleShow = $('#title-show');
                titleShow.html(message);
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
    const title = $('#title').val();
    const body = $('#body').val();
    const options = {
        body: body,
        icon: './images/192@2x.png',
        actions: [
            { action: 'agree', title: 'Agree' },
            { action: 'disagree', title: 'Disagree' }
        ]
    };
    swRegistration.showNotification(title, options);
}

// alert view
var createAlertDialog = function(doc) {
    console.log(doc);
    var dialog = document.getElementById('my-alert-dialog');
    if (dialog) {
        dialog.show();
    } else {
        ons.createElement('alert-dialog.html', { append: true })
        .then(function(dialog) {
          dialog.show();
          $('#alert-cancel').on('click', alertCancel);
          $('#alert-delete').on('click', () => {
              deleteTask(doc);
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

function deleteTask(doc) {
    hideAlertDialog();
    TasksDB.open()
    .then(() => {
        TasksDB.remove(doc)
        .then(() => {
            ons.notification.toast('Delete success!', { timeout: 1000, animation: 'fall' });
            tasks = [];
            getAll();
        })
        .catch((error) => {
            ons.notification.toast(error, { timeout: 1000, animation: 'fall' });
        });
    });
}



function searchWord() {
    var word = document.getElementById('word-input').value.trim().toLowerCase();
    var apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + word;

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
        console.error('There was a problem with the fetch operation:', error);
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
    if (event.target.value == 'material' || event.target.value == 'underbar') {
      document.getElementById('choose-sel').setAttribute('modifier', event.target.value);
    }
  }
  function addOption(event) {
    const option = document.createElement('option');
    var text = document.getElementById('optionLabel').value;
    option.innerText = text;
    text = '';
    document.getElementById('dynamic-sel').appendChild(option);
  }