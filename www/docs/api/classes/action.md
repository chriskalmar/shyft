---
id: "action"
title: "Class: Action"
sidebar_label: "Action"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Action**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `ActionSetup` |

#### Defined in

[engine/action/Action.ts:77](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L77)

## Properties

### \_defaultPermissions

• `Private` **\_defaultPermissions**: [Permission](permission.md) \| [Permission](permission.md)[]

#### Defined in

[engine/action/Action.ts:74](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L74)

___

### \_input

• `Private` **\_input**: `any`

#### Defined in

[engine/action/Action.ts:65](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L65)

___

### \_output

• `Private` **\_output**: `any`

#### Defined in

[engine/action/Action.ts:69](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L69)

___

### \_permissions

• `Private` `Readonly` **\_permissions**: [Permission](permission.md) \| [Permission](permission.md)[] \| (...`args`: `any`[]) => [Permission](permission.md) \| [Permission](permission.md)[]

#### Defined in

[engine/action/Action.ts:73](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L73)

___

### description

• **description**: `string`

#### Defined in

[engine/action/Action.ts:61](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L61)

___

### descriptionPermissions

• **descriptionPermissions**: `string` \| `boolean`

#### Defined in

[engine/action/Action.ts:75](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L75)

___

### input

• **input**: `any`

#### Defined in

[engine/action/Action.ts:64](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L64)

___

### name

• **name**: `string`

#### Defined in

[engine/action/Action.ts:60](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L60)

___

### output

• **output**: `any`

#### Defined in

[engine/action/Action.ts:68](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L68)

___

### permissions

• **permissions**: [Permission](permission.md) \| [Permission](permission.md)[]

#### Defined in

[engine/action/Action.ts:72](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L72)

___

### postProcessor

• `Optional` **postProcessor**: `ActionPostProcessor`

#### Defined in

[engine/action/Action.ts:77](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L77)

___

### preProcessor

• `Optional` **preProcessor**: `ActionPreProcessor`

#### Defined in

[engine/action/Action.ts:76](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L76)

___

### resolve

• **resolve**: `ActionResolver`

#### Defined in

[engine/action/Action.ts:70](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L70)

___

### type

• **type**: `string`

#### Defined in

[engine/action/Action.ts:71](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L71)

## Methods

### \_generatePermissionDescriptions

▸ **_generatePermissionDescriptions**(): `void`

#### Returns

`void`

#### Defined in

[engine/action/Action.ts:253](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L253)

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

[engine/action/Action.ts:267](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L267)

___

### \_processPermissions

▸ **_processPermissions**(): [Permission](permission.md) \| [Permission](permission.md)[]

#### Returns

[Permission](permission.md) \| [Permission](permission.md)[]

#### Defined in

[engine/action/Action.ts:237](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L237)

___

### getInput

▸ **getInput**(): `any`

#### Returns

`any`

#### Defined in

[engine/action/Action.ts:145](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L145)

___

### getOutput

▸ **getOutput**(): `any`

#### Returns

`any`

#### Defined in

[engine/action/Action.ts:191](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L191)

___

### getPermissions

▸ **getPermissions**(): [Permission](permission.md) \| [Permission](permission.md)[] \| (...`args`: `any`[]) => [Permission](permission.md) \| [Permission](permission.md)[]

#### Returns

[Permission](permission.md) \| [Permission](permission.md)[] \| (...`args`: `any`[]) => [Permission](permission.md) \| [Permission](permission.md)[]

#### Defined in

[engine/action/Action.ts:271](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L271)

___

### hasInput

▸ **hasInput**(): `boolean`

#### Returns

`boolean`

#### Defined in

[engine/action/Action.ts:187](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L187)

___

### hasOutput

▸ **hasOutput**(): `boolean`

#### Returns

`boolean`

#### Defined in

[engine/action/Action.ts:233](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L233)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/action/Action.ts:281](https://github.com/Enubia/shyft/blob/da240ce/src/engine/action/Action.ts#L281)
