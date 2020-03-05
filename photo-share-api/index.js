// appllo-serverモジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

// スキーマ（データ要件）
const typeDefs = `
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
    }
    
    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }
    
    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
    }
    
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }
    
    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }
`

// ユニークIDをインクリメントするための変数
var _id = 0
// var photos = []


// 一時的なサーバテストのためのサンプルデータ
var users = [
    { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
    { "githubLogin": "gPlake", "name": "Glen Plake" },
    { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
]

var photos = [
    {
        "id": "1",
        "name": "Dropping the Heart Chute",
        "description": "ああああ",
        "category": "ACTION",
        "githubUser": "gPlake"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt"
    },
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "いいいい",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt"
    }
]



// リゾルバ（データ取得）
const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },

    // postPhotoミューテーションと対応するリゾルバ
    Mutation: {
        // 引数：親オブジェクト（Mutation）への参照, GraphQL引数
        postPhoto(parent, args) {
            // 新しい写真を作成し、idを生成する
            var newPhoto = {
                id: _id++,
                ...args.input
            }
            photos.push(newPhoto)

            // 新しい写真を返す
            return newPhoto
        }
    },

    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser)
        }
    },

    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
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