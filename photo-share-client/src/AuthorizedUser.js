import React, { Component } from 'react'
import { withRouter, NavLink } from 'react-router-dom'
import { Query, Mutation, withApollo } from 'react-apollo'
import { gql } from 'apollo-boost'
import { compose } from 'recompose'
import { ROOT_QUERY } from './App'

// 現在のユーザーを認可するために使用
const GITHUB_AUTH_MUTATION = gql`
    mutation githubAuth($code: String!) {
        githubAuth(code: $code) { token }
    }
`

const Me = ({ logout, requestCode, signingIn }) =>
    // ROOT_QUERYから現在のユーザーに課するデータを取得
    <Query query={ROOT_QUERY}>
        {({ loading, data }) => data.me ?
            <CurrentUser {...data.me} logout={logout} /> :
            loading ?
                <p>loading...</p> :
                <button
                    onClick={requestCode}
                    disabled={signingIn}>
                    Sign In with GitHub
                </button>
        }
    </Query>

const CurrentUser = ({ name, avatar, logout }) =>
    <div>
        <img src={avatar} width={48} height={48} alt="" />
        <h1>{name}</h1>
        <button onClick={logout}>logout</button>
        <NavLink to="/newPhoto">Post Photo</NavLink>
    </div>

class AuthorizedUser extends Component {
    state = { signingIn: false }

    authorizationComplete = (cache, { data }) => {
        localStorage.setItem('token', data.githubAuth.token)
        this.props.history.replace('/')
        this.setState({ signingIn: false })
    }

    componentDidMount() {
        if (window.location.search.match(/code=/)) {
            this.setState({ signingIn: true })
            const code = window.location.search.replace("?code=", "")
            this.githubAuthMutation({ variables: {code} })
        }
    }

    logout = () => {
        localStorage.removeItem('token')
        let data = this.props.client.readQuery({ query: ROOT_QUERY })
        data.me = null
        this.props.client.writeQuery({ query: ROOT_QUERY, data })
    }

    requestCode() {
        const clientID = process.env.REACT_APP_CLIENT_ID
        window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`
    }

    render() {
        return (
            // <Query query={ME_QUERY}>
            //     {({ loading, data }) => data.me ?
            //         <div>
            //             <img src={data.me.avatar_url} width={48} height={48} alt="" />
            //             <button onClick={this.logout}>logout</button>
            //             <NavLink to="/newPhoto">Post Photo</NavLink>
            //         </div> :
            //     }
            // </Query>
            <Mutation
                mutation={GITHUB_AUTH_MUTATION}
                update={this.authorizationComplete}
                refetchQueries={[{ query: ROOT_QUERY }]}>
                {mutation => {
                    this.githubAuthMutation = mutation
                    return (
                        <Me sigingIn={this.state.signingIn}
                            requestCode={this.requestCode}
                            logout={() => localStorage.removeItem('token')} />
                    )
                }}
            </Mutation>
        )
    }
}

// withApollo は Apollo Client をプロパティに追加、
// withRouter はルーターのプロパティにhistoryを追加
export default compose(withApollo, withRouter)(AuthorizedUser)