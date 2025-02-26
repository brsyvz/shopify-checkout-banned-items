# Testing Gift With Purchase

```
fetch('/cart/add.js', {
  body: JSON.stringify({ id: 47085129859362, properties: { _source: 'Gift with Purchase' } }),
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'xmlhttprequest'
  },
  method: 'POST'
}).then(function (response) {
  return response.json();
}).then(function (json) {
  /* we have JSON */
  console.log(json)
}).catch(function (err) {
  /* uh oh, we have error. */
  console.error(err)
});
```

# Product Bundle
```
fetch('/cart/add.js', {
  body: JSON.stringify({ id: 47085129859362, properties: { _discount_code: 'CONDIMENTS' } }),
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'xmlhttprequest'
  },
  method: 'POST'
}).then(function (response) {
  return response.json();
}).then(function (json) {
  /* we have JSON */
  console.log(json)
}).catch(function (err) {
  /* uh oh, we have error. */
  console.error(err)
});
```

# Product Bundle Favorites
```
fetch('/cart/add.js', {
  body: JSON.stringify({ id: 47085129859362, properties: { _bundle_title: 'Whole30 Kit - Starter Collection' } }),
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'xmlhttprequest'
  },
  method: 'POST'
}).then(function (response) {
  return response.json();
}).then(function (json) {
  /* we have JSON */
  console.log(json)
}).catch(function (err) {
  /* uh oh, we have error. */
  console.error(err)
});

// subscription
fetch('/cart/add.js', {
  body: JSON.stringify({ id: 47085129859362, properties: { shipping_interval_unit_type: 1, _bundle_title: 'Whole30 Kit - Starter Collection' } }),
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'xmlhttprequest'
  },
  method: 'POST'
}).then(function (response) {
  return response.json();
}).then(function (json) {
  /* we have JSON */
  console.log(json)
}).catch(function (err) {
  /* uh oh, we have error. */
  console.error(err)
});
```

# Tiered Product Discount
```
fetch('/cart/add.js', {
  body: JSON.stringify({ id: 47085129859362, quantity: 10, properties: { _bundle: 'Build A Box' } }),
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'xmlhttprequest'
  },
  method: 'POST'
}).then(function (response) {
  return response.json();
}).then(function (json) {
  /* we have JSON */
  console.log(json)
}).catch(function (err) {
  /* uh oh, we have error. */
  console.error(err)
});
```

# Tiered Discount Subscription
```
fetch('/cart/add.js', {
  body: JSON.stringify({ id: 47085129859362, quantity: 10, properties: { _bundle: 'Build A Box Subscription' } }),
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'xmlhttprequest'
  },
  method: 'POST'
}).then(function (response) {
  return response.json();
}).then(function (json) {
  /* we have JSON */
  console.log(json)
}).catch(function (err) {
  /* uh oh, we have error. */
  console.error(err)
});
```