export interface AppConfig {
  readonly port: number;
  readonly sourceConfigPath: string;
  readonly frontendDistPath: string;
  readonly publicUrl: string;
  readonly environment: string;
}
