export interface AppConfig {
  serviceRegistry: {
    url: string;
  };
  system: System;
  i18n: I18n;
}

export interface System {
  sdkUrl: string;
  dataMapEnumUrl: string;
  checkConsentAtOperator: boolean;
  serviceEditorUrl: string;
  editorSchemaPath: string;
  editorSchemaName: string;
  auth: Auth;
  mailTo:string;
  docsUrl:string;
}

export interface Auth {
  idmHost: string;
  clientId: string;
  disableAuth: string;
  authProfile: string;
  authRealm: string;
}

export interface I18n {
  locale: string;
  languages: string[];
}
