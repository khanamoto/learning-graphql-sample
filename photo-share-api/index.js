// appllo-serverモジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

// スキーマ（データ要件）
const typeDefs = `
    type Query {
        totalPhotos: Int!
    }
    
    type Mutation {
        postPhoto(name: String! description: String): Boolean!
    }
`

// 写真を格納するための配列を定義する
var photos = []

// リゾルバ（データ取得）
const resolvers = {
    Query: {
        // 写真を格納した配列の長さを返す
        totalPhotos: () => photos.length
    },

    // postPhotoミューテーションと対応するリゾルバ
    Mutation: {
        // 引数：親オブジェクト（Mutation）への参照, GraphQL引数（name と description）
        postPhoto(parent, args) {
            photos.push(args)
            return true
        }
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