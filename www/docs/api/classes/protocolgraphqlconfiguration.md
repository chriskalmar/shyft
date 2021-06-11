---
id: "protocolgraphqlconfiguration"
title: "Class: ProtocolGraphQLConfiguration"
sidebar_label: "ProtocolGraphQLConfiguration"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [ProtocolConfiguration](protocolconfiguration.md)

  ↳ **ProtocolGraphQLConfiguration**

## Constructors

### constructor

• **new ProtocolGraphQLConfiguration**()

#### Overrides

[ProtocolConfiguration](protocolconfiguration.md).[constructor](protocolconfiguration.md#constructor)

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:13](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L13)

## Properties

### features

• **features**: `Object`

#### Index signature

▪ [key: `string`]: `boolean`

#### Inherited from

[ProtocolConfiguration](protocolconfiguration.md).[features](protocolconfiguration.md#features)

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:9](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L9)

___

### getParentConfiguration

• **getParentConfiguration**: () => [Configuration](configuration.md)

#### Type declaration

▸ (): [Configuration](configuration.md)

##### Returns

[Configuration](configuration.md)

#### Inherited from

[ProtocolConfiguration](protocolconfiguration.md).[getParentConfiguration](protocolconfiguration.md#getparentconfiguration)

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:10](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L10)

## Methods

### enableFeature

▸ **enableFeature**(`feature`, `enable?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `feature` | `string` | `undefined` |
| `enable` | `boolean` | true |

#### Returns

`void`

#### Inherited from

[ProtocolConfiguration](protocolconfiguration.md).[enableFeature](protocolconfiguration.md#enablefeature)

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:25](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L25)

___

### enableFeatures

▸ **enableFeatures**(`features`, `enable?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `features` | `string`[] | `undefined` |
| `enable` | `boolean` | true |

#### Returns

`void`

#### Inherited from

[ProtocolConfiguration](protocolconfiguration.md).[enableFeatures](protocolconfiguration.md#enablefeatures)

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:34](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L34)

___

### generateActionTypeName

▸ **generateActionTypeName**(`action`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | [Action](action.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:151](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L151)

___

### generateConnectionEdgeTypeName

▸ **generateConnectionEdgeTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:226](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L226)

___

### generateConnectionTypeName

▸ **generateConnectionTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:231](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L231)

___

### generateDataInputTypeName

▸ **generateDataInputTypeName**(`baseName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseName` | `string` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:155](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L155)

___

### generateDataOutPutTypeName

▸ **generateDataOutPutTypeName**(`baseName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseName` | `string` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:175](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L175)

___

### generateEntityTypeName

▸ **generateEntityTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) \| [ShadowEntity](shadowentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:39](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L39)

___

### generateEntityTypeNamePascalCase

▸ **generateEntityTypeNamePascalCase**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) \| [ShadowEntity](shadowentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:49](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L49)

___

### generateEntityTypeNamePlural

▸ **generateEntityTypeNamePlural**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) \| [ShadowEntity](shadowentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:43](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L43)

___

### generateEntityTypeNamePluralPascalCase

▸ **generateEntityTypeNamePluralPascalCase**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) \| [ShadowEntity](shadowentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:55](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L55)

___

### generateFieldName

▸ **generateFieldName**(`attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:85](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L85)

___

### generateFilterInputTypeName

▸ **generateFilterInputTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:206](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L206)

___

### generateFilterPreFilterInputTypeName

▸ **generateFilterPreFilterInputTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:211](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L211)

___

### generateFilterPreFilterParamsInputTypeName

▸ **generateFilterPreFilterParamsInputTypeName**(`entity`, `preFilter`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |
| `preFilter` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:216](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L216)

___

### generateI18nFieldName

▸ **generateI18nFieldName**(`attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:94](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L94)

___

### generateI18nFieldTypeName

▸ **generateI18nFieldTypeName**(`entity`, `attribute`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |
| `attribute` | `any` |

#### Returns

`any`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:99](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L99)

___

### generateI18nJsonFieldName

▸ **generateI18nJsonFieldName**(`attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:89](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L89)

___

### generateInputTypeName

▸ **generateInputTypeName**(`baseName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseName` | `string` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:171](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L171)

___

### generateInstanceByUniqueQueryTypeName

▸ **generateInstanceByUniqueQueryTypeName**(`entity`, `attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:114](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L114)

___

### generateInstanceQueryTypeName

▸ **generateInstanceQueryTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:110](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L110)

___

### generateInstanceUniquenessInputTypeName

▸ **generateInstanceUniquenessInputTypeName**(`entity`, `uniquenessAttributesName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |
| `uniquenessAttributesName` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:141](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L141)

___

### generateListQueryTypeName

▸ **generateListQueryTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:105](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L105)

___

### generateNestedDataInputTypeName

▸ **generateNestedDataInputTypeName**(`baseName`, `nestedParamName`, `level`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseName` | `string` |
| `nestedParamName` | `string` |
| `level` | `number` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:159](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L159)

___

### generateNestedDataOutPutTypeName

▸ **generateNestedDataOutPutTypeName**(`baseName`, `nestedParamName`, `level?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseName` | `string` |
| `nestedParamName` | `string` |
| `level?` | `number` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:179](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L179)

___

### generateOperationByPrimaryAttributeInputTypeName

▸ **generateOperationByPrimaryAttributeInputTypeName**(`entity`, `operation`, `attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:266](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L266)

___

### generateOperationByPrimaryAttributeTypeName

▸ **generateOperationByPrimaryAttributeTypeName**(`entity`, `operation`, `attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:322](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L322)

___

### generateOperationI18nAttributeInputTypeName

▸ **generateOperationI18nAttributeInputTypeName**(`entity`, `operation`, `attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `any` |
| `operation` | `any` |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:236](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L236)

___

### generateOperationInputTypeName

▸ **generateOperationInputTypeName**(`entity`, `operation`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:258](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L258)

___

### generateOperationInstanceInputTypeName

▸ **generateOperationInstanceInputTypeName**(`entity`, `operation`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:248](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L248)

___

### generateOperationInstanceNestedInputTypeName

▸ **generateOperationInstanceNestedInputTypeName**(`entity`, `operation`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:278](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L278)

___

### generateOperationNestedInputTypeName

▸ **generateOperationNestedInputTypeName**(`entity`, `operation`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:288](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L288)

___

### generateOperationNestedTypeName

▸ **generateOperationNestedTypeName**(`entity`, `operation`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:314](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L314)

___

### generateOperationOutputTypeName

▸ **generateOperationOutputTypeName**(`entity`, `operation`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:298](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L298)

___

### generateOperationTypeName

▸ **generateOperationTypeName**(`entity`, `operation`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) |
| `operation` | [Mutation](mutation.md) \| [Subscription](subscription.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:306](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L306)

___

### generateOutPutTypeName

▸ **generateOutPutTypeName**(`baseName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseName` | `string` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:191](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L191)

___

### generateReferenceFieldListName

▸ **generateReferenceFieldListName**(`referenceEntity`, `attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `referenceEntity` | `any` |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:77](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L77)

___

### generateReferenceFieldName

▸ **generateReferenceFieldName**(`referenceEntity`, `attribute`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `referenceEntity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) \| [ShadowEntity](shadowentity.md) |
| `attribute` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:69](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L69)

___

### generateReverseConnectionFieldName

▸ **generateReverseConnectionFieldName**(`sourceEntity`, `sourceAttributeName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sourceEntity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) \| [ShadowEntity](shadowentity.md) |
| `sourceAttributeName` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:61](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L61)

___

### generateSortInputTypeName

▸ **generateSortInputTypeName**(`entity`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:201](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L201)

___

### generateSortKeyName

▸ **generateSortKeyName**(`attribute`, `ascending?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `attribute` | `any` |
| `ascending?` | `boolean` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:195](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L195)

___

### generateUniquenessAttributesFieldName

▸ **generateUniquenessAttributesFieldName**(`_entity`, `attribute`, `uniquenessAttributesName`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |
| `attribute` | `any` |
| `uniquenessAttributesName` | `string` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:130](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L130)

___

### generateUniquenessAttributesName

▸ **generateUniquenessAttributesName**(`_entity`, `attributes`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_entity` | [Entity](entity.md) \| [ViewEntity](viewentity.md) |
| `attributes` | `any` |

#### Returns

`string`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:123](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L123)

___

### getEnabledFeatures

▸ **getEnabledFeatures**(): `Object`

#### Returns

`Object`

#### Inherited from

[ProtocolConfiguration](protocolconfiguration.md).[getEnabledFeatures](protocolconfiguration.md#getenabledfeatures)

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:43](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L43)

___

### getMaxPageSize

▸ **getMaxPageSize**(): `number`

#### Returns

`number`

#### Defined in

[graphqlProtocol/ProtocolGraphQLConfiguration.ts:33](https://github.com/Enubia/shyft/blob/da240ce/src/graphqlProtocol/ProtocolGraphQLConfiguration.ts#L33)
