module.exports = {
    totalPhotos: (parent, args, { db }) =>
        db.collection(`photos`) // MondoDBコレクションにアクセス
            .estimatedDocumentCount(),

    allPhotos: (parent, args, { db }) =>
        db.collection(`photos`)
            .find()
            .toArray(), // 配列に変換

    totalUsers: (parent, args, { db }) =>
        db.collection(`users`)
            .estimatedDocumentCount(),

    allUsers: (parent, args, { db }) =>
        db.collection(`users`)
            .find()
            .toArray()
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
