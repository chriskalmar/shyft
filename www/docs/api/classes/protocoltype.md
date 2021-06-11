---
id: "protocoltype"
title: "Class: ProtocolType"
sidebar_label: "ProtocolType"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new ProtocolType**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `ProtocolTypeSetup` |

#### Defined in

[engine/protocol/ProtocolType.ts:47](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L47)

## Properties

### \_dataTypeMap

• `Private` **\_dataTypeMap**: `DataTypeMap`

#### Defined in

[engine/protocol/ProtocolType.ts:46](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L46)

___

### \_dynamicDataTypeMap

• `Private` **\_dynamicDataTypeMap**: `DynamicDataTypeMap`[]

#### Defined in

[engine/protocol/ProtocolType.ts:47](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L47)

___

### description

• **description**: `string`

#### Defined in

[engine/protocol/ProtocolType.ts:42](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L42)

___

### isProtocolDataType

• **isProtocolDataType**: (`protocolDataType`: `any`) => `boolean`

#### Type declaration

▸ (`protocolDataType`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `protocolDataType` | `any` |

##### Returns

`boolean`

#### Defined in

[engine/protocol/ProtocolType.ts:43](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L43)

___

### name

• **name**: `string`

#### Defined in

[engine/protocol/ProtocolType.ts:41](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L41)

___

### protocolConfiguration

• **protocolConfiguration**: [ProtocolConfiguration](protocolconfiguration.md)

#### Defined in

[engine/protocol/ProtocolType.ts:44](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L44)

## Methods

### addDataTypeMap

▸ **addDataTypeMap**(`schemaDataType`, `protocolDataType`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaDataType` | [DataType](datatype.md) \| `DataTypeFunction` |
| `protocolDataType` | `ProtocolDataType` |

#### Returns

`void`

#### Defined in

[engine/protocol/ProtocolType.ts:71](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L71)

___

### addDynamicDataTypeMap

▸ **addDynamicDataTypeMap**(`schemaDataTypeDetector`, `protocolDataType`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaDataTypeDetector` | `Function` |
| `protocolDataType` | `any` |

#### Returns

`void`

#### Defined in

[engine/protocol/ProtocolType.ts:98](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L98)

___

### convertToProtocolDataType

▸ **convertToProtocolDataType**(`schemaDataType`, `sourceName?`, `asInput?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaDataType` | [DataType](datatype.md) \| [ComplexDataType](complexdatatype.md) \| `DataTypeFunction` |
| `sourceName?` | `string` |
| `asInput?` | `boolean` |

#### Returns

`any`

#### Defined in

[engine/protocol/ProtocolType.ts:125](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L125)

___

### getProtocolConfiguration

▸ **getProtocolConfiguration**(): [ProtocolConfiguration](protocolconfiguration.md)

#### Returns

[ProtocolConfiguration](protocolconfiguration.md)

#### Defined in

[engine/protocol/ProtocolType.ts:169](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L169)

___

### setProtocolConfiguration

▸ **setProtocolConfiguration**(`protocolConfiguration`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `protocolConfiguration` | `any` |

#### Returns

`void`

#### Defined in

[engine/protocol/ProtocolType.ts:160](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L160)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/protocol/ProtocolType.ts:178](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolType.ts#L178)
