const { ApolloServer, PubSub } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs') // node.jsのモジュール
const { MongoClient } = require('mongodb')
const { createServer } = require('http')
const path = require('path')
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

    // pubsubインスタンスを作成
    const pubsub = new PubSub()
    // サーバのインスタンスを作成
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req, connection }) => {
            const githubToken = req ? req.headers.authorization : connection.context.Authorization
            const currentUser = await db.collection('users').findOne({ githubToken })
            return { db, currentUser, pubsub }
        }
    })

    // Expressにミドルウェアを追加する
    server.applyMiddleware({ app })

    // ホームルートを作成する
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
    app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

    // /img/photos へのHTTPリクエストに対して、 assets/photos 内の静的ファイルを提供する
    app.use(
        '/img/photos',
        express.static(path.join(__dirname, 'assets', 'photos'))
    )

    const httpServer = createServer(app)
    // Apollo Server が WebSocket を使用したサブスクリプションをサポートするのに必要なハンドラを追加
    server.installSubscriptionHandlers(httpServer)

    httpServer.listen({ port: 4000 }, () =>
        console.log(`GraphQL Service running at localhost:4000${server.graphqlPath}`)
    )
}

// 実行（DB接続）
start()
