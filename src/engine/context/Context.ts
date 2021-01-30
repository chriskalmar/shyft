export interface Context {
  userId?: string | number;
  userRoles?: string[];
  loaders?: Record<string, unknown>;
  i18nLanguage?: string;
  custom?: Record<string, unknown>;
}
