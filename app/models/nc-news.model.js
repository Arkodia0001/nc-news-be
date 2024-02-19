const db = require('../../db/connection')
const fs = require('fs/promises')

exports.selectTopics = () => {
    return db.query('SELECT * FROM topics')
    .then(({rows}) => {
        return rows;
    })
}

exports.selectEndpoints = () => {
    return fs.readFile(`${__dirname}/../../endpoints.json`, 'utf-8').then((endpoints)=> {
        const endpointFileData = JSON.parse(endpoints)
        return endpointFileData
    })
}