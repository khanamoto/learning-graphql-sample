// appllo-serverモジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

// スキーマ（データ要件）
const typeDefs = `
    type Query {
        totalPhotos: Int!
    }
`

// リゾルバ（データ取得）
const resolvers = {
    Query: {
        totalPhotos: () => 42
    }
}

// サーバーのインスタンスを作成
// その際、typeDefs（スキーマ）とリゾルバを引数に取る
const server = new ApolloServer({
    typeDefs,
    resolvers
})

// Webサーバーを起動
server
    .listen()
    .then(({url}) => console.log(`GraphQL Service running on ${url}`))