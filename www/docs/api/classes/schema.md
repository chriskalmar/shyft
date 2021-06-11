---
id: "schema"
title: "Class: Schema"
sidebar_label: "Schema"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Schema**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `SchemaSetup` |

#### Defined in

[engine/schema/Schema.ts:58](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L58)

## Properties

### \_actionMap

• `Private` **\_actionMap**: `ActionMap` = {}

#### Defined in

[engine/schema/Schema.ts:52](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L52)

___

### \_entityMap

• `Private` **\_entityMap**: `EntityMap` = {}

#### Defined in

[engine/schema/Schema.ts:51](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L51)

___

### \_isValidated

• `Private` **\_isValidated**: `boolean`

#### Defined in

[engine/schema/Schema.ts:53](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L53)

___

### \_userEntity

• `Private` **\_userEntity**: `any` = null

#### Defined in

[engine/schema/Schema.ts:54](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L54)

___

### defaultActionPermissions

• **defaultActionPermissions**: `any`

#### Defined in

[engine/schema/Schema.ts:58](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L58)

___

### defaultStorageType

• **defaultStorageType**: [StorageType](storagetype.md)

#### Defined in

[engine/schema/Schema.ts:56](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L56)

___

### permissionsMap

• **permissionsMap**: `PermissionsMap`

#### Defined in

[engine/schema/Schema.ts:57](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L57)

## Methods

### \_lazyLoadMissingEntities

▸ **_lazyLoadMissingEntities**(): `void`

#### Returns

`void`

#### Defined in

[engine/schema/Schema.ts:268](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L268)

___

### addAction

▸ **addAction**(`action`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | [Action](action.md) |

#### Returns

`void`

#### Defined in

[engine/schema/Schema.ts:385](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L385)

___

### addEntity

▸ **addEntity**(`entity`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `any` |

#### Returns

`void`

#### Defined in

[engine/schema/Schema.ts:196](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L196)

___

### getActions

▸ **getActions**(): `ActionMap`

#### Returns

`ActionMap`

#### Defined in

[engine/schema/Schema.ts:404](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L404)

___

### getEntities

▸ **getEntities**(): `EntityMap`

#### Returns

`EntityMap`

#### Defined in

[engine/schema/Schema.ts:380](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L380)

___

### getUserEntity

▸ **getUserEntity**(`throwIfMissing`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `throwIfMissing` | `any` |

#### Returns

`any`

#### Defined in

[engine/schema/Schema.ts:259](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L259)

___

### validate

▸ **validate**(): `void`

#### Returns

`void`

#### Defined in

[engine/schema/Schema.ts:305](https://github.com/Enubia/shyft/blob/da240ce/src/engine/schema/Schema.ts#L305)
