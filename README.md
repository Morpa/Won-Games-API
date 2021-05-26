<h1 align="center">Won Games Api</h1>

<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/Morpa/Won-Games-API?color=56BEB8">

  <img alt="Github language count" src="https://img.shields.io/github/languages/count/Morpa/Won-Games-API?color=56BEB8">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/Morpa/Won-Games-API?color=56BEB8">

</p>

<hr>

# React Avançado - Won Games API

This is the API to create the Won Games Store from [React Avançado course](https://reactavancado.com.br/).

## Requirements

This project uses [PostgreSQL](https://www.postgresql.org/), so, in order to make it working, install in your local machine or use Docker.

The configuration to the Database can be found on [config/database.js](config/database.js)

## Development

After cloning this project, install the dependencies:

```
yarn install
```

And run using:

```
yarn develop
```

The urls to access are:

- `http://localhost:1337/admin` - The Dashboard to create and populate data
- `http://localhost:1337/graphql` - GraphQL Playground to test your queries

The first time to access the Admin you'll need to create an user.

## Populate data

This project uses a `/games/populate` route in order to populate the data via GoG site.
In order to make it work, follow the steps:

- Go to Roles & Permissions > Public and make sure `game:populate` route is public available and the upload as well
- With Strapi running run the following command in your console:

```bash
$ curl -X POST http://localhost:1337/games/populate

# you can pass query parameters like:
$ curl -X POST http://localhost:1337/games/populate?page=2
$ curl -X POST http://localhost:1337/games/populate?search=simcity
$ curl -X POST http://localhost:1337/games/populate?sort=rating&price=free
```
