const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)
const expressPlayground = require(`graphql-playground-middleware-express`).default
const { readFileSync } = require(`fs`) // node.jsのモジュール

// スキーマ（データ要件）
const typeDefs = readFileSync(`./typeDefs.graphql`, `UTF-8`)
// リゾルバ（データ取得）
const resolvers = require(`./resolvers`)


// Expressアプリを作成する
var app = express()

// サーバのインスタンスを作成
const server = new ApolloServer({ typeDefs, resolvers })

// Expressにミドルウェアを追加する
server.applyMiddleware({ app })

// ホームルートを作成する
app.get(`/`, (req, res) => res.end(`Welcome to the PhotoShare API`))
app.get(`/playground`, expressPlayground({ endpoint: `/graphql` }))

// 特定のポートでリッスンする
app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Service running @ http://localhost:4000${server.graphqlPath}`)
)