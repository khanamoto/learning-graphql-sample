const { authorizeWithGithub } = require('../lib')
const fetch = require('node-fetch')

// ユニークIDをインクリメントするための変数
var _id = 0

module.exports = {
    // 引数：親オブジェクト（Mutation）への参照, GraphQL引数, コンテキストからcurrentUserを取得
    async postPhoto(root, args, { db, currentUser, pubsub }) {
        // コンテキストにユーザーがいなければエラーを投げる
        if (!currentUser) {
            throw new Error('only an authorized user can post a photo')
        }

        // 現在のユーザーのIDとphotoを保存する
        const newPhoto = {
            ...args.input,
            userID: currentUser.githubLogin,
            created: new Date()
        }

        // 新しいphotoを追加して、データベースが生成したIDを取得する
        const { insertedIds } = await db.collection('photos').insert(newPhoto)
        newPhoto.id = insertedIds[0]

        // イベントをパブリッシュ。データをサブスクリプションリゾルバに送信する
        // photo-added イベントを購読しているすべてのハンドラに、新しい写真の詳細を送信する
        pubsub.publish('photo-added', { newPhoto })

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
        const { ops:[user], result } = await db
            .collection('users')
            .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

        result.upserted && pubsub.publish('user-added', { newUser: user })

        // ユーザーデータとトークンを返す
        return { user, token: access_token }
    },

    addFakeUsers: async (root, { count }, { db }) => {
        var randomUserApi = `https://randomuser.me/api/?results=${count}`

        var { results } = await fetch(randomUserApi).then(res => res.json())

        var users = results.map(r => ({
            githubLogin: r.login.username,
            name: `${r.name.first} ${r.name.last}`,
            githubToken: r.login.sha1
        }))

        await db.collection('users').insert(users)

        var newUsers = await db.collection('users')
            .find()
            .sort({ _id: -1 })
            .limit(count)
            .toArray()

        newUsers.forEach(newUser => pubsub.publish('user-added', { newUser }))

        return users
    },

    // フェイクユーザーを認証するために使用するトークンを返すリゾルバ
    async fakeUserAuth(parent, { githubLogin }, { db }) {
        var user = await db.collection('users').findOne({ githubLogin })

        if (!user) {
            throw new Error(`Cannot find user with githubLogin "${githubLogin}"`)
        }

        return {
            token: user.githubToken,
            user
        }
    }
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
