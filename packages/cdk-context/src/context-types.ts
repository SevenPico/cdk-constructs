export interface ContextProps {
  // Core labels — combined to compute the resource ID
  readonly namespace?: string;
  readonly tenant?: string;
  readonly environment?: string;
  readonly stage?: string;
  readonly name?: string;
  readonly region?: string;
  readonly project?: string;

  // Control
  readonly enabled?: boolean;
  readonly delimiter?: string;
  readonly attributes?: string[];

  // Naming configuration
  readonly labelOrder?: string[];
  readonly labelKeyCase?: string;
  readonly labelValueCase?: string;
  readonly regexReplaceChars?: string;
  readonly idLengthLimit?: number;

  // Tags
  readonly tags?: Record<string, string>;
  readonly additionalTagMap?: Record<string, string>;
  readonly labelsAsTags?: string[];

  // Advanced
  readonly descriptorFormats?: Record<string, string>;
  readonly domainName?: string;
  readonly dnsNameFormat?: string;
}

export interface Context {
  // Normalized input labels
  readonly namespace: string;
  readonly tenant: string;
  readonly environment: string;
  readonly stage: string;
  readonly name: string;
  readonly region: string;
  readonly project: string;

  // Normalized control values
  readonly enabled: boolean;
  readonly delimiter: string;
  readonly attributes: string[];
  readonly labelOrder: string[];
  readonly labelKeyCase: string;
  readonly labelValueCase: string;
  readonly regexReplaceChars: string;
  readonly idLengthLimit: number;

  // Normalized tag values
  readonly tags: Record<string, string>;
  readonly additionalTagMap: Record<string, string>;
  readonly labelsAsTags: string[];

  // Advanced
  readonly descriptorFormats: Record<string, string>;
  readonly domainName: string;
  readonly dnsNameFormat: string;

  // Computed outputs
  readonly id: string;
  readonly idFull: string;
}
