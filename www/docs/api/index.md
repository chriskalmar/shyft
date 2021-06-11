---
id: "index"
title: "shyft"
slug: "/api"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Classes

- [Action](classes/action.md)
- [ComplexDataType](classes/complexdatatype.md)
- [Configuration](classes/configuration.md)
- [CustomError](classes/customerror.md)
- [DataType](classes/datatype.md)
- [DataTypeEnum](classes/datatypeenum.md)
- [DataTypeState](classes/datatypestate.md)
- [Entity](classes/entity.md)
- [Index](classes/index.md)
- [ListDataType](classes/listdatatype.md)
- [Mutation](classes/mutation.md)
- [ObjectDataType](classes/objectdatatype.md)
- [Permission](classes/permission.md)
- [ProtocolConfiguration](classes/protocolconfiguration.md)
- [ProtocolGraphQLConfiguration](classes/protocolgraphqlconfiguration.md)
- [ProtocolType](classes/protocoltype.md)
- [Schema](classes/schema.md)
- [ShadowEntity](classes/shadowentity.md)
- [StorageConfiguration](classes/storageconfiguration.md)
- [StorageDataType](classes/storagedatatype.md)
- [StoragePostgresConfiguration](classes/storagepostgresconfiguration.md)
- [StorageType](classes/storagetype.md)
- [Subscription](classes/subscription.md)
- [ViewEntity](classes/viewentity.md)

## Interfaces

- [Context](interfaces/context.md)

## Type aliases

### AttributeDefaultValue

Ƭ **AttributeDefaultValue**: (`params`: { `context?`: [Context](interfaces/context.md) ; `entity?`: [Entity](classes/entity.md) ; `operation?`: [Mutation](classes/mutation.md) \| [Subscription](classes/subscription.md) ; `payload?`: { [key: string]: `unknown`;  }  }) => `unknown` \| `Promise`<unknown\>

#### Type declaration

▸ (`params`): `unknown` \| `Promise`<unknown\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.context?` | [Context](interfaces/context.md) |
| `params.entity?` | [Entity](classes/entity.md) |
| `params.operation?` | [Mutation](classes/mutation.md) \| [Subscription](classes/subscription.md) |
| `params.payload?` | `Object` |

##### Returns

`unknown` \| `Promise`<unknown\>

#### Defined in

[engine/attribute/Attribute.ts:9](https://github.com/Enubia/shyft/blob/da240ce/src/engine/attribute/Attribute.ts#L9)

___

### AttributeResolve

Ƭ **AttributeResolve**: (`params`: { `args?`: { [key: string]: `unknown`;  } ; `context?`: [Context](interfaces/context.md) ; `info?`: `GraphQLResolveInfo` ; `obj?`: { [key: string]: `unknown`;  }  }) => `unknown` \| `Promise`<unknown\>

#### Type declaration

▸ (`params`): `unknown` \| `Promise`<unknown\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.args?` | `Object` |
| `params.context?` | [Context](interfaces/context.md) |
| `params.info?` | `GraphQLResolveInfo` |
| `params.obj?` | `Object` |

##### Returns

`unknown` \| `Promise`<unknown\>

#### Defined in

[engine/attribute/Attribute.ts:16](https://github.com/Enubia/shyft/blob/da240ce/src/engine/attribute/Attribute.ts#L16)

___

### AttributeSerialize

Ƭ **AttributeSerialize**: (`field?`: `unknown`, `payload?`: `unknown`, `entityMutation?`: [Mutation](classes/mutation.md), `entity?`: [Entity](classes/entity.md), `model?`: `unknown`, `context?`: [Context](interfaces/context.md), `language?`: `unknown`) => `unknown`

#### Type declaration

▸ (`field?`, `payload?`, `entityMutation?`, `entity?`, `model?`, `context?`, `language?`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `field?` | `unknown` |
| `payload?` | `unknown` |
| `entityMutation?` | [Mutation](classes/mutation.md) |
| `entity?` | [Entity](classes/entity.md) |
| `model?` | `unknown` |
| `context?` | [Context](interfaces/context.md) |
| `language?` | `unknown` |

##### Returns

`unknown`

#### Defined in

[engine/attribute/Attribute.ts:23](https://github.com/Enubia/shyft/blob/da240ce/src/engine/attribute/Attribute.ts#L23)

___

### AttributeValidate

Ƭ **AttributeValidate**: (`params`: { `attributeName?`: `string` ; `context?`: [Context](interfaces/context.md) ; `input?`: { [key: string]: `unknown`;  } ; `source?`: `Source` ; `value?`: `unknown`  }) => `void` \| `Promise`<void\>

#### Type declaration

▸ (`params`): `void` \| `Promise`<void\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.attributeName?` | `string` |
| `params.context?` | [Context](interfaces/context.md) |
| `params.input?` | `Object` |
| `params.source?` | `Source` |
| `params.value?` | `unknown` |

##### Returns

`void` \| `Promise`<void\>

#### Defined in

[engine/attribute/Attribute.ts:33](https://github.com/Enubia/shyft/blob/da240ce/src/engine/attribute/Attribute.ts#L33)

___

### AttributesMap

Ƭ **AttributesMap**: `Object`

map of attributes

#### Index signature

▪ [key: `string`]: `AttributeSetup`

an attribute

#### Defined in

[engine/attribute/Attribute.ts:185](https://github.com/Enubia/shyft/blob/da240ce/src/engine/attribute/Attribute.ts#L185)

___

### AttributesMapGenerator

Ƭ **AttributesMapGenerator**: () => `AttributesSetupMap`

a generator function returning a setup of a map of attributes

#### Type declaration

▸ (): `AttributesSetupMap`

##### Returns

`AttributesSetupMap`

#### Defined in

[engine/attribute/Attribute.ts:205](https://github.com/Enubia/shyft/blob/da240ce/src/engine/attribute/Attribute.ts#L205)

___

### ListDataTypeSetupType

Ƭ **ListDataTypeSetupType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description` | `string` |
| `itemType` | [Entity](classes/entity.md) \| [DataType](classes/datatype.md) \| [ComplexDataType](classes/complexdatatype.md) \| `DataTypeFunction` |
| `maxItems?` | `number` |
| `minItems?` | `number` |
| `name` | `string` |

#### Defined in

[engine/datatype/ListDataType.ts:19](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L19)

## Properties

### default

• **default**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `StoragePostgresConfiguration` | typeof [StoragePostgresConfiguration](classes/storagepostgresconfiguration.md) |
| `StorageTypePostgres` | [StorageType](classes/storagetype.md) |
| `connectStorage` | (`configuration`: [Configuration](classes/configuration.md), `synchronize`: `boolean`, `dropSchema`: `boolean`, `onConnect?`: `OnConnectionHandler`) => `Promise`<Connection\> |
| `disconnectStorage` | (`connection`: `Connection`) => `Promise`<void\> |
| `fillMigrationsTable` | (`connection`: `Connection`) => `Promise`<void\> |
| `generateMigration` | (`configuration`: [Configuration](classes/configuration.md), `migrationName`: `string`, `customTemplate`: () => `string`, `includeI18n`: `boolean`, `enforce`: `boolean`) => `Promise`<number\> |
| `generateMockData` | (`configuration`: `any`) => `Promise`<void\> |
| `isStoragePostgresConfiguration` | (`obj`: `any`) => `boolean` |
| `loadModels` | (`configuration`: `any`) => {} |
| `migrateI18nIndices` | (`configuration`: [Configuration](classes/configuration.md)) => `Promise`<void\> |
| `revertMigration` | (`configuration`: [Configuration](classes/configuration.md)) => `Promise`<void\> |
| `runMigration` | (`configuration`: [Configuration](classes/configuration.md)) => `Promise`<void\> |
| `runTestPlaceholderQuery` | (`cmd`: `any`, `vars`: `any`) => `Promise`<any\> |

## Variables

### ACTION\_TYPE\_MUTATION

• `Const` **ACTION\_TYPE\_MUTATION**: ``"mutation"``

#### Defined in

[engine/action/Action.ts:14](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L14)

___

### ACTION\_TYPE\_QUERY

• `Const` **ACTION\_TYPE\_QUERY**: ``"query"``

#### Defined in

[engine/action/Action.ts:15](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L15)

___

### ATTRIBUTE\_NAME\_PATTERN

• `Const` **ATTRIBUTE\_NAME\_PATTERN**: ``"^[a-zA-Z][a-zA-Z0-9_]*$"``

#### Defined in

[engine/constants.ts:3](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L3)

___

### DataTypeBigInt

• `Const` **DataTypeBigInt**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:27](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L27)

___

### DataTypeBoolean

• `Const` **DataTypeBoolean**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:48](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L48)

___

### DataTypeDate

• `Const` **DataTypeDate**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:87](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L87)

___

### DataTypeDouble

• `Const` **DataTypeDouble**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:41](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L41)

___

### DataTypeFloat

• `Const` **DataTypeFloat**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:34](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L34)

___

### DataTypeI18n

• `Const` **DataTypeI18n**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:115](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L115)

___

### DataTypeID

• `Const` **DataTypeID**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:13](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L13)

___

### DataTypeInteger

• `Const` **DataTypeInteger**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:20](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L20)

___

### DataTypeJson

• `Const` **DataTypeJson**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:66](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L66)

___

### DataTypeString

• `Const` **DataTypeString**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:59](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L59)

___

### DataTypeTime

• `Const` **DataTypeTime**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:94](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L94)

___

### DataTypeTimeTz

• `Const` **DataTypeTimeTz**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:101](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L101)

___

### DataTypeTimestamp

• `Const` **DataTypeTimestamp**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:73](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L73)

___

### DataTypeTimestampTz

• `Const` **DataTypeTimestampTz**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:80](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L80)

___

### DataTypeUUID

• `Const` **DataTypeUUID**: [DataType](classes/datatype.md)

#### Defined in

[engine/datatype/dataTypes.ts:108](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L108)

___

### DataTypeUserID

• `Const` **DataTypeUserID**: `DataTypeUser`

#### Defined in

[engine/datatype/dataTypes.ts:6](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/dataTypes.ts#L6)

___

### ENUM\_VALUE\_PATTERN

• `Const` **ENUM\_VALUE\_PATTERN**: ``"^[_a-zA-Z][_a-zA-Z0-9]*$"``

#### Defined in

[engine/constants.ts:6](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L6)

___

### GraphQLBigInt

• `Const` **GraphQLBigInt**: `GraphQLScalarType`

#### Defined in

[graphqlProtocol/dataTypes.ts:21](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/dataTypes.ts#L21)

___

### GraphQLCursor

• `Const` **GraphQLCursor**: `GraphQLScalarType`

#### Defined in

[graphqlProtocol/dataTypes.ts:10](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/dataTypes.ts#L10)

___

### GraphQLDate

• `Const` **GraphQLDate**: `GraphQLScalarType`

#### Defined in

[graphqlProtocol/dataTypes.ts:71](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/dataTypes.ts#L71)

___

### GraphQLDateTime

• `Const` **GraphQLDateTime**: `GraphQLScalarType`

#### Defined in

[graphqlProtocol/dataTypes.ts:34](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/dataTypes.ts#L34)

___

### GraphQLTime

• `Const` **GraphQLTime**: `GraphQLScalarType`

#### Defined in

[graphqlProtocol/dataTypes.ts:99](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/dataTypes.ts#L99)

___

### INDEX\_GENERIC

• `Const` **INDEX\_GENERIC**: ``"generic"``

#### Defined in

[engine/index/Index.ts:7](https://github.com/Enubia/shyft/blob/da240ce/src/engine/index/Index.ts#L7)

___

### INDEX\_UNIQUE

• `Const` **INDEX\_UNIQUE**: ``"unique"``

#### Defined in

[engine/index/Index.ts:6](https://github.com/Enubia/shyft/blob/da240ce/src/engine/index/Index.ts#L6)

___

### LANGUAGE\_ISO\_CODE\_PATTERN

• `Const` **LANGUAGE\_ISO\_CODE\_PATTERN**: ``"^[a-z]+$"``

#### Defined in

[engine/constants.ts:12](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L12)

___

### MAX\_PAGE\_SIZE

• `Const` **MAX\_PAGE\_SIZE**: ``100``

#### Defined in

[graphqlProtocol/protocolGraphqlConstants.ts:4](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/protocolGraphqlConstants.ts#L4)

___

### MUTATION\_TYPE\_CREATE

• `Const` **MUTATION\_TYPE\_CREATE**: ``"create"``

#### Defined in

[engine/mutation/Mutation.ts:8](https://github.com/Enubia/shyft/blob/da240ce/src/engine/mutation/Mutation.ts#L8)

___

### MUTATION\_TYPE\_DELETE

• `Const` **MUTATION\_TYPE\_DELETE**: ``"delete"``

#### Defined in

[engine/mutation/Mutation.ts:10](https://github.com/Enubia/shyft/blob/da240ce/src/engine/mutation/Mutation.ts#L10)

___

### MUTATION\_TYPE\_UPDATE

• `Const` **MUTATION\_TYPE\_UPDATE**: ``"update"``

#### Defined in

[engine/mutation/Mutation.ts:9](https://github.com/Enubia/shyft/blob/da240ce/src/engine/mutation/Mutation.ts#L9)

___

### ProtocolGraphQL

• `Const` **ProtocolGraphQL**: [ProtocolType](classes/protocoltype.md)

#### Defined in

[graphqlProtocol/ProtocolGraphQL.ts:49](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQL.ts#L49)

___

### RELAY\_TYPE\_PROMOTER\_FIELD

• `Const` **RELAY\_TYPE\_PROMOTER\_FIELD**: ``"_type_"``

#### Defined in

[graphqlProtocol/protocolGraphqlConstants.ts:2](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/protocolGraphqlConstants.ts#L2)

___

### STATE\_NAME\_PATTERN

• `Const` **STATE\_NAME\_PATTERN**: ``"^[a-zA-Z][_a-zA-Z0-9]*$"``

#### Defined in

[engine/constants.ts:9](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L9)

___

### SUBSCRIPTION\_TYPE\_CREATE

• `Const` **SUBSCRIPTION\_TYPE\_CREATE**: ``"onCreate"``

#### Defined in

[engine/subscription/Subscription.ts:9](https://github.com/Enubia/shyft/blob/da240ce/src/engine/subscription/Subscription.ts#L9)

___

### SUBSCRIPTION\_TYPE\_DELETE

• `Const` **SUBSCRIPTION\_TYPE\_DELETE**: ``"onDelete"``

#### Defined in

[engine/subscription/Subscription.ts:11](https://github.com/Enubia/shyft/blob/da240ce/src/engine/subscription/Subscription.ts#L11)

___

### SUBSCRIPTION\_TYPE\_UPDATE

• `Const` **SUBSCRIPTION\_TYPE\_UPDATE**: ``"onUpdate"``

#### Defined in

[engine/subscription/Subscription.ts:10](https://github.com/Enubia/shyft/blob/da240ce/src/engine/subscription/Subscription.ts#L10)

___

### StorageTypePostgres

• `Const` **StorageTypePostgres**: [StorageType](classes/storagetype.md)

#### Defined in

[storage-connector/StorageTypePostgres.ts:226](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StorageTypePostgres.ts#L226)

___

### attributeNameRegex

• `Const` **attributeNameRegex**: `RegExp`

#### Defined in

[engine/constants.ts:4](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L4)

___

### attributePropertiesWhitelist

• `Const` **attributePropertiesWhitelist**: `string`[]

#### Defined in

[engine/constants.ts:65](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L65)

___

### coreModels

• `Const` **coreModels**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Language` | [Entity](classes/entity.md) |
| `User` | [Entity](classes/entity.md) |

#### Defined in

[index.ts:173](https://github.com/Enubia/shyft/blob/da240ce/src/index.ts#L173)

___

### entityPropertiesWhitelist

• `Const` **entityPropertiesWhitelist**: `string`[]

#### Defined in

[engine/constants.ts:46](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L46)

___

### enumValueRegex

• `Const` **enumValueRegex**: `RegExp`

#### Defined in

[engine/constants.ts:7](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L7)

___

### languageIsoCodeRegex

• `Const` **languageIsoCodeRegex**: `RegExp`

#### Defined in

[engine/constants.ts:13](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L13)

___

### pubsub

• `Const` **pubsub**: `PubSub`

#### Defined in

[engine/subscription/Subscription.ts:7](https://github.com/Enubia/shyft/blob/da240ce/src/engine/subscription/Subscription.ts#L7)

___

### stateNameRegex

• `Const` **stateNameRegex**: `RegExp`

#### Defined in

[engine/constants.ts:10](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L10)

___

### storageDataTypeCapabilities

• `Const` **storageDataTypeCapabilities**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contains` | `number` |
| `ends_with` | `number` |
| `gt` | `number` |
| `gte` | `number` |
| `in` | `number` |
| `includes` | `number` |
| `is_null` | `number` |
| `lt` | `number` |
| `lte` | `number` |
| `ne` | `number` |
| `not_contains` | `number` |
| `not_ends_with` | `number` |
| `not_in` | `number` |
| `not_includes` | `number` |
| `not_starts_with` | `number` |
| `starts_with` | `number` |

#### Defined in

[engine/constants.ts:27](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L27)

___

### storageDataTypeCapabilityType

• `Const` **storageDataTypeCapabilityType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `BOOLEAN` | `number` |
| `LIST` | `number` |
| `STRING` | `number` |
| `VALUE` | `number` |

#### Defined in

[engine/constants.ts:15](https://github.com/Enubia/shyft/blob/da240ce/src/engine/constants.ts#L15)

## Functions

### GraphQLJSON

• **GraphQLJSON**: 

___

### asyncForEach

▸ `Const` **asyncForEach**<T\>(`array`, `callback`): `Promise`<void\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `array` | `T`[] |
| `callback` | (`val`: `T`, `idx`: `number`, `arr`: `T`[]) => `void` |

#### Returns

`Promise`<void\>

#### Defined in

[engine/util.ts:160](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L160)

___

### buildActionPermissionFilter

▸ `Const` **buildActionPermissionFilter**(`_permissions`, `userId?`, `userRoles?`, `action`, `input?`, `context?`): `Promise`<`Object`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `_permissions` | () => [Permission](classes/permission.md) \| [Permission](classes/permission.md)[] | `undefined` |
| `userId` | `any` | null |
| `userRoles` | `any`[] | [] |
| `action` | [Subscription](classes/subscription.md) \| [Action](classes/action.md) | `undefined` |
| `input?` | `Record`<string, unknown\> | `undefined` |
| `context?` | [Context](interfaces/context.md) | `undefined` |

#### Returns

`Promise`<`Object`\>

#### Defined in

[engine/permission/Permission.ts:817](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L817)

___

### buildListDataType

▸ `Const` **buildListDataType**(`obj`): `DataTypeFunction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `ListDataTypeBuildSetupType` |

#### Returns

`DataTypeFunction`

#### Defined in

[engine/datatype/ListDataType.ts:158](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L158)

___

### buildObjectDataType

▸ `Const` **buildObjectDataType**(`obj`): `DataTypeFunction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `Object` |
| `obj.attributes` | `AttributesSetupMap` \| [AttributesMapGenerator](index.md#attributesmapgenerator) |

#### Returns

`DataTypeFunction`

#### Defined in

[engine/datatype/ObjectDataType.ts:171](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L171)

___

### buildPermissionFilter

▸ `Const` **buildPermissionFilter**(`_permissions`, `userId?`, `userRoles?`, `entity?`, `input?`, `context?`): `Promise`<PermissionFilter\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `_permissions` | [Permission](classes/permission.md) \| [Permission](classes/permission.md)[] |
| `userId?` | `string` \| `number` |
| `userRoles?` | `any` |
| `entity?` | [Entity](classes/entity.md) |
| `input?` | `any` |
| `context?` | `any` |

#### Returns

`Promise`<PermissionFilter\>

#### Defined in

[engine/permission/Permission.ts:750](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L750)

___

### checkPermissionSimple

▸ `Const` **checkPermissionSimple**(`permission`, `userId?`, `userRoles?`): `boolean`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `permission` | [Permission](classes/permission.md) | `undefined` |
| `userId` | `any` | null |
| `userRoles` | `any`[] | [] |

#### Returns

`boolean`

#### Defined in

[engine/permission/Permission.ts:437](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L437)

___

### combineMutationPreProcessors

▸ `Const` **combineMutationPreProcessors**(`preProcessors`): `MutationPreProcessor`

#### Parameters

| Name | Type |
| :------ | :------ |
| `preProcessors` | `MutationPreProcessor`[] |

#### Returns

`MutationPreProcessor`

#### Defined in

[engine/util.ts:203](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L203)

___

### connectStorage

▸ `Const` **connectStorage**(`configuration`, `synchronize?`, `dropSchema?`, `onConnect?`): `Promise`<Connection\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `configuration` | [Configuration](classes/configuration.md) | `undefined` |
| `synchronize` | `boolean` | false |
| `dropSchema` | `boolean` | false |
| `onConnect?` | `OnConnectionHandler` | `undefined` |

#### Returns

`Promise`<Connection\>

#### Defined in

[storage-connector/generator.ts:519](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/generator.ts#L519)

___

### convertEntityToViewAttribute

▸ `Const` **convertEntityToViewAttribute**(`attribute`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `any` |

#### Returns

`Object`

#### Defined in

[engine/util.ts:171](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L171)

___

### convertEntityToViewAttributesMap

▸ `Const` **convertEntityToViewAttributesMap**(`attributesMap`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributesMap` | `any` |

#### Returns

`Object`

#### Defined in

[engine/util.ts:187](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L187)

___

### convertFilterLevel

▸ `Const` **convertFilterLevel**(`filterShaper`, `filterLevel`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `filterShaper` | `any` |
| `filterLevel` | `any` |

#### Returns

`Object`

#### Defined in

[engine/filter.ts:136](https://github.com/Enubia/shyft/blob/da240ce/src/engine/filter.ts#L136)

___

### deleteUndefinedProps

▸ `Const` **deleteUndefinedProps**(`obj`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `any` |

#### Returns

`void`

#### Defined in

[engine/util.ts:8](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L8)

___

### disconnectStorage

▸ `Const` **disconnectStorage**(`connection`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `connection` | `Connection` |

#### Returns

`Promise`<void\>

#### Defined in

[storage-connector/generator.ts:564](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/generator.ts#L564)

___

### extendModelsForGql

▸ `Const` **extendModelsForGql**(`entities`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entities` | `EntityMap` |

#### Returns

`void`

#### Defined in

[graphqlProtocol/generator.ts:48](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/generator.ts#L48)

___

### fillDefaultValues

▸ `Const` **fillDefaultValues**(`entity`, `entityMutation`, `payload`, `context`): `Promise`<any\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](classes/entity.md) |
| `entityMutation` | [Mutation](classes/mutation.md) |
| `payload` | `any` |
| `context` | `Record`<string, any\> |

#### Returns

`Promise`<any\>

#### Defined in

[engine/helpers.ts:37](https://github.com/Enubia/shyft/blob/da240ce/src/engine/helpers.ts#L37)

___

### fillMigrationsTable

▸ `Const` **fillMigrationsTable**(`connection`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `connection` | `Connection` |

#### Returns

`Promise`<void\>

#### Defined in

[storage-connector/migration.ts:236](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/migration.ts#L236)

___

### fillSystemAttributesDefaultValues

▸ `Const` **fillSystemAttributesDefaultValues**(`entity`, `operation`, `payload`, `context`): `Record`<string, unknown\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](classes/entity.md) |
| `operation` | [Mutation](classes/mutation.md) \| [Subscription](classes/subscription.md) |
| `payload` | `Record`<string, unknown\> |
| `context` | [Context](interfaces/context.md) |

#### Returns

`Record`<string, unknown\>

#### Defined in

[engine/helpers.ts:8](https://github.com/Enubia/shyft/blob/da240ce/src/engine/helpers.ts#L8)

___

### fromBase64

▸ `Const` **fromBase64**(`value`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/util.ts:39](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/util.ts#L39)

___

### generateGraphQLSchema

▸ `Const` **generateGraphQLSchema**(`configuration`): `GraphQLSchema`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](classes/configuration.md) |

#### Returns

`GraphQLSchema`

#### Defined in

[graphqlProtocol/generator.ts:178](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/generator.ts#L178)

___

### generateMigration

▸ `Const` **generateMigration**(`configuration`, `migrationName`, `customTemplate`, `includeI18n?`, `enforce?`): `Promise`<number\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `configuration` | [Configuration](classes/configuration.md) | `undefined` |
| `migrationName` | `string` | `undefined` |
| `customTemplate` | () => `string` | `undefined` |
| `includeI18n` | `boolean` | false |
| `enforce` | `boolean` | false |

#### Returns

`Promise`<number\>

#### Defined in

[storage-connector/migration.ts:123](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/migration.ts#L123)

___

### generateMockData

▸ `Const` **generateMockData**(`configuration`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | `any` |

#### Returns

`Promise`<void\>

#### Defined in

[storage-connector/generator.ts:294](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/generator.ts#L294)

___

### getTypeForEntityFromGraphRegistry

▸ `Const` **getTypeForEntityFromGraphRegistry**(`entity`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](classes/entity.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `connection?` | `GraphQLObjectType`<any, any\> |
| `connectionArgs?` | `unknown` |
| `entity` | [Entity](classes/entity.md) \| [ViewEntity](classes/viewentity.md) |
| `type` | `GraphQLObjectType`<any, any\> |

#### Defined in

[graphqlProtocol/generator.ts:42](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/generator.ts#L42)

___

### isAction

▸ `Const` **isAction**(`obj`): obj is Action

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is Action

#### Defined in

[engine/action/Action.ts:286](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L286)

___

### isArray

▸ `Const` **isArray**(`set`, `nonEmpty?`): set is []

#### Parameters

| Name | Type |
| :------ | :------ |
| `set` | `unknown` |
| `nonEmpty?` | `boolean` |

#### Returns

set is []

#### Defined in

[engine/util.ts:45](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L45)

___

### isComplexDataType

▸ `Const` **isComplexDataType**(`obj`): obj is ComplexDataType

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is ComplexDataType

#### Defined in

[engine/datatype/ComplexDataType.ts:3](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ComplexDataType.ts#L3)

___

### isConfiguration

▸ `Const` **isConfiguration**(`obj`): obj is Configuration

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is Configuration

#### Defined in

[engine/configuration/Configuration.ts:136](https://github.com/Enubia/shyft/blob/da240ce/src/engine/configuration/Configuration.ts#L136)

___

### isDataType

▸ `Const` **isDataType**(`obj`): obj is DataType

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is DataType

#### Defined in

[engine/datatype/DataType.ts:99](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/DataType.ts#L99)

___

### isDataTypeEnum

▸ `Const` **isDataTypeEnum**(`obj`): obj is DataTypeEnum

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is DataTypeEnum

#### Defined in

[engine/datatype/DataTypeEnum.ts:71](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/DataTypeEnum.ts#L71)

___

### isDataTypeState

▸ `Const` **isDataTypeState**(`obj`): obj is DataTypeState

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is DataTypeState

#### Defined in

[engine/datatype/DataTypeState.ts:70](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/DataTypeState.ts#L70)

___

### isDefined

▸ `Const` **isDefined**(`val`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `val` | `unknown` |

#### Returns

`boolean`

#### Defined in

[engine/util.ts:169](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L169)

___

### isEntity

▸ `Const` **isEntity**(`obj`): obj is Entity

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is Entity

#### Defined in

[engine/entity/Entity.ts:896](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L896)

___

### isFunction

▸ `Const` **isFunction**(`fn`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | `unknown` |

#### Returns

`boolean`

#### Defined in

[engine/util.ts:41](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L41)

___

### isListDataType

▸ `Const` **isListDataType**(`obj`): obj is ListDataType

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is ListDataType

#### Defined in

[engine/datatype/ListDataType.ts:154](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L154)

___

### isMap

▸ `Const` **isMap**(`map`, `nonEmpty?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `map` | `Record`<string, any\> |
| `nonEmpty?` | `boolean` |

#### Returns

`boolean`

#### Defined in

[engine/util.ts:32](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L32)

___

### isObjectDataType

▸ `Const` **isObjectDataType**(`obj`): obj is ObjectDataType

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is ObjectDataType

#### Defined in

[engine/datatype/ObjectDataType.ts:167](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L167)

___

### isProtocolConfiguration

▸ `Const` **isProtocolConfiguration**(`obj`): obj is ProtocolConfiguration

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is ProtocolConfiguration

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:49](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L49)

___

### isProtocolGraphQLConfiguration

▸ `Const` **isProtocolGraphQLConfiguration**(`obj`): obj is ProtocolGraphQLConfiguration

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `any` |

#### Returns

obj is ProtocolGraphQLConfiguration

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:333](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L333)

___

### isShadowEntity

▸ `Const` **isShadowEntity**(`obj`): obj is ShadowEntity

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is ShadowEntity

#### Defined in

[engine/entity/ShadowEntity.ts:343](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L343)

___

### isStorageConfiguration

▸ `Const` **isStorageConfiguration**(`obj`): obj is StorageConfiguration

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is StorageConfiguration

#### Defined in

[engine/storage/StorageConfiguration.ts:165](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L165)

___

### isStoragePostgresConfiguration

▸ `Const` **isStoragePostgresConfiguration**(`obj`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `any` |

#### Returns

`boolean`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:281](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L281)

___

### isString

▸ `Const` **isString**(`str`): str is string

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `unknown` |

#### Returns

str is string

#### Defined in

[engine/util.ts:56](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L56)

___

### isViewEntity

▸ `Const` **isViewEntity**(`obj`): obj is ViewEntity

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `unknown` |

#### Returns

obj is ViewEntity

#### Defined in

[engine/entity/ViewEntity.ts:498](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L498)

___

### loadModels

▸ `Const` **loadModels**(`configuration`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | `any` |

#### Returns

`Object`

#### Defined in

[storage-connector/generator.ts:68](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/generator.ts#L68)

___

### mapOverProperties

▸ `Const` **mapOverProperties**(`object`, `iteratee`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Record`<string, unknown\> |
| `iteratee` | (`val`: `any`, `key`: `any`) => `any` |

#### Returns

`void`

#### Defined in

[engine/util.ts:67](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L67)

___

### mergeMaps

▸ `Const` **mergeMaps**(`first`, `second`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `first` | `any` |
| `second` | `any` |

#### Returns

`any`

#### Defined in

[engine/util.ts:59](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L59)

___

### migrateI18nIndices

▸ `Const` **migrateI18nIndices**(`configuration`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](classes/configuration.md) |

#### Returns

`Promise`<void\>

#### Defined in

[storage-connector/migration.ts:248](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/migration.ts#L248)

___

### passOrThrow

▸ `Const` **passOrThrow**(`condition`, `messageFn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `condition` | `any` |
| `messageFn` | `string` \| `StringFunction` |

#### Returns

`void`

#### Defined in

[engine/util.ts:11](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L11)

___

### processCursors

▸ `Const` **processCursors**(`entity?`, `args?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity?` | [Entity](classes/entity.md) |
| `args?` | `any` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `$and` | `any`[] |

#### Defined in

[engine/cursor.ts:157](https://github.com/Enubia/shyft/blob/da240ce/src/engine/cursor.ts#L157)

___

### processFilter

▸ `Const` **processFilter**(`entity`, `args`, `storageType`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `any` |
| `args` | `any` |
| `storageType` | `any` |

#### Returns

`any`

#### Defined in

[engine/filter.ts:120](https://github.com/Enubia/shyft/blob/da240ce/src/engine/filter.ts#L120)

___

### registerActions

▸ `Const` **registerActions**(`actions`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `actions` | `any` |

#### Returns

`void`

#### Defined in

[graphqlProtocol/generator.ts:172](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/generator.ts#L172)

___

### resolveFunctionMap

▸ `Const` **resolveFunctionMap**(`functionOrMap`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionOrMap` | `any` |

#### Returns

`any`

#### Defined in

[engine/util.ts:26](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L26)

___

### revertMigration

▸ `Const` **revertMigration**(`configuration`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](classes/configuration.md) |

#### Returns

`Promise`<void\>

#### Defined in

[storage-connector/migration.ts:219](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/migration.ts#L219)

___

### runMigration

▸ `Const` **runMigration**(`configuration`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](classes/configuration.md) |

#### Returns

`Promise`<void\>

#### Defined in

[storage-connector/migration.ts:202](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/migration.ts#L202)

___

### runTestPlaceholderQuery

▸ `Const` **runTestPlaceholderQuery**(`cmd`, `vars`): `Promise`<any\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `cmd` | `any` |
| `vars` | `any` |

#### Returns

`Promise`<any\>

#### Defined in

[storage-connector/helpers.ts:96](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/helpers.ts#L96)

___

### serializeValues

▸ `Const` **serializeValues**(`entity`, `entityMutation`, `payload`, `model`, `context`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](classes/entity.md) |
| `entityMutation` | [Mutation](classes/mutation.md) |
| `payload` | `Record`<string, unknown\> |
| `model` | `string` |
| `context` | `Record`<string, any\> |

#### Returns

`any`

#### Defined in

[engine/helpers.ts:77](https://github.com/Enubia/shyft/blob/da240ce/src/engine/helpers.ts#L77)

___

### sortDataByKeys

▸ `Const` **sortDataByKeys**(`keys`, `data`, `keyProperty?`): `unknown`[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `keys` | `string`[] | `undefined` |
| `data` | `unknown`[] | `undefined` |
| `keyProperty` | `string` | 'id' |

#### Returns

`unknown`[]

#### Defined in

[engine/util.ts:85](https://github.com/Enubia/shyft/blob/da240ce/src/engine/util.ts#L85)

___

### toBase64

▸ `Const` **toBase64**(`value`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/util.ts:37](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/util.ts#L37)

___

### validateActionPayload

▸ `Const` **validateActionPayload**(`param`, `payload`, `action`, `context?`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `param` | `any` |
| `payload` | `any` |
| `action` | [Action](classes/action.md) |
| `context?` | [Context](interfaces/context.md) |

#### Returns

`Promise`<void\>

#### Defined in

[engine/validation.ts:159](https://github.com/Enubia/shyft/blob/da240ce/src/engine/validation.ts#L159)

___

### validateMutationPayload

▸ `Const` **validateMutationPayload**(`entity`, `mutation`, `payload`, `context?`): `Promise`<void\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](classes/entity.md) |
| `mutation` | [Mutation](classes/mutation.md) |
| `payload` | `any` |
| `context?` | [Context](interfaces/context.md) |

#### Returns

`Promise`<void\>

#### Defined in

[engine/validation.ts:186](https://github.com/Enubia/shyft/blob/da240ce/src/engine/validation.ts#L186)
