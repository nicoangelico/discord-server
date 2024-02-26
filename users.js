// mock database
const users = [
    {
        _id: 'user1234',
        name: 'Nicolas'
    },
    {
        _id: 'user5678',
        name: 'Facundo'
    },
    {
        _id: 'user9012',
        name: 'Ezequiel'
    },
    {
        _id: 'user3456',
        name: 'Nazareth'
    },
];

// mock logged user
const loggedUser = {
    _id: 'user1234',
    name: 'Nicolas'
}

module.exports = {
    users: users,
    loggedUser: loggedUser
};