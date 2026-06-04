# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### Context <a name="Context" id="@sevenpico/cdk-context.Context"></a>

#### Initializer <a name="Initializer" id="@sevenpico/cdk-context.Context.Initializer"></a>

```typescript
import { Context } from '@sevenpico/cdk-context'

const context: Context = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@sevenpico/cdk-context.Context.property.additionalTagMap">additionalTagMap</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.attributes">attributes</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.delimiter">delimiter</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.descriptorFormats">descriptorFormats</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.dnsNameFormat">dnsNameFormat</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.enabled">enabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.environment">environment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.idFull">idFull</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.idLengthLimit">idLengthLimit</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.labelKeyCase">labelKeyCase</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.labelOrder">labelOrder</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.labelsAsTags">labelsAsTags</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.labelValueCase">labelValueCase</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.namespace">namespace</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.project">project</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.regexReplaceChars">regexReplaceChars</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.stage">stage</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.Context.property.tenant">tenant</a></code> | <code>string</code> | *No description.* |

---

##### `additionalTagMap`<sup>Required</sup> <a name="additionalTagMap" id="@sevenpico/cdk-context.Context.property.additionalTagMap"></a>

```typescript
public readonly additionalTagMap: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `attributes`<sup>Required</sup> <a name="attributes" id="@sevenpico/cdk-context.Context.property.attributes"></a>

```typescript
public readonly attributes: string[];
```

- *Type:* string[]

---

##### `delimiter`<sup>Required</sup> <a name="delimiter" id="@sevenpico/cdk-context.Context.property.delimiter"></a>

```typescript
public readonly delimiter: string;
```

- *Type:* string

---

##### `descriptorFormats`<sup>Required</sup> <a name="descriptorFormats" id="@sevenpico/cdk-context.Context.property.descriptorFormats"></a>

```typescript
public readonly descriptorFormats: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `dnsNameFormat`<sup>Required</sup> <a name="dnsNameFormat" id="@sevenpico/cdk-context.Context.property.dnsNameFormat"></a>

```typescript
public readonly dnsNameFormat: string;
```

- *Type:* string

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="@sevenpico/cdk-context.Context.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `enabled`<sup>Required</sup> <a name="enabled" id="@sevenpico/cdk-context.Context.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean

---

##### `environment`<sup>Required</sup> <a name="environment" id="@sevenpico/cdk-context.Context.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

---

##### `id`<sup>Required</sup> <a name="id" id="@sevenpico/cdk-context.Context.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

---

##### `idFull`<sup>Required</sup> <a name="idFull" id="@sevenpico/cdk-context.Context.property.idFull"></a>

```typescript
public readonly idFull: string;
```

- *Type:* string

---

##### `idLengthLimit`<sup>Required</sup> <a name="idLengthLimit" id="@sevenpico/cdk-context.Context.property.idLengthLimit"></a>

```typescript
public readonly idLengthLimit: number;
```

- *Type:* number

---

##### `labelKeyCase`<sup>Required</sup> <a name="labelKeyCase" id="@sevenpico/cdk-context.Context.property.labelKeyCase"></a>

```typescript
public readonly labelKeyCase: string;
```

- *Type:* string

---

##### `labelOrder`<sup>Required</sup> <a name="labelOrder" id="@sevenpico/cdk-context.Context.property.labelOrder"></a>

```typescript
public readonly labelOrder: string[];
```

- *Type:* string[]

---

##### `labelsAsTags`<sup>Required</sup> <a name="labelsAsTags" id="@sevenpico/cdk-context.Context.property.labelsAsTags"></a>

```typescript
public readonly labelsAsTags: string[];
```

- *Type:* string[]

---

##### `labelValueCase`<sup>Required</sup> <a name="labelValueCase" id="@sevenpico/cdk-context.Context.property.labelValueCase"></a>

```typescript
public readonly labelValueCase: string;
```

- *Type:* string

---

##### `name`<sup>Required</sup> <a name="name" id="@sevenpico/cdk-context.Context.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `namespace`<sup>Required</sup> <a name="namespace" id="@sevenpico/cdk-context.Context.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string

---

##### `project`<sup>Required</sup> <a name="project" id="@sevenpico/cdk-context.Context.property.project"></a>

```typescript
public readonly project: string;
```

- *Type:* string

---

##### `regexReplaceChars`<sup>Required</sup> <a name="regexReplaceChars" id="@sevenpico/cdk-context.Context.property.regexReplaceChars"></a>

```typescript
public readonly regexReplaceChars: string;
```

- *Type:* string

---

##### `region`<sup>Required</sup> <a name="region" id="@sevenpico/cdk-context.Context.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `stage`<sup>Required</sup> <a name="stage" id="@sevenpico/cdk-context.Context.property.stage"></a>

```typescript
public readonly stage: string;
```

- *Type:* string

---

##### `tags`<sup>Required</sup> <a name="tags" id="@sevenpico/cdk-context.Context.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `tenant`<sup>Required</sup> <a name="tenant" id="@sevenpico/cdk-context.Context.property.tenant"></a>

```typescript
public readonly tenant: string;
```

- *Type:* string

---

### ContextProps <a name="ContextProps" id="@sevenpico/cdk-context.ContextProps"></a>

#### Initializer <a name="Initializer" id="@sevenpico/cdk-context.ContextProps.Initializer"></a>

```typescript
import { ContextProps } from '@sevenpico/cdk-context'

const contextProps: ContextProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.additionalTagMap">additionalTagMap</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.attributes">attributes</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.delimiter">delimiter</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.descriptorFormats">descriptorFormats</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.dnsNameFormat">dnsNameFormat</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.enabled">enabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.environment">environment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.idLengthLimit">idLengthLimit</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.labelKeyCase">labelKeyCase</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.labelOrder">labelOrder</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.labelsAsTags">labelsAsTags</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.labelValueCase">labelValueCase</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.namespace">namespace</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.project">project</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.regexReplaceChars">regexReplaceChars</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.stage">stage</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextProps.property.tenant">tenant</a></code> | <code>string</code> | *No description.* |

---

##### `additionalTagMap`<sup>Optional</sup> <a name="additionalTagMap" id="@sevenpico/cdk-context.ContextProps.property.additionalTagMap"></a>

```typescript
public readonly additionalTagMap: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `attributes`<sup>Optional</sup> <a name="attributes" id="@sevenpico/cdk-context.ContextProps.property.attributes"></a>

```typescript
public readonly attributes: string[];
```

- *Type:* string[]

---

##### `delimiter`<sup>Optional</sup> <a name="delimiter" id="@sevenpico/cdk-context.ContextProps.property.delimiter"></a>

```typescript
public readonly delimiter: string;
```

- *Type:* string

---

##### `descriptorFormats`<sup>Optional</sup> <a name="descriptorFormats" id="@sevenpico/cdk-context.ContextProps.property.descriptorFormats"></a>

```typescript
public readonly descriptorFormats: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `dnsNameFormat`<sup>Optional</sup> <a name="dnsNameFormat" id="@sevenpico/cdk-context.ContextProps.property.dnsNameFormat"></a>

```typescript
public readonly dnsNameFormat: string;
```

- *Type:* string

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="@sevenpico/cdk-context.ContextProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `enabled`<sup>Optional</sup> <a name="enabled" id="@sevenpico/cdk-context.ContextProps.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean

---

##### `environment`<sup>Optional</sup> <a name="environment" id="@sevenpico/cdk-context.ContextProps.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

---

##### `idLengthLimit`<sup>Optional</sup> <a name="idLengthLimit" id="@sevenpico/cdk-context.ContextProps.property.idLengthLimit"></a>

```typescript
public readonly idLengthLimit: number;
```

- *Type:* number

---

##### `labelKeyCase`<sup>Optional</sup> <a name="labelKeyCase" id="@sevenpico/cdk-context.ContextProps.property.labelKeyCase"></a>

```typescript
public readonly labelKeyCase: string;
```

- *Type:* string

---

##### `labelOrder`<sup>Optional</sup> <a name="labelOrder" id="@sevenpico/cdk-context.ContextProps.property.labelOrder"></a>

```typescript
public readonly labelOrder: string[];
```

- *Type:* string[]

---

##### `labelsAsTags`<sup>Optional</sup> <a name="labelsAsTags" id="@sevenpico/cdk-context.ContextProps.property.labelsAsTags"></a>

```typescript
public readonly labelsAsTags: string[];
```

- *Type:* string[]

---

##### `labelValueCase`<sup>Optional</sup> <a name="labelValueCase" id="@sevenpico/cdk-context.ContextProps.property.labelValueCase"></a>

```typescript
public readonly labelValueCase: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="@sevenpico/cdk-context.ContextProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="@sevenpico/cdk-context.ContextProps.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string

---

##### `project`<sup>Optional</sup> <a name="project" id="@sevenpico/cdk-context.ContextProps.property.project"></a>

```typescript
public readonly project: string;
```

- *Type:* string

---

##### `regexReplaceChars`<sup>Optional</sup> <a name="regexReplaceChars" id="@sevenpico/cdk-context.ContextProps.property.regexReplaceChars"></a>

```typescript
public readonly regexReplaceChars: string;
```

- *Type:* string

---

##### `region`<sup>Optional</sup> <a name="region" id="@sevenpico/cdk-context.ContextProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `stage`<sup>Optional</sup> <a name="stage" id="@sevenpico/cdk-context.ContextProps.property.stage"></a>

```typescript
public readonly stage: string;
```

- *Type:* string

---

##### `tags`<sup>Optional</sup> <a name="tags" id="@sevenpico/cdk-context.ContextProps.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `tenant`<sup>Optional</sup> <a name="tenant" id="@sevenpico/cdk-context.ContextProps.property.tenant"></a>

```typescript
public readonly tenant: string;
```

- *Type:* string

---

## Classes <a name="Classes" id="Classes"></a>

### ContextFns <a name="ContextFns" id="@sevenpico/cdk-context.ContextFns"></a>

#### Initializers <a name="Initializers" id="@sevenpico/cdk-context.ContextFns.Initializer"></a>

```typescript
import { ContextFns } from '@sevenpico/cdk-context'

new ContextFns()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@sevenpico/cdk-context.ContextFns.extend">extend</a></code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextFns.id">id</a></code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextFns.isEnabled">isEnabled</a></code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextFns.make">make</a></code> | *No description.* |
| <code><a href="#@sevenpico/cdk-context.ContextFns.tags">tags</a></code> | *No description.* |

---

##### `extend` <a name="extend" id="@sevenpico/cdk-context.ContextFns.extend"></a>

```typescript
import { ContextFns } from '@sevenpico/cdk-context'

ContextFns.extend(base: Context, overrides: ContextProps)
```

###### `base`<sup>Required</sup> <a name="base" id="@sevenpico/cdk-context.ContextFns.extend.parameter.base"></a>

- *Type:* <a href="#@sevenpico/cdk-context.Context">Context</a>

---

###### `overrides`<sup>Required</sup> <a name="overrides" id="@sevenpico/cdk-context.ContextFns.extend.parameter.overrides"></a>

- *Type:* <a href="#@sevenpico/cdk-context.ContextProps">ContextProps</a>

---

##### `id` <a name="id" id="@sevenpico/cdk-context.ContextFns.id"></a>

```typescript
import { ContextFns } from '@sevenpico/cdk-context'

ContextFns.id(ctx: Context)
```

###### `ctx`<sup>Required</sup> <a name="ctx" id="@sevenpico/cdk-context.ContextFns.id.parameter.ctx"></a>

- *Type:* <a href="#@sevenpico/cdk-context.Context">Context</a>

---

##### `isEnabled` <a name="isEnabled" id="@sevenpico/cdk-context.ContextFns.isEnabled"></a>

```typescript
import { ContextFns } from '@sevenpico/cdk-context'

ContextFns.isEnabled(ctx: Context)
```

###### `ctx`<sup>Required</sup> <a name="ctx" id="@sevenpico/cdk-context.ContextFns.isEnabled.parameter.ctx"></a>

- *Type:* <a href="#@sevenpico/cdk-context.Context">Context</a>

---

##### `make` <a name="make" id="@sevenpico/cdk-context.ContextFns.make"></a>

```typescript
import { ContextFns } from '@sevenpico/cdk-context'

ContextFns.make(props: ContextProps)
```

###### `props`<sup>Required</sup> <a name="props" id="@sevenpico/cdk-context.ContextFns.make.parameter.props"></a>

- *Type:* <a href="#@sevenpico/cdk-context.ContextProps">ContextProps</a>

---

##### `tags` <a name="tags" id="@sevenpico/cdk-context.ContextFns.tags"></a>

```typescript
import { ContextFns } from '@sevenpico/cdk-context'

ContextFns.tags(ctx: Context)
```

###### `ctx`<sup>Required</sup> <a name="ctx" id="@sevenpico/cdk-context.ContextFns.tags.parameter.ctx"></a>

- *Type:* <a href="#@sevenpico/cdk-context.Context">Context</a>

---




