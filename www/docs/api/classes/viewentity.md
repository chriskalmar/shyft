---
id: "viewentity"
title: "Class: ViewEntity"
sidebar_label: "ViewEntity"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new ViewEntity**(`setup`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `ViewEntitySetup` |

#### Defined in

[engine/entity/ViewEntity.ts:97](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L97)

## Properties

### \_attributes

• `Private` **\_attributes**: [AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/entity/ViewEntity.ts:91](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L91)

___

### \_attributesMap

• `Private` `Readonly` **\_attributesMap**: `AttributesSetupMap` \| [AttributesMapGenerator](../index.md#attributesmapgenerator)

#### Defined in

[engine/entity/ViewEntity.ts:87](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L87)

___

### \_defaultPermissions

• `Private` **\_defaultPermissions**: `PermissionMap`

#### Defined in

[engine/entity/ViewEntity.ts:90](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L90)

___

### \_permissions

• `Private` **\_permissions**: `PermissionMap` \| (...`args`: `any`[]) => `any`

#### Defined in

[engine/entity/ViewEntity.ts:89](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L89)

___

### \_preFilters

• `Private` **\_preFilters**: `PreFilterType` \| () => `PreFilterType`

#### Defined in

[engine/entity/ViewEntity.ts:94](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L94)

___

### \_primaryAttribute

• `Private` **\_primaryAttribute**: `Attribute`

#### Defined in

[engine/entity/ViewEntity.ts:88](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L88)

___

### description

• **description**: `string`

#### Defined in

[engine/entity/ViewEntity.ts:79](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L79)

___

### descriptionPermissionsFind

• **descriptionPermissionsFind**: `string` \| `boolean`

#### Defined in

[engine/entity/ViewEntity.ts:92](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L92)

___

### descriptionPermissionsRead

• **descriptionPermissionsRead**: `string` \| `boolean`

#### Defined in

[engine/entity/ViewEntity.ts:93](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L93)

___

### find

• **find**: (...`args`: `any`[]) => `any`

#### Type declaration

▸ (...`args`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`any`

#### Defined in

[engine/entity/ViewEntity.ts:97](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L97)

___

### findOne

• **findOne**: (...`arg`: `any`[]) => `any`

#### Type declaration

▸ (...`arg`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...arg` | `any`[] |

##### Returns

`any`

#### Defined in

[engine/entity/ViewEntity.ts:96](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L96)

___

### isFallbackStorageType

• **isFallbackStorageType**: `any`

#### Defined in

[engine/entity/ViewEntity.ts:95](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L95)

___

### meta

• `Optional` **meta**: `any`

#### Defined in

[engine/entity/ViewEntity.ts:86](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L86)

___

### name

• **name**: `string`

#### Defined in

[engine/entity/ViewEntity.ts:77](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L77)

___

### permissions

• `Optional` **permissions**: `PermissionMap`

#### Defined in

[engine/entity/ViewEntity.ts:82](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L82)

___

### postProcessor

• `Optional` **postProcessor**: `ViewEntityPostProcessor`

#### Defined in

[engine/entity/ViewEntity.ts:84](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L84)

___

### preFilters

• `Optional` **preFilters**: `PreFilterType`

#### Defined in

[engine/entity/ViewEntity.ts:85](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L85)

___

### preProcessor

• `Optional` **preProcessor**: `ViewEntityPreProcessor`

#### Defined in

[engine/entity/ViewEntity.ts:83](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L83)

___

### storageTableName

• **storageTableName**: `string`

#### Defined in

[engine/entity/ViewEntity.ts:78](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L78)

___

### storageType

• `Optional` **storageType**: [StorageType](storagetype.md)

#### Defined in

[engine/entity/ViewEntity.ts:80](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L80)

___

### viewExpression

• **viewExpression**: `any`

#### Defined in

[engine/entity/ViewEntity.ts:81](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L81)

## Methods

### \_exposeStorageAccess

▸ **_exposeStorageAccess**(): `void`

#### Returns

`void`

#### Defined in

[engine/entity/ViewEntity.ts:193](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L193)

___

### \_generatePermissionDescriptions

▸ **_generatePermissionDescriptions**(): `void`

#### Returns

`void`

#### Defined in

[engine/entity/ViewEntity.ts:446](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L446)

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

[engine/entity/ViewEntity.ts:198](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L198)

___

### \_injectStorageTypeBySchema

▸ **_injectStorageTypeBySchema**(`storageType`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `storageType` | [StorageType](storagetype.md) |

#### Returns

`void`

#### Defined in

[engine/entity/ViewEntity.ts:181](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L181)

___

### \_processAttribute

▸ **_processAttribute**(`rawAttribute`, `attributeName`): `Attribute`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rawAttribute` | `any` |
| `attributeName` | `any` |

#### Returns

`Attribute`

#### Defined in

[engine/entity/ViewEntity.ts:220](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L220)

___

### \_processAttributeMap

▸ **_processAttributeMap**(): `Object`

#### Returns

`Object`

#### Defined in

[engine/entity/ViewEntity.ts:346](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L346)

___

### \_processPermissions

▸ **_processPermissions**(): `PermissionMap`

#### Returns

`PermissionMap`

#### Defined in

[engine/entity/ViewEntity.ts:424](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L424)

___

### \_processPreFilters

▸ **_processPreFilters**(): `PreFilterType`

#### Returns

`PreFilterType`

#### Defined in

[engine/entity/ViewEntity.ts:462](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L462)

___

### getAttributes

▸ **getAttributes**(): [AttributesMap](../index.md#attributesmap)

#### Returns

[AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/entity/ViewEntity.ts:211](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L211)

___

### getPermissions

▸ **getPermissions**(): `PermissionMap`

#### Returns

`PermissionMap`

#### Defined in

[engine/entity/ViewEntity.ts:479](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L479)

___

### getPreFilters

▸ **getPreFilters**(): `PreFilterType`

#### Returns

`PreFilterType`

#### Defined in

[engine/entity/ViewEntity.ts:466](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L466)

___

### getPrimaryAttribute

▸ **getPrimaryAttribute**(): `Attribute`

#### Returns

`Attribute`

#### Defined in

[engine/entity/ViewEntity.ts:408](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L408)

___

### getStorageType

▸ **getStorageType**(): [StorageType](storagetype.md)

#### Returns

[StorageType](storagetype.md)

#### Defined in

[engine/entity/ViewEntity.ts:489](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L489)

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

[engine/entity/ViewEntity.ts:412](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L412)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/entity/ViewEntity.ts:493](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ViewEntity.ts#L493)
