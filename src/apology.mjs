function firstName(customer) {
  const normalized = String(customer ?? '').trim();
  return normalized ? normalized.split(/\s+/)[0] : 'there';
}

function cleanReason(description, fallback) {
  const candidate = String(description || fallback || 'severe weather')
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return candidate || 'severe weather';
}

export function createWeatherAwareApology({ customer, city, weather }) {
  if (!weather || typeof weather !== 'object') throw new TypeError('weather is required');
  const destination = String(city ?? '').trim();
  if (!destination) throw new TypeError('city is required');
  const reason = cleanReason(weather.description, weather.main);
  return `Hi ${firstName(customer)}, your order to ${destination} is delayed due to ${reason}. We appreciate your patience!`;
}
