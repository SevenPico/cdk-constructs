export interface BridgeConfig {
  // Required core labels
  readonly namespace: string;
  readonly environment: string;
  readonly stage: string;

  // Optional core labels
  readonly tenant?: string;
  readonly region?: string;
  readonly project?: string;

  // Optional context overrides
  readonly delimiter?: string;
  readonly labelOrder?: string[];
  readonly labelKeyCase?: string;
  readonly labelValueCase?: string;
  readonly idLengthLimit?: number;
  readonly enabled?: boolean;
  readonly tags?: Record<string, string>;
  readonly additionalTagMap?: Record<string, string>;
  readonly labelsAsTags?: string[];
}
