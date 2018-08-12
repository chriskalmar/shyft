import { passOrThrow, isString, isArray } from '../util';

class ProtocolConfiguration {
  constructor(setup = {}) {
    this.features = [];

    const { features } = setup;

    if (features) {
      this.enableFeatures(features);
    }
  }

  enableFeature(feature, enable = true) {
    passOrThrow(
      isString(feature),
      () => 'enableFeature() expects a feature name',
    );

    this.features[feature] = !!enable;
  }

  enableFeatures(features, enable = true) {
    passOrThrow(
      isArray(features),
      () => 'enableFeatures() expects an array of feature names',
    );

    features.map(feature => this.enableFeature(feature, enable));
  }

  getEnabledFeatures() {
    return this.features;
  }
}

export default ProtocolConfiguration;

export const isProtocolConfiguration = obj => {
  return obj instanceof ProtocolConfiguration;
};
