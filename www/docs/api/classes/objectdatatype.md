---
id: "objectdatatype"
title: "Class: ObjectDataType"
sidebar_label: "ObjectDataType"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [ComplexDataType](complexdatatype.md)

  ↳ **ObjectDataType**

## Constructors

### constructor

• **new ObjectDataType**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `ObjectDataTypeSetupType` |

#### Overrides

[ComplexDataType](complexdatatype.md).[constructor](complexdatatype.md#constructor)

#### Defined in

[engine/datatype/ObjectDataType.ts:23](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L23)

## Properties

### \_attributes

• `Private` **\_attributes**: [AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/datatype/ObjectDataType.ts:23](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L23)

___

### \_attributesMap

• `Private` **\_attributesMap**: `AttributesSetupMap` \| [AttributesMapGenerator](../index.md#attributesmapgenerator)

#### Defined in

[engine/datatype/ObjectDataType.ts:22](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L22)

___

### attributes

• **attributes**: [AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/datatype/ObjectDataType.ts:21](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L21)

___

### description

• **description**: `string`

#### Defined in

[engine/datatype/ObjectDataType.ts:20](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L20)

___

### name

• **name**: `string`

#### Defined in

[engine/datatype/ObjectDataType.ts:19](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L19)

___

### validate

• **validate**: `DataTypeValidateType`

#### Defined in

[engine/datatype/ObjectDataType.ts:154](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L154)

## Methods

### \_processAttribute

▸ **_processAttribute**(`rawAttribute`, `attributeName`): `AttributeBase`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rawAttribute` | `AttributeBase` |
| `attributeName` | `string` |

#### Returns

`AttributeBase`

#### Defined in

[engine/datatype/ObjectDataType.ts:61](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L61)

___

### \_processAttributeMap

▸ **_processAttributeMap**(): [AttributesMap](../index.md#attributesmap)

#### Returns

[AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/datatype/ObjectDataType.ts:126](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L126)

___

### getAttributes

▸ **getAttributes**(): [AttributesMap](../index.md#attributesmap)

#### Returns

[AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/datatype/ObjectDataType.ts:52](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L52)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/datatype/ObjectDataType.ts:162](https://github.com/Enubia/shyft/blob/da240ce/src/engine/datatype/ObjectDataType.ts#L162)
