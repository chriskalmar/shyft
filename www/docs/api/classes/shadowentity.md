---
id: "shadowentity"
title: "Class: ShadowEntity"
sidebar_label: "ShadowEntity"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new ShadowEntity**(`setup`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `ShadowEntitySetup` |

#### Defined in

[engine/entity/ShadowEntity.ts:42](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L42)

## Properties

### \_attributes

• `Private` **\_attributes**: [AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/entity/ShadowEntity.ts:41](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L41)

___

### \_attributesMap

• `Private` **\_attributesMap**: `AttributesSetupMap` \| [AttributesMapGenerator](../index.md#attributesmapgenerator)

#### Defined in

[engine/entity/ShadowEntity.ts:38](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L38)

___

### \_primaryAttribute

• `Private` **\_primaryAttribute**: `Attribute`

#### Defined in

[engine/entity/ShadowEntity.ts:39](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L39)

___

### isFallbackStorageType

• **isFallbackStorageType**: `any`

#### Defined in

[engine/entity/ShadowEntity.ts:42](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L42)

___

### isUserEntity

• `Optional` **isUserEntity**: `boolean`

#### Defined in

[engine/entity/ShadowEntity.ts:36](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L36)

___

### meta

• `Optional` **meta**: `any`

#### Defined in

[engine/entity/ShadowEntity.ts:37](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L37)

___

### name

• **name**: `string`

#### Defined in

[engine/entity/ShadowEntity.ts:34](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L34)

___

### referencedByEntities

• `Private` **referencedByEntities**: `any`

#### Defined in

[engine/entity/ShadowEntity.ts:40](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L40)

___

### storageType

• `Optional` **storageType**: `any`

#### Defined in

[engine/entity/ShadowEntity.ts:35](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L35)

## Methods

### \_checkSystemAttributeNameCollision

▸ **_checkSystemAttributeNameCollision**(`attributeMap`, `attributeName`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeMap` | `any` |
| `attributeName` | `any` |

#### Returns

`void`

#### Defined in

[engine/entity/ShadowEntity.ts:106](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L106)

___

### \_collectSystemAttributes

▸ **_collectSystemAttributes**(`attributeMap`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeMap` | `any` |

#### Returns

`any`[]

#### Defined in

[engine/entity/ShadowEntity.ts:237](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L237)

___

### \_injectStorageTypeBySchema

▸ **_injectStorageTypeBySchema**(`storageType`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `storageType` | `any` |

#### Returns

`void`

#### Defined in

[engine/entity/ShadowEntity.ts:86](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L86)

___

### \_processAttribute

▸ **_processAttribute**(`rawAttribute`, `attributeName`): `Attribute`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rawAttribute` | `any` |
| `attributeName` | `any` |

#### Returns

`Attribute`

#### Defined in

[engine/entity/ShadowEntity.ts:114](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L114)

___

### \_processAttributeMap

▸ **_processAttributeMap**(): `Object`

#### Returns

`Object`

#### Defined in

[engine/entity/ShadowEntity.ts:250](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L250)

___

### getAttributes

▸ **getAttributes**(): [AttributesMap](../index.md#attributesmap)

#### Returns

[AttributesMap](../index.md#attributesmap)

#### Defined in

[engine/entity/ShadowEntity.ts:97](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L97)

___

### getPrimaryAttribute

▸ **getPrimaryAttribute**(): `Attribute`

#### Returns

`Attribute`

#### Defined in

[engine/entity/ShadowEntity.ts:318](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L318)

___

### getStorageType

▸ **getStorageType**(): `any`

#### Returns

`any`

#### Defined in

[engine/entity/ShadowEntity.ts:334](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L334)

___

### referenceAttribute

▸ **referenceAttribute**(`attributeName`): `AttributeBase`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attributeName` | `any` |

#### Returns

`AttributeBase`

#### Defined in

[engine/entity/ShadowEntity.ts:322](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L322)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[engine/entity/ShadowEntity.ts:338](https://github.com/Enubia/shyft/blob/da240ce/src/engine/entity/ShadowEntity.ts#L338)
