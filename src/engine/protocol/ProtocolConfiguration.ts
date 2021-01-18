import { passOrThrow, isString, isArray } from '../util';
import { Configuration } from '../configuration/Configuration';

export type ProtocolConfigurationSetup = {
  features?: string[];
};

export class ProtocolConfiguration {
  features: { [key: string]: boolean };
  getParentConfiguration: () => Configuration;

  constructor(
    setup: ProtocolConfigurationSetup = {} as ProtocolConfigurationSetup,
  ) {
    // this.features = [];
    this.features = {};

    const { features } = setup;

    if (features) {
      this.enableFeatures(features);
    }
  }

  enableFeature(feature: string, enable = true): void {
    passOrThrow(
      isString(feature),
      () => 'enableFeature() expects a feature name',
    );

    this.features[feature] = !!enable;
  }

  enableFeatures(features: string[], enable = true): void {
    passOrThrow(
      isArray(features),
      () => 'enableFeatures() expects an array of feature names',
    );

    features.map((feature) => this.enableFeature(feature, enable));
  }

  getEnabledFeatures(): { [key: string]: boolean } {
    return this.features;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isProtocolConfiguration = (
  obj: unknown,
): obj is ProtocolConfiguration => {
  return obj instanceof ProtocolConfiguration;
};
