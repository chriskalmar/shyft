export const asUser = (userId, userRoles = [], i18nLanguage) => {
  return {
    loaders: {},
    userId,
    userRoles,
    i18nLanguage,
  };
};

export const asAdmin = (userId = 1, i18nLanguage) => {
  return asUser(userId, ['admin'], i18nLanguage);
};

export const sleep = async ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const removeDynamicData = (entity, payload) => {
  const ret = {
    ...payload,
  };

  delete ret.createdAt;
  delete ret.updatedAt;

  if (entity.name === 'Profile') {
    delete ret.registeredAt;
  }

  return ret;
};

export const removeListDynamicData = (entity, payloadList) => {
  return payloadList.map(payload => {
    return removeDynamicData(entity, payload);
  });
};

export const removeId = payload => {
  const ret = {
    ...payload,
  };

  delete ret.id;

  return ret;
};
