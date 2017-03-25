const server = io();
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    console.warn(event);
    const input = document.getElementById('todo-input');

    // Emit the new todo as some data to the server
    server.emit('make', {
        title : input.value
    });
    // Clear the input
    input.value = '';
}

function remove(val) {
    server.emit('remove', {
        title: val.title
    })
}

function done(id) {
    document.getElementById(id).style.color = 'green';
}

function completeAll() {
    document.body.style.color = 'green';
}

function render(todo) {
    let doneButton = document.createElement('button');
    doneButton.onclick = () => {done(todo.title)}
    let submitText = document.createTextNode('Done');
    doneButton.appendChild(submitText);

    let removeButton = document.createElement('button');
    removeButton.onclick = () => {remove(todo)}
    let removeText = document.createTextNode('Remove');
    removeButton.appendChild(removeText);

    const listItem = document.createElement('div');
    const listItemText = document.createTextNode(todo.title);
    listItem.id = todo.title;
    listItem.appendChild(listItemText);
    list.append(doneButton);
    list.append(removeButton);
    list.append(listItem);
    list.append(document.createElement('br'))
}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    document.getElementById("todo-list").innerHTML = "";
    todos.forEach((todo) => render(todo));
});

// Reload new event from server
server.on('new', (item) => {
  render(item)
})
