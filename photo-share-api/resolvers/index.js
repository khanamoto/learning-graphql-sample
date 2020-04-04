const Query = require('./Query')
const Mutation = require('./Mutation')
const Subscription = require('./Subscription')
const Type = require('./Type')

const resolvers = {
    Query,
    Mutation,
    Subscription,
    ...Type // JSのスプレッド構文で中身を展開してくれる
}

module.exports = resolvers