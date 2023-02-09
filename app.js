//To Cointab Software Private Limited Software
// Technologies Used : Node.js,Express.js,sequelize mysql Database
//Name:Shreyas K Poojary
//Status of code : working
//Output screenshots have been attached

//NOTE: I have removed my password from the database please insert your password and database details.

//Query to create database and table for the code to run:
//   create database user; use user; create table users (id int (10), firstName varchar(100), lastName varchar(100), email varchar(100), createdAt varchar(100), updatedAt varchar(100));



const express = require('express');
const Sequelize = require('sequelize');
const axios = require('axios');

const sequelize = new Sequelize('user', 'root', 'ADD YOUR PASSWORD HERE', {
    host: 'localhost',
    dialect: 'mysql'
});
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const User = sequelize.define('user', {
    ID: {
        type: Sequelize.INTEGER
    },
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    }
});

const fetchUsers = async () => {
    try {
        const response = await axios.get('https://randomuser.me/api/?results=100');
        const user = response.data.results.map(user => {
            return {
                firstName: user.name.first,
                lastName: user.name.last,
                email: user.email
            };
        });
        await User.bulkCreate(user);
        console.log('Users have been fetched and stored in the database.');
    } catch (error) {
        let fetchDataFlag = false;

        app.get('/api/fetch-user', (req, res) => {
            if (fetchDataFlag) {
                res.send('Data has already been fetched.');
            } else {
                fetchDataFlag = true;
                fetchUsers().then(() => res.send('Users have been fetched and stored in the database.'));
            }
        });

        console.error(error);
    }


};



const deleteUsers = async () => {
    try {
        await User.destroy({ where: {} });
        console.log('All users have been deleted from the database.');
    } catch (error) {
        console.error(error);
    }
};

const app = express();

app.get('/', (req, res) => {
    res.send(`
      <h1>Home page</h1>
      <button onclick="fetchUsers()">Fetch Users</button>
      <button onclick="deleteUsers()">Delete Users</button>
      <button onclick="location.href='/user'">User Details</button>
  
      <script>
        async function fetchUsers() {
          const response = await fetch('/api/fetch-user');
          console.log(await response.text());
        }
        async function deleteUsers() {
          const response = await fetch('/api/delete-user');
          console.log(await response.text());
        }
      </script>
    `);
});


app.get('/', (req, res) => {
    res.send('This is the home page');
});

app.get('/user-details', (req, res) => {
    User.findAll().then(user => {
        res.send(user);
    });
});

app.get('/api/fetch-user', (req, res) => {
    User.count().then(count => {
        if (count > 0) {
            res.send('Data has already been fetched, cannot fetch again.');
        } else {
            fetchUsers().then(() => res.send('Users have been fetched and stored in the database.'));
        }
    });
});

app.get('/api/delete-user', (req, res) => {
    User.count().then(count => {
        if (count === 0) {
            res.send('Data has already been deleted, cannot delete again.');
        } else {
            deleteUsers().then(() => res.send('All users have been deleted from the database.'));
        }
    });
});

app.get('/user', (req, res) => {
    const limit = 10;
    let offset = 0;
    let filter = '';
    if (req.query.page) {
        offset = (req.query.page - 1) * limit;
    }
    if (req.query.filter) {
        filter = req.query.filter;
    }
    User.findAndCountAll({
        limit,
        offset,
        where: {
            [Sequelize.Op.or]: [
                { firstName: { [Sequelize.Op.like]: `%${filter}%` } },
                { lastName: { [Sequelize.Op.like]: `%${filter}%` } },
                { email: { [Sequelize.Op.like]: `%${filter}%` } }
            ]
        }
    })
        .then(users => {
            res.send(`
                <h1>User Details Page</h1>
                <table>
                    ${users.rows.map(user => `
                        <tr>
                            <td>${user.firstName}</td>
                            <td>${user.lastName}</td>
                            <td>${user.email}</td>
                        </tr>
                    `).join('')}
                </table>
                <div>
                    ${Array(Math.ceil(users.count / limit))
                    .fill(null)
                    .map((_, i) => `
                            <button onclick="location.href='/user?page=${i + 1}&filter=${filter}'">
                                ${i + 1}
                            </button>
                        `)
                    .join('')}
                </div>
                <div>
                    <input type="text" value="${filter}" oninput="updateFilter(this.value)" />
                </div>
                <script>
                    function updateFilter(value) {
                        location.href = '/user?page=1&filter=' + value;
                    }
                </script>
                </tbody>
                </table>
                <button onclick="location.href='/'">Go back to Home Page</button>
            `);
        })
        .catch(error => {
            console.error(error);
            res.send(error.message);
        });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});