declare global {
  interface Window {
    google?: typeof google;
  }
}

export namespace google.accounts.id {
  export interface InitializeConfig {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    prompt_parent_id?: string;
    state_cookie_domain?: string;
    nonce?: string;
    context?: string;
  }

  export interface CredentialResponse {
    credential: string;
    select_by?: string;
  }

  export interface RenderButtonOptions {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string | number;
    locale?: string;
  }

  export function initialize(config: InitializeConfig): void;
  export function renderButton(parent: HTMLElement, options: RenderButtonOptions): void;
  export function prompt(callback?: (notification: unknown) => void): void;
  export function disableAutoSelect(): void;
  export function revoke(hint: string, callback: (response: unknown) => void): void;
}

export namespace google.accounts.oauth2 {
  export interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  }

  export interface TokenResponse {
    access_token: string;
    expires_in: string;
    hd?: string;
    prompt?: string;
    token_type: string;
    scope: string;
    state?: string;
  }

  export interface TokenClient {
    requestAccessToken(): void;
  }

  export function initTokenClient(config: TokenClientConfig): TokenClient;
}
