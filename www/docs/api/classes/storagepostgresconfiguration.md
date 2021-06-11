---
id: "storagepostgresconfiguration"
title: "Class: StoragePostgresConfiguration"
sidebar_label: "StoragePostgresConfiguration"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [StorageConfiguration](storageconfiguration.md)

  ↳ **StoragePostgresConfiguration**

## Constructors

### constructor

• **new StoragePostgresConfiguration**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `Object` |

#### Overrides

[StorageConfiguration](storageconfiguration.md).[constructor](storageconfiguration.md#constructor)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:18](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L18)

## Properties

### connectionConfig

• **connectionConfig**: `any`

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[connectionConfig](storageconfiguration.md#connectionconfig)

#### Defined in

[engine/storage/StorageConfiguration.ts:17](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L17)

___

### getParentConfiguration

• **getParentConfiguration**: () => [Configuration](configuration.md)

#### Type declaration

▸ (): [Configuration](configuration.md)

##### Returns

[Configuration](configuration.md)

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[getParentConfiguration](storageconfiguration.md#getparentconfiguration)

#### Defined in

[engine/storage/StorageConfiguration.ts:18](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L18)

___

### name

• **name**: `string`

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[name](storageconfiguration.md#name)

#### Defined in

[engine/storage/StorageConfiguration.ts:14](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L14)

___

### storageInstance

• **storageInstance**: `Connection`

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[storageInstance](storageconfiguration.md#storageinstance)

#### Defined in

[engine/storage/StorageConfiguration.ts:15](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L15)

___

### storageModels

• **storageModels**: `any`

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[storageModels](storageconfiguration.md#storagemodels)

#### Defined in

[engine/storage/StorageConfiguration.ts:16](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L16)

## Methods

### \_generateGetAttributeTranslationFunction

▸ **_generateGetAttributeTranslationFunction**(`configuration`, `templateFileName`, `functionName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | `any` |
| `templateFileName` | `any` |
| `functionName` | `any` |

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:96](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L96)

___

### \_generateGetStateFunction

▸ **_generateGetStateFunction**(`configuration`, `templateFileName`, `functionName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |
| `templateFileName` | `string` |
| `functionName` | `string` |

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:26](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L26)

___

### createI18nIndices

▸ **createI18nIndices**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[createI18nIndices](storageconfiguration.md#createi18nindices)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:226](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L226)

___

### generateGetAttributeTranslationFunction

▸ **generateGetAttributeTranslationFunction**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateGetAttributeTranslationFunction](storageconfiguration.md#generategetattributetranslationfunction)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:117](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L117)

___

### generateGetAttributeTranslationFunctionName

▸ **generateGetAttributeTranslationFunctionName**(): `string`

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:114](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L114)

___

### generateGetAttributeTranslationsFunction

▸ **generateGetAttributeTranslationsFunction**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateGetAttributeTranslationsFunction](storageconfiguration.md#generategetattributetranslationsfunction)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:130](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L130)

___

### generateGetAttributeTranslationsFunctionName

▸ **generateGetAttributeTranslationsFunctionName**(): `string`

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:127](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L127)

___

### generateGetStateIdFunction

▸ **generateGetStateIdFunction**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateGetStateIdFunction](storageconfiguration.md#generategetstateidfunction)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:58](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L58)

___

### generateGetStateIdFunctionName

▸ **generateGetStateIdFunctionName**(): `string`

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:56](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L56)

___

### generateGetStateIdsFunction

▸ **generateGetStateIdsFunction**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateGetStateIdsFunction](storageconfiguration.md#generategetstateidsfunction)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:68](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L68)

___

### generateGetStateIdsFunctionName

▸ **generateGetStateIdsFunctionName**(): `string`

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:66](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L66)

___

### generateGetStateMapFunction

▸ **generateGetStateMapFunction**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateGetStateMapFunction](storageconfiguration.md#generategetstatemapfunction)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:78](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L78)

___

### generateGetStateMapFunctionName

▸ **generateGetStateMapFunctionName**(): `string`

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:76](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L76)

___

### generateGetStateNameFunction

▸ **generateGetStateNameFunction**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateGetStateNameFunction](storageconfiguration.md#generategetstatenamefunction)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:88](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L88)

___

### generateGetStateNameFunctionName

▸ **generateGetStateNameFunctionName**(): `string`

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:86](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L86)

___

### generateI18nIndices

▸ **generateI18nIndices**(`configuration`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | `any` |

#### Returns

`any`[]

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:152](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L152)

___

### generateI18nIndicesMigration

▸ **generateI18nIndicesMigration**(`configuration`, `manager`): `Promise`<`Object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |
| `manager` | `EntityManager` |

#### Returns

`Promise`<`Object`\>

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateI18nIndicesMigration](storageconfiguration.md#generatei18nindicesmigration)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:242](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L242)

___

### generateMergeTranslationsFunction

▸ **generateMergeTranslationsFunction**(`configuration`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [Configuration](configuration.md) |

#### Returns

`string`

#### Overrides

[StorageConfiguration](storageconfiguration.md).[generateMergeTranslationsFunction](storageconfiguration.md#generatemergetranslationsfunction)

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:142](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L142)

___

### generateMergeTranslationsFunctionName

▸ **generateMergeTranslationsFunctionName**(): `string`

#### Returns

`string`

#### Defined in

[storage-connector/StoragePostgresConfiguration.ts:140](https://github.com/Enubia/shyft/blob/da240ce/src/storage-connector/StoragePostgresConfiguration.ts#L140)

___

### getConnectionConfig

▸ **getConnectionConfig**(): `any`

#### Returns

`any`

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[getConnectionConfig](storageconfiguration.md#getconnectionconfig)

#### Defined in

[engine/storage/StorageConfiguration.ts:72](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L72)

___

### getStorageInstance

▸ **getStorageInstance**(): `Connection`

#### Returns

`Connection`

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[getStorageInstance](storageconfiguration.md#getstorageinstance)

#### Defined in

[engine/storage/StorageConfiguration.ts:46](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L46)

___

### getStorageModels

▸ **getStorageModels**(): `any`

#### Returns

`any`

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[getStorageModels](storageconfiguration.md#getstoragemodels)

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

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[setConnectionConfig](storageconfiguration.md#setconnectionconfig)

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

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[setStorageInstance](storageconfiguration.md#setstorageinstance)

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

#### Inherited from

[StorageConfiguration](storageconfiguration.md).[setStorageModels](storageconfiguration.md#setstoragemodels)

#### Defined in

[engine/storage/StorageConfiguration.ts:55](https://github.com/Enubia/shyft/blob/da240ce/src/engine/storage/StorageConfiguration.ts#L55)
