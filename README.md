<p align="center">
  <a href="https://shyft.dev" target="_blank">
    <img
      src="https://shyft.dev/img/shyft-logo.svg"
      width="150"
    />
  </a>
</p>

# Shyft

[![Build Status](https://travis-ci.com/chriskalmar/shyft.svg?branch=master)](https://travis-ci.com/chriskalmar/shyft)
[![npm version](https://badge.fury.io/js/shyft.svg)](https://badge.fury.io/js/shyft)
[![codecov](https://codecov.io/gh/chriskalmar/shyft/branch/master/graph/badge.svg)](https://codecov.io/gh/chriskalmar/shyft)

Shyft is a server-side framework for building powerful GraphQL APIs.

## Features

- convert data model into a GraphQL API
- CRUD query/mutations out of the box
- flexible extension of mutations
- sync data model with database and provide migrations
- complex data fetching with multi-level filters
- offset/limit and cursor-based pagination
- extremely dynamic permission engine based on roles and data lookups
- workflows (finite state machines) with fine-grained control over access and input fields
- extensible with custom queries and mutations (actions)
- internationalization (i18n) included
- generate mock data based on data type or custom functions
- input validation with any validation framework
- derived fields
- hooks (pre- and post-processors)

## Install

With yarn:

```
yarn add shyft
```

or using npm:

```
npm install -S shyft
```

GraphQL is a peer dependency. Install it with:

```
yarn add graphql
```

## Tests

Run once:

```
yarn run test
```

Run in watch mode:

```
yarn run test-watch
```

## Integration Tests

Run once:

```
yarn run test-integration
```

Run in watch mode:

```
yarn run test-integration-watch
```
