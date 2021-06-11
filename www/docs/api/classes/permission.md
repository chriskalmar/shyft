---
id: "permission"
title: "Class: Permission"
sidebar_label: "Permission"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Permission**()

#### Defined in

[engine/permission/Permission.ts:59](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L59)

## Properties

### authenticatedCanAccess

• **authenticatedCanAccess**: `boolean` = false

#### Defined in

[engine/permission/Permission.ts:53](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L53)

___

### everyoneCanAccess

• **everyoneCanAccess**: `boolean` = false

#### Defined in

[engine/permission/Permission.ts:52](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L52)

___

### isEmpty

• **isEmpty**: `boolean` = true

#### Defined in

[engine/permission/Permission.ts:51](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L51)

___

### lookups

• **lookups**: `any`[] = []

#### Defined in

[engine/permission/Permission.ts:57](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L57)

___

### roles

• **roles**: `any`[] = []

#### Defined in

[engine/permission/Permission.ts:55](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L55)

___

### states

• **states**: `any`[] = []

#### Defined in

[engine/permission/Permission.ts:59](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L59)

___

### types

• **types**: `Object` = {}

#### Defined in

[engine/permission/Permission.ts:54](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L54)

___

### userAttributes

• **userAttributes**: `any`[] = []

#### Defined in

[engine/permission/Permission.ts:56](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L56)

___

### values

• **values**: `any`[] = []

#### Defined in

[engine/permission/Permission.ts:58](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L58)

___

### AUTHENTICATED

▪ `Static` **AUTHENTICATED**: [Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:49](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L49)

___

### EVERYONE

▪ `Static` **EVERYONE**: [Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:48](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L48)

## Methods

### \_checkCompatibility

▸ **_checkCompatibility**(`type`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `any` |

#### Returns

`void`

#### Defined in

[engine/permission/Permission.ts:67](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L67)

___

### authenticated

▸ **authenticated**(): [Permission](permission.md)

#### Returns

[Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:95](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L95)

___

### everyone

▸ **everyone**(): [Permission](permission.md)

#### Returns

[Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:88](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L88)

___

### lookup

▸ **lookup**(`entity`, `lookupMap`): [Permission](permission.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) \| () => [Entity](entity.md) \| () => [ViewEntity](viewentity.md) |
| `lookupMap` | `Record`<string, unknown\> |

#### Returns

[Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:138](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L138)

___

### role

▸ **role**(`name`): [Permission](permission.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:102](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L102)

___

### state

▸ **state**(`stateName`): [Permission](permission.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `stateName` | `string` |

#### Returns

[Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:183](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L183)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/permission/Permission.ts:197](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L197)

___

### userAttribute

▸ **userAttribute**(`attributeName`): [Permission](permission.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeName` | `string` |

#### Returns

[Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:118](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L118)

___

### value

▸ **value**(`attributeName`, `value`): [Permission](permission.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeName` | `string` |
| `value` | `any` |

#### Returns

[Permission](permission.md)

#### Defined in

[engine/permission/Permission.ts:162](https://github.com/Enubia/shyft/blob/da240ce/src/engine/permission/Permission.ts#L162)
