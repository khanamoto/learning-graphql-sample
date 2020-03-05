// appllo-serverモジュールを読み込む
const { ApolloServer } = require(`apollo-server`)
const { GraphQLScalarType } = require(`graphql`)

// スキーマ（データ要件）
const typeDefs = `
    scalar DateTime
    
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos: [Photo!]!
    }

    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
        created: DateTime!
    }

    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    type Query {
        totalPhotos: Int!
        allPhotos(after: DateTime): [Photo!]!
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
        "githubUser": "gPlake",
        "created": "3-28-1977"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created": "2-1-1985"
    },
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "いいいい",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "created": "2018-04-15T19:09:57.308Z"
    }
]
var tags = [
    { "photoID": "1", "userID": "gPlake" },
    { "photoID": "2", "userID": "sSchmidt" },
    { "photoID": "3", "userID": "mHattrup" },
    { "photoID": "4", "userID": "gPlake" },
]



// フィールドが日付の値を返すたびに、その値をISO形式の文字列としてシリアライズする
const serialize = value => new Date(value).toISOString()
// クエリとともに送られてくる文字列の値をパースする
const parseValue = value => new Date(value)
// クエリドキュメントに直接追加された日付の値を取得する
const parseLiteral = ast => ast.value

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
                ...args.input,
                created: new Date()
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
        },
        // 対象の写真以外の写真を除外し、フィルタリングされたリストを実際のUserオブジェクトの配列にマッピングする
        taggedUsers: parent => tags
            .filter(tag => tag.photoID === parent.id) // 対象の写真が関係しているタグの配列を返す
            .map(tag => tag.userID) // タグの配列をユーザーIDの配列に変換する
            .map(userID => users.find(u => u.githubLogin === userID)) // ユーザーIDの配列をユーザーオブジェクトの配列に変換する
    },

    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
        },
        // ユーザーごとにタグをフィルタリングし、ユーザータグを実際のPhotoオブジェクトの配列にマッピングする
        inPhotos: parent => tags
            .filter(tag => tag.userID === parent.id) // 対象のユーザーが関係しているタグの配列を返す
            .map(tag => tag.photoID) // タグの配列を写真IDの配列に変換する
            .map(photoID => photos.find(p => p.id === photoID)) // 写真IDの配列を写真オブジェクトの配列に変換する
    },

    DateTime: new GraphQLScalarType({
        name: `DateTime`,
        description: `A valid date time value.`,
        serialize: serialize,
        parseValue: parseValue,
        parseLiteral: parseLiteral
    })
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