const { authorizeWithGithub } = require('../lib')

// ユニークIDをインクリメントするための変数
var _id = 0

module.exports = {
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
    },

    // GitHubからトークンとユーザーアカウントを取得するリゾルバ
    async githubAuth(parent, { code }, { db }) {
        // GitHubからデータを取得する
        // オブジェクトにまとめる
        let {
            message,
            access_token,
            avatar_url,
            login,
            name
        } = await authorizeWithGithub({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code
        })

        // メッセージがある場合は何らかのエラーが発生している
        if (message) {
            throw new Error(message)
        }

        // データを一つのオブジェクトにまとめる
        let latestUserInfo = {
            name,
            githubLogin: login,
            githubToken: access_token,
            avatar: avatar_url
        }

        // 新しい情報をもとにレコードを追加したり更新する
        const { ops:[user] } = await db
            .collection('users')
            .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

        // ユーザーデータとトークンを返す
        return { user, token: access_token }
    },
}

// サンプルデータ
// var photos = [
//     {
//         "id": "1",
//         "name": "Dropping the Heart Chute",
//         "description": "ああああ",
//         "category": "ACTION",
//         "githubUser": "gPlake",
//         "created": "3-28-1977"
//     },
//     {
//         "id": "2",
//         "name": "Enjoying the sunshine",
//         "category": "SELFIE",
//         "githubUser": "sSchmidt",
//         "created": "2-1-1985"
//     },
//     {
//         "id": "3",
//         "name": "Gunbarrel 25",
//         "description": "いいいい",
//         "category": "LANDSCAPE",
//         "githubUser": "sSchmidt",
//         "created": "2018-04-15T19:09:57.308Z"
//     }
// ]
