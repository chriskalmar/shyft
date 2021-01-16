<p align="center">
  <a href="https://shyft.dev" target="_blank">
    <img
      src="https://shyft.dev/img/shyft-logo.svg"
      width="150"
    />
  </a>
</p>

# Shyft Storage Connector

[![Build Status](https://api.travis-ci.com/chriskalmar/shyft-storage-connector.svg?branch=master)](https://travis-ci.com/chriskalmar/shyft-storage-connector)
[![npm version](https://badge.fury.io/js/shyft-storage-connector.svg)](https://badge.fury.io/js/shyft-storage-connector)
[![codecov](https://codecov.io/gh/chriskalmar/shyft-storage-connector/branch/master/graph/badge.svg)](https://codecov.io/gh/chriskalmar/shyft-storage-connector)


This is a storage connector for Shyft (currently only Postgres support)

## Install

With yarn:

```
yarn add shyft shyft-storage-connector
```

or using npm:

```
npm install -S shyft shyft-storage-connector
```

Typeorm is a peer dependency. Install it with:

```
yarn add typeorm
```

## Unit Tests

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
