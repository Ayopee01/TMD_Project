export {};

declare global {
  interface Window {
    czpSdk?: {
      setTitle: (title: string, showBackButton: boolean) => void;
      getAppId: () => string;
      getToken: () => string; // mToken
      isCitizenPortal: () => boolean;
    };
  }
}
