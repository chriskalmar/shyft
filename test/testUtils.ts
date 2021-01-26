import { Context } from '../src/engine/context/Context';

export const asUser = (
  userId: number | string,
  userRoles: string[] = [],
  i18nLanguage = 'en',
): Context => {
  return {
    loaders: {},
    userId,
    userRoles,
    i18nLanguage,
  };
};

export const asAdmin = (userId = 1, i18nLanguage?: string): Context => {
  return asUser(userId, ['admin'], i18nLanguage);
};

export const asAnonymous = (i18nLanguage?: string): Context => {
  return {
    loaders: {},
    i18nLanguage,
  };
};

export const sleep = async (ms) =>
  new Promise((resolve) => {
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

  if (entity.name === 'Board') {
    delete ret.vip;
  }

  return ret;
};

export const removeListDynamicData = (entity, payloadList) => {
  return payloadList.map((payload) => {
    return removeDynamicData(entity, payload);
  });
};

export const removeId = (payload) => {
  const ret = {
    ...payload,
  };

  delete ret.id;

  return ret;
};
