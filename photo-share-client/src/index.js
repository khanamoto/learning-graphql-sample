import ApolloClient, { gql } from 'apollo-boost'

const client = new ApolloClient({ uri: 'http://localhost:4000/graphql' })

const query = gql`
    {
        totalUsers
        totalPhotos
    }
`

// クライアントを利用してクエリを送信する
// client.query({ query })
//     .then(({ data }) => console.log('data', data))
//     .catch(console.log)

// クエリを送信する前にキャッシュを確認し、
console.log('cache', client.extract())
// クエリが解決されたあとでもう一度キャッシュを見てみる
client.query({ query })
    .then(() => console.log('cache', client.extract()))
    .catch(console.log)