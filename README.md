# learning-graphql-sample

『初めてのGraphQL ――Webサービスを作って学ぶ新世代API』<br>
https://www.oreilly.co.jp/books/9784873118932/

## MongoDB

```cassandraql
// brew で MongoDB インストール
$ brew tap mongodb/brew
$ brew install mongodb-community

// MongoDB起動
$ brew services start mongodb-community

// コンソール起動
$ mongo

// DB, Collection 作成
// use でDB指定（なければ作成）
> use photo-share-api-db;
> db.createCollection("photos");
> db.createCollection("users");
> show collections;
photos
users
> show dbs;
admin
config
local
photo-share-api-db 
```