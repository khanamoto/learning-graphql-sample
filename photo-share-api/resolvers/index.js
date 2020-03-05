const Query = require('./Query')
const Mutation = require('./Mutation')
const Type = require('./Type')

const resolvers = {
    Query,
    Mutation,
    ...Type // JSのスプレッド構文で中身を展開してくれる
}

module.exports = resolvers