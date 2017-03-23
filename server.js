const app = require('express')();
const express = require('express')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const firstTodos = require('./data');
let Todo = require('./todo');
Todo = Todo.Todo;

console.log('Waiting for clients to connect');
server.listen(3030);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // FIXME: DB is reloading on client refresh. It should be persistent on new client connections from the last time the server was run...
    const DB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title=t.title);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        server.emit('load', DB);
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);

        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        reloadTodos();
    });

    // Send the DB downstream on connect
    reloadTodos();
});
