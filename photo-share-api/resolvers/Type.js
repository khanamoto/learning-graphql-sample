const { GraphQLScalarType } = require(`graphql`)

// フィールドが日付の値を返すたびに、その値をISO形式の文字列としてシリアライズする
const serialize = value => new Date(value).toISOString()
// クエリとともに送られてくる文字列の値をパースする
const parseValue = value => new Date(value)
// クエリドキュメントに直接追加された日付の値を取得する
const parseLiteral = ast => ast.value

module.exports = {
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

// サンプルデータ
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
