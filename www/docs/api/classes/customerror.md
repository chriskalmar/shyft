---
id: "customerror"
title: "Class: CustomError"
sidebar_label: "CustomError"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `Error`

  ↳ **CustomError**

## Constructors

### constructor

• **new CustomError**(`message?`, `code?`, `status?`, `meta?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `code?` | `any` |
| `status?` | `any` |
| `meta?` | `any` |

#### Overrides

Error.constructor

#### Defined in

[engine/CustomError.ts:14](https://github.com/Enubia/shyft/blob/da240ce/src/engine/CustomError.ts#L14)

## Properties

### code

• **code**: `any`

#### Defined in

[engine/CustomError.ts:12](https://github.com/Enubia/shyft/blob/da240ce/src/engine/CustomError.ts#L12)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

[engine/CustomError.ts:7](https://github.com/Enubia/shyft/blob/da240ce/src/engine/CustomError.ts#L7)

___

### meta

• `Optional` **meta**: `any`

#### Defined in

[engine/CustomError.ts:14](https://github.com/Enubia/shyft/blob/da240ce/src/engine/CustomError.ts#L14)

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

[engine/CustomError.ts:6](https://github.com/Enubia/shyft/blob/da240ce/src/engine/CustomError.ts#L6)

___

### status

• `Optional` **status**: `any`

#### Defined in

[engine/CustomError.ts:13](https://github.com/Enubia/shyft/blob/da240ce/src/engine/CustomError.ts#L13)

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`object`, `objectConstructor?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `any` |
| `objectConstructor?` | `any` |

#### Returns

`any`

#### Inherited from

Error.captureStackTrace

#### Defined in

[engine/CustomError.ts:8](https://github.com/Enubia/shyft/blob/da240ce/src/engine/CustomError.ts#L8)
