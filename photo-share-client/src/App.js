import React, { Component, Fragment } from 'react'
import Users from './Users'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import { gql } from 'apollo-boost'
import AuthorizedUser from './AuthorizedUser'
import Photos from "./Photos"
import PostPhoto from "./PostPhoto"
import { withApollo } from 'react-apollo'

export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    allUsers { ...userInfo }
    me { ...userInfo }
    allPhotos {
        id
        name
        url
    }
  }
  
  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`

const LISTEN_FOR_USERS = gql`
    subscription {
        newUser {
            githubLogin
            name
            avatar
        }
    }
`

const LISTEN_FOR_PHOTOS = gql`
    subscription {
        newPhoto {
            id
            name
            url
        }
    }
`

class App extends Component {
    componentDidMount() {
        let { client } = this.props
        this.listenForUsers = client
            .subscribe({ query: LISTEN_FOR_USERS })
            .subscribe(({ data: { newUser } }) => {
                const data = client.readQuery({ query: ROOT_QUERY })
                data.totalUsers += 1
                data.allUsers = [
                    ...data.allUsers,
                    newUser
                ]
                client.writeQuery({ query: ROOT_QUERY, data })
            })
        this.listenForPhotos = client
            .subscribe({ query: LISTEN_FOR_PHOTOS })
            .subscribe(({ data: { newPhoto } }) => {
                const data = client.readQuery({ query: ROOT_QUERY })
                data.totalPhotos += 1
                data.allPhotos = [
                    ...data.allPhotos,
                    newPhoto
                ]
                client.writeQuery({ query: ROOT_QUERY, data })
            })
    }

    // アンマウントすると購読停止
    componentWillUnmount() {
        this.listenForUsers.unsubscribe()
    }

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={() =>
                        <Fragment>
                            <AuthorizedUser />
                            <Users />
                            <Photos/>
                        </Fragment>
                    } />
                    <Route path="/newPhoto" component={PostPhoto} />
                    {/*ルートが識別できない場合*/}
                    <Route component={({ location }) =>
                        <h1>"{location.pathname}" not found</h1>
                    } />
                </Switch>
            </BrowserRouter>
        )
    }
}

// プロパティを通してアプリにクライアントを渡す
export default withApollo(App)