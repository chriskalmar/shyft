---
id: "listdatatype"
title: "Class: ListDataType"
sidebar_label: "ListDataType"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [ComplexDataType](complexdatatype.md)

  ↳ **ListDataType**

## Constructors

### constructor

• **new ListDataType**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | [ListDataTypeSetupType](../index.md#listdatatypesetuptype) |

#### Overrides

[ComplexDataType](complexdatatype.md).[constructor](complexdatatype.md#constructor)

#### Defined in

[engine/datatype/ListDataType.ts:33](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L33)

## Properties

### \_itemType

• **\_itemType**: [DataType](datatype.md) \| [ComplexDataType](complexdatatype.md)

#### Defined in

[engine/datatype/ListDataType.ts:31](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L31)

___

### description

• **description**: `string`

#### Defined in

[engine/datatype/ListDataType.ts:29](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L29)

___

### itemType

• **itemType**: [Entity](entity.md) \| [ComplexDataType](complexdatatype.md) \| `DataTypeFunction`

#### Defined in

[engine/datatype/ListDataType.ts:30](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L30)

___

### maxItems

• `Optional` **maxItems**: `number`

#### Defined in

[engine/datatype/ListDataType.ts:33](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L33)

___

### minItems

• `Optional` **minItems**: `number`

#### Defined in

[engine/datatype/ListDataType.ts:32](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L32)

___

### name

• **name**: `string`

#### Defined in

[engine/datatype/ListDataType.ts:28](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L28)

___

### validate

• **validate**: `DataTypeValidateType`

#### Defined in

[engine/datatype/ListDataType.ts:127](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L127)

## Methods

### \_processItemType

▸ **_processItemType**(): [DataType](datatype.md) \| [ComplexDataType](complexdatatype.md)

#### Returns

[DataType](datatype.md) \| [ComplexDataType](complexdatatype.md)

#### Defined in

[engine/datatype/ListDataType.ts:91](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L91)

___

### getItemType

▸ **getItemType**(): [DataType](datatype.md) \| [ComplexDataType](complexdatatype.md)

#### Returns

[DataType](datatype.md) \| [ComplexDataType](complexdatatype.md)

#### Defined in

[engine/datatype/ListDataType.ts:118](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L118)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/datatype/ListDataType.ts:149](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ListDataType.ts#L149)
