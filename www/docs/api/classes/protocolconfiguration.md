---
id: "protocolconfiguration"
title: "Class: ProtocolConfiguration"
sidebar_label: "ProtocolConfiguration"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- **ProtocolConfiguration**

  ↳ [ProtocolGraphQLConfiguration](protocolgraphqlconfiguration.md)

## Constructors

### constructor

• **new ProtocolConfiguration**(`setup?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `setup` | `ProtocolConfigurationSetup` |

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:10](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L10)

## Properties

### features

• **features**: `Object`

#### Index signature

▪ [key: `string`]: `boolean`

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:9](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L9)

___

### getParentConfiguration

• **getParentConfiguration**: () => [Configuration](configuration.md)

#### Type declaration

▸ (): [Configuration](configuration.md)

##### Returns

[Configuration](configuration.md)

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

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:34](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L34)

___

### getEnabledFeatures

▸ **getEnabledFeatures**(): `Object`

#### Returns

`Object`

#### Defined in

[engine/protocol/ProtocolConfiguration.ts:43](https://github.com/Enubia/shyft/blob/da240ce/src/engine/protocol/ProtocolConfiguration.ts#L43)
