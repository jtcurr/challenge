const app = require('express')();
const express = require('express')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const firstTodos = require('./data');
let Todo = require('./todo');
Todo = Todo.Todo;

console.log('Waiting for clients to connect');
server.listen(3030);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

io.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // FIXME: DB is reloading on client refresh. It should be persistent on new client connections from the last time the server was run...
    const DB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title=t.title);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        io.emit('load', DB);
    }

    const updateJSON = () => {
        fs.writeFile('data.json', JSON.stringify(DB), (err) => {
            if(err) {
                console.log('ERROR WRITING TO JSON', err)
            } else {
                console.log('Success')
            }
        })
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);

        // Push this newly created todo to our database
        DB.push(newTodo);

        updateJSON();

        // Send the latest todos to the client
        io.emit('new', DB[DB.length-1]);
    });

    client.on('remove', (item) => {
        for(var i = 0; i < DB.length; i++) {
            if (DB[i].title === item.title) {
              DB.splice(i, 1);
            }
        }
        updateJSON();
        reloadTodos();
    })

    // Send the DB downstream on connect
    reloadTodos();
});
