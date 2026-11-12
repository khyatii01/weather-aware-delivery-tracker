const ALLOWED_STATUSES = new Set(['Pending', 'Delayed']);

function requireObject(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value.trim();
}

export function normalizeOrder(input) {
  const raw = requireObject(input, 'Order');
  const status = requireText(raw.status, 'status');
  if (!ALLOWED_STATUSES.has(status)) throw new TypeError(`Unsupported order status: ${status}`);

  return Object.freeze({
    order_id: requireText(raw.order_id, 'order_id'),
    customer: requireText(raw.customer, 'customer'),
    city: requireText(raw.city, 'city'),
    status,
  });
}

export function normalizeOrders(input) {
  if (!Array.isArray(input)) throw new TypeError('Orders database must be an array');
  const orders = input.map(normalizeOrder);
  const identifiers = new Set();
  for (const order of orders) {
    if (identifiers.has(order.order_id)) throw new TypeError(`Duplicate order_id: ${order.order_id}`);
    identifiers.add(order.order_id);
  }
  return orders;
}
