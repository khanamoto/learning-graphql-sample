import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { ApolloProvider } from 'react-apollo'
import {
    InMemoryCache,
    ApolloLink,
    ApolloClient,
    split
} from 'apollo-boost'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from "apollo-utilities"
import { persistCache } from "apollo-cache-persist";
import { createUploadLink } from 'apollo-upload-client'

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

const httpLink = createUploadLink({ uri: 'http://localhost:4000/graphql' })

const authLink = new ApolloLink((operation, forward) => {
    // 認可ヘッダーをオペレーションに追加する
    operation.setContext(context => ({
        headers: {
            ...context.headers,
            authorization: localStorage.getItem('token')
        }
    }))
    return forward(operation)
})

// ここのconcat関数はJSのものではなく、リンクを結合するApolloLinkの特殊な関数
const httpAuthLink = authLink.concat(httpLink)

const wsLink = new WebSocketLink({
    uri: 'ws://localhost:4000/graphql',
    options: { reconnect: true }
})

// サブスクリプションならwsLinkを、そうでなければhttpLinkを使用してネットワークを処理する
// split関数は第1引数がtrueなら第2引数を、falseなら第3引数を返す
const link = split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpAuthLink
)

// カスタムリンクを使用する
const client = new ApolloClient({ cache, link })

render(
    <ApolloProvider client = { client }>
        <App />
    </ApolloProvider>,
    document.getElementById('root')
)