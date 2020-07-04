# Package reference
The package must export a class that can both meet the criteria provided in the [NPM package](#npm-package) section above, and accommodate the provided constructor and methods below.

## Constructor

```js
import Database from 'database-module';

const db = new Database({
    project_id,
    cache_max_age,
    cache_allocated_memory,
})
```

#### Constructor options

| Property | Type | Description | Default value |
| -------- | ---- | ----------- | ------- |
| `project_id` | String | Google Cloud Platform project ID | |
| `cache_max_age` | Number (seconds) | Cached data age threshold | `3600` |
| `cache_allocated_memory` | Number (MB) | Maximum in-memory cache size, in megabytes | `64` |

- When retrieving data, if the cache-matched data was added more than `cache_max_age` seconds ago, we do _not_ return the cached data


---
# Methods

- [write()](#writedatatype-collection-id--document)
- [readOne()](#readonedatatype-collection-id-) 
- [readMany()](#readmanydatatype-collection--filters) 

---
## write\<DataType>({ collection, id }, document)
Writes a document to the database, and to the in-memory cache.

```ts
await db.write<DataType>({ collection, id }, document);
```

### Parameters

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `collection` | `string` whose value is enforced by `DataType` | &check;  | Firestore collection |
| `id`         | `string` | &check;  | Firestore document ID |
| `document`   | `object` whose shape is enforced by `DataType` | &check;  | Firestore document ID |

### Returns
This method does not return anything.


### Typescript (optional)
- The generic `DataType` should confer _both_ the structure of `document` **and** the value of `collection`
    - e.g. a type `UserType` demands that `document` include a `first_name`, `last_name`, and `email`; while also demanding that the `collection` value is `"Users"`
- Enforce that all property names of `document` are strings, and that all property value types are either strings, numbers, booleans, or arrays of strings
    - Property values may also be nested objects that meet these same criteria


### Errors
This method should throw if:
- Either `collection`, `id`, or `document` are not provided, or are falsy – all are required


### Example usage
```ts
/**
 * Save a document
 */
await db.write<UserType>({ 
    collection: "Users",          // Enforced by UserType
    id: "23"
}, {                              // Enforced by UserType
    first_name: "Michael",
    last_name: "Angelo",
    email: "mangelo@sistine.org",
})
```

---
## readOne\<DataType>({ collection, id })
Retrieves a single document from the database, or, if applicable, from the in-memory cache.

```ts
const document = await db.readOne<DataType>({ collection, id });
```

### Parameters

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `collection` | `string` whose value is enforced by `DataType` | &check;  | Firestore collection |
| `id`         | `string` |  &check; | Firestore document ID ||


### Returns
This method returns a single document, an object, whose type is to be inferred by the `DataType` generic. If the document does not exist, the method throws an error.


### Typescript (optional)
- The generic `DataType` should confer both the structure of the response document _and_ the value of `collection`


### Errors
This method should throw if:
- Either `collection` or `id` are not provided, or are falsy – both are required
- If the document does not exist


### Example usage
```ts
/**
 * Retrieve a document from the Users collection
 */
const user = await db.readOne<UserType>({ 
    collection: "Users", 
    id: "23"
});
```


---
## readMany\<DataType>({ collection }, filters?)
Retrieves a set of documents from the database, or, if applicable, from the in-memory cache.

```ts
const documents = await db.readMany<DataType>({ collection }, filters?);
```

### Parameters

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `collection` | `string` whose value is enforced by `DataType` | &check;  | Firestore collection |
| `filters`    | `object` whose shape is enforced by `DataType` |  | Query filters |


### Returns
This method returns an array of documents, whose type is to be inferred by the `DataType` generic.


### Typescript (optional)
- The generic `DataType` should confer both the structure of the documents in the response array _and_ the value of `collection`
- `DataType` will also restrict `filters` – the properties & property values in `filters` must match the `DataType` document shape
    - The inclusion of document properties in `filters` is optional; alternatively, `filters` does not need to be passed in at all


### Errors
This method should throw if:
- `collection` is not provided, or is falsy


### Example usage
```ts
/**
 * Filter Users by first name
 */
const users = await db.readOne<UserType>({ 
    collection: "Users", 
}, {
    first_name: "Michael"
});
```
