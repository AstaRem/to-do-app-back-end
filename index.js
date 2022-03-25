const express = require("express");
const app = express();
const pool = require("./db");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

app.use(express.json()); //req.body it is the only way how

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js API project for PostgreSQL",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//ROUTES//

//get all todos
/**
 * @swagger
 * /todos:
 *  get:
 *      summary: This api is used to get all items from todo_database, todo table
 *      description: This api is used to get all items from todo_database, todo table
 *      responses:
 *          200:
 *              description: to get all items from Postgres database
 *
 *
 */
app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todo");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo
/**
 * @swagger
 * /todos/{id}:
 *  get:
 *   summary: This api is used to get one item from todo_database, todo table
 *   description: This api is used to get all items from todo_database, todo table
 *   responses:
 *    200:
 *      description: to get one items from Postgres database
//  *      parameters:       as soon as I add these lines here, on UI this get request dissapears. why? 
//  *      -in: path         also, example for this path, get request does not work on Ui, unless I enter 
//  *       name: id          number as id in the path (on the second line of this comment)
//  *       schema:
//  *          type:string
 *
 *
 *
 *
 */

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
      id,
    ]);
    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//create a todo

/**
 * @swagger
 * /todos
 *  post:
 *      summary: This api is used to get one item from todo_database, todo table
 *      description: This api is used to get all items from todo_database, todo table
 *      responses:
 *          201:
 *              description: to get one items from Postgres database
 *
 */

app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo (description) VALUES ($1) RETURNING *",
      [description]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//update a todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params; // this will be used for WHERE
    const { description } = req.body; //this will be used for SET
    const updateToDo = await pool.query(
      "UPDATE todo SET description = $1 WHERE todo_id = $2", //$1 means first argument, $2 - second argument
      [description, id]
    );
    res.json("Todo was updated");
  } catch (err) {
    console.error(err.message);
  }
});

//delete a todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [
      id,
    ]);
    res.json("Todo was successfully deleted");
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
