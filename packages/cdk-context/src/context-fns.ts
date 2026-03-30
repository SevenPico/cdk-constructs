import { createHash } from 'crypto';
import { CONTEXT_DEFAULTS } from './context-defaults';
import { Context, ContextProps } from './context-types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const normalize = (value: string, regex: RegExp): string => value.replace(regex, '');

const applyCase = (value: string, mode: string): string => {
  switch (mode) {
    case 'lower':
      return value.toLowerCase();
    case 'upper':
      return value.toUpperCase();
    case 'title':
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    case 'none':
      return value;
    default:
      return value.toLowerCase();
  }
};

const md5 = (s: string): string => createHash('md5').update(s).digest('hex');

const applyLengthLimit = (idFull: string, limit: number): string => {
  if (limit === 0 || idFull.length <= limit) return idFull;
  const hash = md5(idFull).slice(0, 5);
  const truncated = idFull.slice(0, limit - 6);
  return `${truncated}-${hash}`;
};

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

interface NormalizedProps {
  namespace: string;
  tenant: string;
  environment: string;
  stage: string;
  name: string;
  region: string;
  project: string;
  enabled: boolean;
  delimiter: string;
  attributes: string[];
  labelOrder: string[];
  labelKeyCase: string;
  labelValueCase: string;
  regexReplaceChars: string;
  idLengthLimit: number;
  tags: Record<string, string>;
  additionalTagMap: Record<string, string>;
  labelsAsTags: string[];
  descriptorFormats: Record<string, string>;
  domainName: string;
  dnsNameFormat: string;
}

const computeId = (props: NormalizedProps): { id: string; idFull: string } => {
  const regex = new RegExp(props.regexReplaceChars, 'g');
  const { delimiter, labelOrder, labelValueCase, attributes } = props;

  const labelMap: Record<string, string> = {
    namespace: applyCase(normalize(props.namespace, regex), labelValueCase),
    tenant: applyCase(normalize(props.tenant, regex), labelValueCase),
    project: applyCase(normalize(props.project, regex), labelValueCase),
    region: applyCase(normalize(props.region, regex), labelValueCase),
    environment: applyCase(normalize(props.environment, regex), labelValueCase),
    stage: applyCase(normalize(props.stage, regex), labelValueCase),
    name: applyCase(normalize(props.name, regex), labelValueCase),
    attributes: attributes.map(a => applyCase(normalize(a, regex), labelValueCase)).join(delimiter),
  };

  const labels = labelOrder.map(key => labelMap[key]).filter(v => v && v.length > 0);
  const idFull = labels.join(delimiter);
  const id = applyLengthLimit(idFull, props.idLengthLimit);

  return { id, idFull };
};

const computeTags = (props: NormalizedProps & { id: string }): Record<string, string> => {
  const labelValues: Record<string, string> = {
    namespace: props.namespace,
    tenant: props.tenant,
    environment: props.environment,
    stage: props.stage,
    name: props.name,
    region: props.region,
    project: props.project,
    attributes: props.attributes.join(props.delimiter),
  };

  const applyKeyCase = (key: string): string => applyCase(key, props.labelKeyCase);

  const labelTags = Object.fromEntries(
    props.labelsAsTags
      .filter(label => (labelValues[label]?.length ?? 0) > 0)
      .map(label => [applyKeyCase(label), labelValues[label]]),
  );

  return {
    ...labelTags,
    Name: props.id,
    ...props.additionalTagMap,
    ...props.tags,
  };
};

// ---------------------------------------------------------------------------
// Public pure functions
// ---------------------------------------------------------------------------

export const makeContext = (props: ContextProps): Context => {
  const normalized: NormalizedProps = {
    namespace: props.namespace ?? CONTEXT_DEFAULTS.namespace,
    tenant: props.tenant ?? CONTEXT_DEFAULTS.tenant,
    environment: props.environment ?? CONTEXT_DEFAULTS.environment,
    stage: props.stage ?? CONTEXT_DEFAULTS.stage,
    name: props.name ?? CONTEXT_DEFAULTS.name,
    region: props.region ?? CONTEXT_DEFAULTS.region,
    project: props.project ?? CONTEXT_DEFAULTS.project,
    enabled: props.enabled ?? CONTEXT_DEFAULTS.enabled,
    delimiter: props.delimiter ?? CONTEXT_DEFAULTS.delimiter,
    attributes: props.attributes ?? CONTEXT_DEFAULTS.attributes,
    labelOrder: props.labelOrder ?? CONTEXT_DEFAULTS.labelOrder,
    labelKeyCase: props.labelKeyCase ?? CONTEXT_DEFAULTS.labelKeyCase,
    labelValueCase: props.labelValueCase ?? CONTEXT_DEFAULTS.labelValueCase,
    regexReplaceChars: props.regexReplaceChars ?? CONTEXT_DEFAULTS.regexReplaceChars,
    idLengthLimit: props.idLengthLimit ?? CONTEXT_DEFAULTS.idLengthLimit,
    tags: props.tags ?? CONTEXT_DEFAULTS.tags,
    additionalTagMap: props.additionalTagMap ?? CONTEXT_DEFAULTS.additionalTagMap,
    labelsAsTags: props.labelsAsTags ?? CONTEXT_DEFAULTS.labelsAsTags,
    descriptorFormats: props.descriptorFormats ?? CONTEXT_DEFAULTS.descriptorFormats,
    domainName: props.domainName ?? CONTEXT_DEFAULTS.domainName,
    dnsNameFormat: props.dnsNameFormat ?? CONTEXT_DEFAULTS.dnsNameFormat,
  };

  const { id, idFull } = computeId(normalized);
  const tags = computeTags({ ...normalized, id });

  return { ...normalized, id, idFull, tags };
};

export const extendContext = (base: Context, overrides: ContextProps): Context => {
  const merged: ContextProps = {
    namespace: overrides.namespace?.length ? overrides.namespace : base.namespace,
    tenant: overrides.tenant?.length ? overrides.tenant : base.tenant,
    environment: overrides.environment?.length ? overrides.environment : base.environment,
    stage: overrides.stage?.length ? overrides.stage : base.stage,
    name: overrides.name?.length ? overrides.name : base.name,
    region: overrides.region?.length ? overrides.region : base.region,
    project: overrides.project?.length ? overrides.project : base.project,
    enabled: base.enabled && (overrides.enabled ?? true),
    delimiter: overrides.delimiter ?? base.delimiter,
    attributes: [...base.attributes, ...(overrides.attributes ?? [])],
    labelOrder: overrides.labelOrder ?? base.labelOrder,
    labelKeyCase: overrides.labelKeyCase ?? base.labelKeyCase,
    labelValueCase: overrides.labelValueCase ?? base.labelValueCase,
    regexReplaceChars: overrides.regexReplaceChars ?? base.regexReplaceChars,
    idLengthLimit: overrides.idLengthLimit ?? base.idLengthLimit,
    tags: { ...base.tags, ...(overrides.tags ?? {}) },
    additionalTagMap: { ...base.additionalTagMap, ...(overrides.additionalTagMap ?? {}) },
    labelsAsTags: overrides.labelsAsTags ?? base.labelsAsTags,
    descriptorFormats: overrides.descriptorFormats ?? base.descriptorFormats,
    domainName: overrides.domainName ?? base.domainName,
    dnsNameFormat: overrides.dnsNameFormat ?? base.dnsNameFormat,
  };

  return makeContext(merged);
};

export const contextId = (ctx: Context): string => ctx.id;

export const contextTags = (ctx: Context): Record<string, string> => ctx.tags;

export const isEnabled = (ctx: Context): boolean => ctx.enabled;
