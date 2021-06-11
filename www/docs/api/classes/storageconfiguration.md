---
id: "storageconfiguration"
title: "Class: StorageConfiguration"
sidebar_label: "StorageConfiguration"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- **StorageConfiguration**

  ↳ [StoragePostgresConfiguration](storagepostgresconfiguration.md)

## Constructors

### constructor

• **new StorageConfiguration**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `StorageConfigurationSetup` |

#### Defined in

[engine/storage/StorageConfiguration.ts:18](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L18)

## Properties

### connectionConfig

• **connectionConfig**: `any`

#### Defined in

[engine/storage/StorageConfiguration.ts:17](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L17)

___

### getParentConfiguration

• **getParentConfiguration**: () => [Configuration](configuration.md)

#### Type declaration

▸ (): [Configuration](configuration.md)

##### Returns

[Configuration](configuration.md)

#### Defined in

[engine/storage/StorageConfiguration.ts:18](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L18)

___

### name

• **name**: `string`

#### Defined in

[engine/storage/StorageConfiguration.ts:14](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L14)

___

### storageInstance

• **storageInstance**: `Connection`

#### Defined in

[engine/storage/StorageConfiguration.ts:15](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L15)

___

### storageModels

• **storageModels**: `any`

#### Defined in

[engine/storage/StorageConfiguration.ts:16](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L16)

## Methods

### createI18nIndices

▸ **createI18nIndices**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:144](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L144)

___

### generateGetAttributeTranslationFunction

▸ **generateGetAttributeTranslationFunction**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:117](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L117)

___

### generateGetAttributeTranslationsFunction

▸ **generateGetAttributeTranslationsFunction**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:126](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L126)

___

### generateGetStateIdFunction

▸ **generateGetStateIdFunction**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:81](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L81)

___

### generateGetStateIdsFunction

▸ **generateGetStateIdsFunction**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:90](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L90)

___

### generateGetStateMapFunction

▸ **generateGetStateMapFunction**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:99](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L99)

___

### generateGetStateNameFunction

▸ **generateGetStateNameFunction**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:108](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L108)

___

### generateI18nIndicesMigration

▸ **generateI18nIndicesMigration**(`_configuration`, `_manager`): `Promise`<`Object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |
| `_manager` | `unknown` |

#### Returns

`Promise`<`Object`\>

#### Defined in

[engine/storage/StorageConfiguration.ts:153](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L153)

___

### generateMergeTranslationsFunction

▸ **generateMergeTranslationsFunction**(`_configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Defined in

[engine/storage/StorageConfiguration.ts:135](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L135)

___

### getConnectionConfig

▸ **getConnectionConfig**(): `any`

#### Returns

`any`

#### Defined in

[engine/storage/StorageConfiguration.ts:72](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L72)

___

### getStorageInstance

▸ **getStorageInstance**(): `Connection`

#### Returns

`Connection`

#### Defined in

[engine/storage/StorageConfiguration.ts:46](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L46)

___

### getStorageModels

▸ **getStorageModels**(): `any`

#### Returns

`any`

#### Defined in

[engine/storage/StorageConfiguration.ts:59](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L59)

___

### setConnectionConfig

▸ **setConnectionConfig**(`connectionConfig`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `connectionConfig` | `any` |

#### Returns

`void`

#### Defined in

[engine/storage/StorageConfiguration.ts:68](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L68)

___

### setStorageInstance

▸ **setStorageInstance**(`storageInstance`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `storageInstance` | `Connection` |

#### Returns

`void`

#### Defined in

[engine/storage/StorageConfiguration.ts:42](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L42)

___

### setStorageModels

▸ **setStorageModels**(`storageModels`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `storageModels` | `any` |

#### Returns

`void`

#### Defined in

[engine/storage/StorageConfiguration.ts:55](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L55)
