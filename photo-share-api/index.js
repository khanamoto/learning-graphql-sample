// appllo-serverモジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

// スキーマ（データ要件）
const typeDefs = `
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
    }
    
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }
    
    type Mutation {
        postPhoto(name: String! description: String): Photo!
    }
`

// 1. ユニークIDをインクリメントするための変数
var _id = 0
var photos = []

// リゾルバ（データ取得）
const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },

    // postPhotoミューテーションと対応するリゾルバ
    Mutation: {
        // 引数：親オブジェクト（Mutation）への参照, GraphQL引数（name と description）
        postPhoto(parent, args) {
            // 2. 新しい写真を作成し、idを生成する
            var newPhoto = {
                id: _id++,
                ...args
            }
            photos.push(newPhoto)

            // 3. 新しい写真を返す
            return newPhoto
        }
    },

    // ルートに追加されたリゾルバ = トリビアルリゾルバ
    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`
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