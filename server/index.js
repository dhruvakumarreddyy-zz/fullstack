const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db');
const morgan = require('morgan');
const { graphqlHTTP } = require('express-graphql');
const { graphql, buildSchema } = require('graphql');
require('dotenv').config();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const schema = buildSchema(`
  type Query {
    todo(todo_id: Int!): Todo
  }

  type Todo{
    todo_id : Int
    description: String
  }
`);

const root = {
  todo: (args) => ({
    todo_id: args.todo_id,
    description: 'welcome to todo',
  }),
};

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

// routes
// try {
//   const { description } = req.body;
//   const newTodo = await pool.query(
//     'INSERT INTO todo (description) VALUES($1)',
//     [description]
//   );
//   res.json(newTodo);
// } catch (err) {
//   console.error(err.msg);
// }

// app.use(morgan('heya'));

//get all todos
app.get('/api/v1/todos', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM todo');
    console.log(results);
    res.status(200).json({
      status: 'success',
      results: results.rows.length,
      data: {
        todos: results.rows,
      },
    });
  } catch (err) {
    console.error(err.msg);
  }
});
// get a todo
app.get('/api/v1/todos/:id', async (req, res) => {
  try {
    const results = await db.query('select * from todo where todo_id = $1', [
      req.params.id,
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        todo: results.rows[0],
      },
    });
  } catch (err) {
    err.msg;
  }
});

//create a todo
app.post('/api/v1/todos', async (req, res) => {
  try {
    const results = await db.query(
      'INSERT INTO todo (description) values($1) returning *',
      [req.body.description]
    );
    console.log(results);
    res.status(201).json({
      status: 'success',
      data: {
        description: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.msg);
  }
});
//update a todo
app.put('/api/v1/todos/:id', async (req, res) => {
  try {
    const results = await db.query(
      'UPDATE todo SET description = $1 where todo_id = $2 returning *',
      [req.body.description, req.params.id]
    );
    console.log(results);
    res.status(201).json({
      status: 'success',
      data: {
        description: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.msg);
  }
});
//delete a todo
app.delete('/api/v1/todos/:id', async (req, res) => {
  try {
    const results = await db.query('DELETE FROM todo where todo_id = $1', [
      req.params.id,
    ]);
    res.status(204).json({ status: 'success' });
  } catch (err) {
    console.error(err.msg);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
