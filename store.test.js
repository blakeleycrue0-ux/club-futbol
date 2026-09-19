const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, distanceBetween, flightStatus } = require('./store');
test('route calculation is symmetric and produces a viable estimate', () => {
  assert.equal(distanceBetween('PMI', 'LGW'), distanceBetween('LGW', 'PMI'));
  const quote = calculate('PMI', 'LGW', 180);
  assert.ok(quote.distance > 1000);
  assert.ok(quote.expectedProfit > 0);
  assert.ok(quote.expectedPassengers <= 180);
});
test('flight states advance predictably', () => {
  const flight = { departureAt: 10_000 };
  assert.equal(flightStatus(flight, 9_999), 'PROGRAMADO');
  assert.equal(flightStatus(flight, 10_001), 'EMBARQUE');
  assert.equal(flightStatus(flight, 25_000), 'EN VUELO');
  assert.equal(flightStatus(flight, 100_001), 'ROTACIÓN');
  assert.equal(flightStatus(flight, 120_001), 'COMPLETADO');
});
