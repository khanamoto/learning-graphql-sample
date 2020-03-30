import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { ApolloProvider } from 'react-apollo'
import ApolloClient, { InMemoryCache } from 'apollo-boost'
import { persistCache } from "apollo-cache-persist";

const cache = new InMemoryCache()
persistCache({
    cache,
    storage: localStorage
})

// 起動時にすでにキャッシュがあるかどうか確認
// もしキャッシュがあれば、クライアントを作成する前にそのデータでローカルのキャッシュを初期化する
if (localStorage['apollo-cache-persist']) {
    let cacheData = JSON.parse(localStorage['apollo-cache-persist'])
    cache.restore(cacheData)
}

const client = new ApolloClient({
    cache,
    uri: 'http://localhost:4000/graphql',
    request: operation => {
        operation.setContext(context => ({
            headers: {
                ...context.headers,
                // トークンがない場合は単純にnullになる
                authorization: localStorage.getItem('token')
            }
        }))
    }
})

render(
    <ApolloProvider client = { client }>
        <App />
    </ApolloProvider>,
    document.getElementById('root')
)