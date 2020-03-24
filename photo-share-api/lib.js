const fetch = require('node-fetch')

// GitHub APIのレスポンス
// プロミスを返す
const requestGithubToken = credentials =>
    fetch(
        'https://github.com/login/oauth/access_token',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(credentials)
        }
    )
    .then(res => res.json())
    .catch(error => {
        throw new Error(JSON.stringify(error))
    })

// GitHubトークン取得後、ユーザーのアカウント情報を取得する
// プロミスを返す
const requestGithubUserAccount = token =>
    fetch(`https://api.github.com/user?access_token=${token}`)
        .then(res => res.json())
        // .then(toJSON)
        // .catch(throwError)

const authorizeWithGithub = async credentials => {
    const { access_token } = await requestGithubToken(credentials)
    const githubUser = await requestGithubUserAccount(access_token)
    return { ...githubUser, access_token }
}

module.exports = {authorizeWithGithub}