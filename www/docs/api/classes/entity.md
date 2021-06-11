---
id: "entity"
title: "Class: Entity"
sidebar_label: "Entity"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Entity**(`setup`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `EntitySetup` |

#### Defined in

[engine/entity/Entity.ts:147](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L147)

## Properties

### \_primaryAttribute

• `Private` **\_primaryAttribute**: `PrimaryAttribute`

#### Defined in

[engine/entity/Entity.ts:136](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L136)

___

### attributes

• `Private` **attributes**: [AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/entity/Entity.ts:142](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L142)

___

### defaultPermissions

• `Private` **defaultPermissions**: `PermissionMap`

#### Defined in

[engine/entity/Entity.ts:141](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L141)

___

### description

• **description**: `string`

#### Defined in

[engine/entity/Entity.ts:119](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L119)

___

### descriptionPermissionsFind

• **descriptionPermissionsFind**: `string` \| `boolean`

#### Defined in

[engine/entity/Entity.ts:143](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L143)

___

### descriptionPermissionsRead

• **descriptionPermissionsRead**: `string` \| `boolean`

#### Defined in

[engine/entity/Entity.ts:144](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L144)

___

### find

• **find**: `Function`

#### Defined in

[engine/entity/Entity.ts:147](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L147)

___

### findOne

• **findOne**: `Function`

#### Defined in

[engine/entity/Entity.ts:146](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L146)

___

### includeTimeTracking

• `Optional` **includeTimeTracking**: `boolean`

#### Defined in

[engine/entity/Entity.ts:122](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L122)

___

### includeUserTracking

• `Optional` **includeUserTracking**: `boolean`

#### Defined in

[engine/entity/Entity.ts:123](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L123)

___

### indexes

• `Optional` **indexes**: [Index](index.md)[]

#### Defined in

[engine/entity/Entity.ts:124](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L124)

___

### isFallbackStorageType

• **isFallbackStorageType**: `boolean`

#### Defined in

[engine/entity/Entity.ts:145](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L145)

___

### isUserEntity

• `Optional` **isUserEntity**: `boolean`

#### Defined in

[engine/entity/Entity.ts:121](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L121)

___

### meta

• `Optional` **meta**: `Object`

#### Index signature

▪ [key: `string`]: `unknown`

#### Defined in

[engine/entity/Entity.ts:132](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L132)

___

### mutations

• `Optional` **mutations**: [Mutation](mutation.md)[]

#### Defined in

[engine/entity/Entity.ts:125](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L125)

___

### name

• **name**: `string`

#### Defined in

[engine/entity/Entity.ts:117](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L117)

___

### permissions

• `Optional` **permissions**: `PermissionMap`

#### Defined in

[engine/entity/Entity.ts:126](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L126)

___

### postProcessor

• `Optional` **postProcessor**: `EntityPostProcessor`

#### Defined in

[engine/entity/Entity.ts:130](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L130)

___

### preFilters

• `Optional` **preFilters**: `PreFilterType`

#### Defined in

[engine/entity/Entity.ts:131](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L131)

___

### preProcessor

• `Optional` **preProcessor**: `EntityPreProcessor`

#### Defined in

[engine/entity/Entity.ts:129](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L129)

___

### referencedByEntities

• **referencedByEntities**: { `sourceAttributeName`: `string` ; `sourceEntityName`: `string`  }[]

#### Defined in

[engine/entity/Entity.ts:137](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L137)

___

### setup

• `Private` **setup**: `EntitySetup`

#### Defined in

[engine/entity/Entity.ts:135](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L135)

___

### states

• `Optional` **states**: `StateMap`

#### Defined in

[engine/entity/Entity.ts:128](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L128)

___

### storageTableName

• **storageTableName**: `string`

#### Defined in

[engine/entity/Entity.ts:118](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L118)

___

### storageType

• `Optional` **storageType**: [StorageType](storagetype.md)

#### Defined in

[engine/entity/Entity.ts:120](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L120)

___

### subscriptions

• `Optional` **subscriptions**: `any`

#### Defined in

[engine/entity/Entity.ts:127](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L127)

## Methods

### \_checkSystemAttributeNameCollision

▸ **_checkSystemAttributeNameCollision**(`attributeMap`, `attributeName`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeMap` | `any` |
| `attributeName` | `any` |

#### Returns

`void`

#### Defined in

[engine/entity/Entity.ts:469](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L469)

___

### \_collectSystemAttributes

▸ **_collectSystemAttributes**(`attributeMap`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeMap` | `any` |

#### Returns

`any`[]

#### Defined in

[engine/entity/Entity.ts:419](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L419)

___

### \_exposeStorageAccess

▸ **_exposeStorageAccess**(): `void`

#### Returns

`void`

#### Defined in

[engine/entity/Entity.ts:234](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L234)

___

### \_generatePermissionDescriptions

▸ **_generatePermissionDescriptions**(): `void`

#### Returns

`void`

#### Defined in

[engine/entity/Entity.ts:777](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L777)

___

### \_getDefaultSubscriptions

▸ **_getDefaultSubscriptions**(): `Object`

#### Returns

`Object`

#### Defined in

[engine/entity/Entity.ts:350](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L350)

___

### \_injectDefaultPermissionsBySchema

▸ **_injectDefaultPermissionsBySchema**(`defaultPermissions`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `defaultPermissions` | `any` |

#### Returns

`void`

#### Defined in

[engine/entity/Entity.ts:239](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L239)

___

### \_injectStorageTypeBySchema

▸ **_injectStorageTypeBySchema**(`storageType`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `storageType` | `any` |

#### Returns

`void`

#### Defined in

[engine/entity/Entity.ts:222](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L222)

___

### \_processMutations

▸ **_processMutations**(): [Mutation](mutation.md)[]

#### Returns

[Mutation](mutation.md)[]

#### Defined in

[engine/entity/Entity.ts:275](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L275)

___

### \_processPreFilters

▸ **_processPreFilters**(): `PreFilterType`

#### Returns

`PreFilterType`

#### Defined in

[engine/entity/Entity.ts:825](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L825)

___

### \_processSubscriptions

▸ **_processSubscriptions**(): [Subscription](subscription.md)[]

#### Returns

[Subscription](subscription.md)[]

#### Defined in

[engine/entity/Entity.ts:375](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L375)

___

### getAttributes

▸ **getAttributes**(): [AttributesMap](../index.md#attributesmap)

#### Returns

[AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/entity/Entity.ts:252](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L252)

___

### getDefaultMutations

▸ `Private` **getDefaultMutations**(): `MutationMap`

#### Returns

`MutationMap`

#### Defined in

[engine/entity/Entity.ts:733](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L733)

___

### getI18nAttributeNames

▸ **getI18nAttributeNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[engine/entity/Entity.ts:723](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L723)

___

### getIndexes

▸ **getIndexes**(): [Index](index.md)[]

#### Returns

[Index](index.md)[]

#### Defined in

[engine/entity/Entity.ts:265](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L265)

___

### getMutationByName

▸ **getMutationByName**(`name`): [Mutation](mutation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[Mutation](mutation.md)

#### Defined in

[engine/entity/Entity.ts:300](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L300)

___

### getMutations

▸ **getMutations**(): [Mutation](mutation.md)[]

#### Returns

[Mutation](mutation.md)[]

#### Defined in

[engine/entity/Entity.ts:290](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L290)

___

### getPermissions

▸ **getPermissions**(): `PermissionMap`

#### Returns

`PermissionMap`

#### Defined in

[engine/entity/Entity.ts:844](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L844)

___

### getPreFilters

▸ **getPreFilters**(): `PreFilterType`

#### Returns

`PreFilterType`

#### Defined in

[engine/entity/Entity.ts:831](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L831)

___

### getPrimaryAttribute

▸ **getPrimaryAttribute**(): `PrimaryAttribute`

#### Returns

`PrimaryAttribute`

#### Defined in

[engine/entity/Entity.ts:707](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L707)

___

### getStates

▸ **getStates**(): `StateMap`

#### Returns

`StateMap`

#### Defined in

[engine/entity/Entity.ts:406](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L406)

___

### getStorageType

▸ **getStorageType**(): [StorageType](storagetype.md)

#### Returns

[StorageType](storagetype.md)

#### Defined in

[engine/entity/Entity.ts:887](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L887)

___

### getSubscriptionByName

▸ **getSubscriptionByName**(`name`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`any`

#### Defined in

[engine/entity/Entity.ts:398](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L398)

___

### getSubscriptions

▸ **getSubscriptions**(): `any`

#### Returns

`any`

#### Defined in

[engine/entity/Entity.ts:389](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L389)

___

### hasStates

▸ **hasStates**(): `boolean`

#### Returns

`boolean`

#### Defined in

[engine/entity/Entity.ts:415](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L415)

___

### processAttribute

▸ `Private` **processAttribute**(`rawAttribute`, `attributeName`): `Attribute`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rawAttribute` | `any` |
| `attributeName` | `any` |

#### Returns

`Attribute`

#### Defined in

[engine/entity/Entity.ts:477](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L477)

___

### processAttributeMap

▸ `Private` **processAttributeMap**(): `Object`

#### Returns

`Object`

#### Defined in

[engine/entity/Entity.ts:635](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L635)

___

### processIndexes

▸ `Private` **processIndexes**(): [Index](index.md)[]

#### Returns

[Index](index.md)[]

#### Defined in

[engine/entity/Entity.ts:261](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L261)

___

### processPermissions

▸ `Private` **processPermissions**(): `PermissionMap`

#### Returns

`PermissionMap`

#### Defined in

[engine/entity/Entity.ts:758](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L758)

___

### processStates

▸ `Private` **processStates**(): `StateMap`

#### Returns

`StateMap`

#### Defined in

[engine/entity/Entity.ts:308](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L308)

___

### referenceAttribute

▸ **referenceAttribute**(`attributeName`): `AttributeBase`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeName` | `any` |

#### Returns

`AttributeBase`

#### Defined in

[engine/entity/Entity.ts:711](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L711)

___

### referencedBy

▸ **referencedBy**(`sourceEntityName`, `sourceAttributeName`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sourceEntityName` | `any` |
| `sourceAttributeName` | `any` |

#### Returns

`void`

#### Defined in

[engine/entity/Entity.ts:856](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L856)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/entity/Entity.ts:891](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/Entity.ts#L891)
