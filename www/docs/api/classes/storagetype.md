---
id: "storagetype"
title: "Class: StorageType"
sidebar_label: "StorageType"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new StorageType**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `StorageTypeSetup` |

#### Defined in

[engine/storage/StorageType.ts:62](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L62)

## Properties

### \_dataTypeMap

• `Private` **\_dataTypeMap**: `any`

#### Defined in

[engine/storage/StorageType.ts:60](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L60)

___

### \_dynamicDataTypeMap

• `Private` **\_dynamicDataTypeMap**: `any`

#### Defined in

[engine/storage/StorageType.ts:61](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L61)

___

### checkLookupPermission

• **checkLookupPermission**: (...`arg`: `any`[]) => `any`

#### Type declaration

▸ (...`arg`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...arg` | `any`[] |

##### Returns

`any`

#### Defined in

[engine/storage/StorageType.ts:58](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L58)

___

### count

• **count**: (...`arg`: `any`[]) => `any`

#### Type declaration

▸ (...`arg`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...arg` | `any`[] |

##### Returns

`any`

#### Defined in

[engine/storage/StorageType.ts:56](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L56)

___

### description

• **description**: `string`

#### Defined in

[engine/storage/StorageType.ts:52](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L52)

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

[engine/storage/StorageType.ts:55](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L55)

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

[engine/storage/StorageType.ts:53](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L53)

___

### findOneByValues

• **findOneByValues**: (...`arg`: `any`[]) => `any`

#### Type declaration

▸ (...`arg`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...arg` | `any`[] |

##### Returns

`any`

#### Defined in

[engine/storage/StorageType.ts:54](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L54)

___

### mutate

• **mutate**: (...`args`: `any`[]) => `any`

#### Type declaration

▸ (...`args`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`any`

#### Defined in

[engine/storage/StorageType.ts:57](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L57)

___

### name

• **name**: `string`

#### Defined in

[engine/storage/StorageType.ts:51](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L51)

___

### storageConfiguration

• **storageConfiguration**: [StorageConfiguration](storageconfiguration.md)

#### Defined in

[engine/storage/StorageType.ts:62](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L62)

## Methods

### addDataTypeMap

▸ **addDataTypeMap**(`schemaDataType`, `storageDataType`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaDataType` | [DataType](datatype.md) |
| `storageDataType` | [StorageDataType](storagedatatype.md) |

#### Returns

`void`

#### Defined in

[engine/storage/StorageType.ts:125](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L125)

___

### addDynamicDataTypeMap

▸ **addDynamicDataTypeMap**(`schemaDataTypeDetector`, `storageDataType`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaDataTypeDetector` | (...`args`: `any`[]) => `any` |
| `storageDataType` | [StorageDataType](storagedatatype.md) \| (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Defined in

[engine/storage/StorageType.ts:151](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L151)

___

### convertToStorageDataType

▸ **convertToStorageDataType**(`schemaDataType`): [StorageDataType](storagedatatype.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaDataType` | [DataType](datatype.md) \| [ComplexDataType](complexdatatype.md) |

#### Returns

[StorageDataType](storagedatatype.md)

#### Defined in

[engine/storage/StorageType.ts:177](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L177)

___

### getStorageConfiguration

▸ **getStorageConfiguration**(): [StorageConfiguration](storageconfiguration.md)

#### Returns

[StorageConfiguration](storageconfiguration.md)

#### Defined in

[engine/storage/StorageType.ts:220](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L220)

___

### getStorageInstance

▸ **getStorageInstance**(): `Connection`

#### Returns

`Connection`

#### Defined in

[engine/storage/StorageType.ts:229](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L229)

___

### getStorageModels

▸ **getStorageModels**(): `any`

#### Returns

`any`

#### Defined in

[engine/storage/StorageType.ts:233](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L233)

___

### setStorageConfiguration

▸ **setStorageConfiguration**(`storageConfiguration`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `storageConfiguration` | [StorageConfiguration](storageconfiguration.md) |

#### Returns

`void`

#### Defined in

[engine/storage/StorageType.ts:211](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L211)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/storage/StorageType.ts:237](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageType.ts#L237)
