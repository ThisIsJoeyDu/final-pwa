// import { get } from "http";
import TasksDB from "./tasks-db.js";

var tasks = [];

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

$('document').ready(function() {
    // binding add task button
    $('#add-task-button').on('click', addTask);
    // get all tasks
    getAll();
});


// task list page
ons.ready(function() {

});

function createListItem(task) {
    return ons.createElement(
        '<ons-list-item>' +
        '<div class="center">' +
        '<span class="list-item__title">' + task.title + '</span><span class="list-item__subtitle">' + task.des + '</span>' +
        '</div>' +
        '</ons-list-item>'
    );
}

// get all tasks
function getAll() {
    TasksDB.open()
    .then(() => {
        TasksDB.getAll()
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
        })
        .catch((error) => {
            ons.notification.alert(error);
        });
    })

}


var addTask = function() {
    var title = $('#task-title').val();
    let des = $('#task-des').val();

    TasksDB.open()
    .then(() => {
        TasksDB.addNewSong(title, des)
        .then((docRef) => {
            ons.notification.toast('Add success!', { timeout: 1000, animation: 'fall' });
            // clear the input
            $('#task-title').val('');
            $('#task-des').val('');
        })
        .catch((error) => {
            ons.notification.alert(error);
        });
    })
};

//Registering Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}