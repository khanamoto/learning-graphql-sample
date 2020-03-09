const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs') // node.jsのモジュール
const { MongoClient } = require('mongodb')
require('dotenv').config()

// スキーマ（データ要件）
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')
// リゾルバ（データ取得）
const resolvers = require('./resolvers')

// 非同期関数を作成する
async function start() {
    // Expressアプリを作成する
    const app = express()
    const MONGO_DB = process.env.DB_HOST

    const client = await MongoClient.connect(
        MONGO_DB,
        { useNewUrlParser: true }
    )
    const db = client.db()

    const context = { db }

    // サーバのインスタンスを作成
    const server = new ApolloServer({ typeDefs, resolvers, context })

    // Expressにミドルウェアを追加する
    server.applyMiddleware({ app })

    // ホームルートを作成する
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
    app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

    // 特定のポートでリッスンする
    app.listen({ port: 3000 }, () =>
        console.log(`GraphQL Service running @ http://localhost:3000${server.graphqlPath}`)
    )
}

// 実行（DB接続）
start()
