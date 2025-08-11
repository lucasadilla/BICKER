import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortDeliberates } from '../lib/sortDeliberates.js';

const sampleData = [
  { _id: 'a', createdAt: '2023-01-01T00:00:00Z', votesRed: 5, votesBlue: 5 },
  { _id: 'b', createdAt: '2023-01-02T00:00:00Z', votesRed: 9, votesBlue: 1 },
  { _id: 'c', createdAt: '2023-01-03T00:00:00Z', votesRed: 4, votesBlue: 6 },
  { _id: 'd', createdAt: '2023-01-04T00:00:00Z', votesRed: 30, votesBlue: 10 },
];

test('sorts by newest', () => {
  const debates = [...sampleData];
  const result = sortDeliberates(debates, 'newest').map(d => d._id);
  assert.deepEqual(result, ['d', 'c', 'b', 'a']);
});

test('sorts by mostDivisive', () => {
  const debates = [...sampleData];
  const result = sortDeliberates(debates, 'mostDivisive').map(d => d._id);
  assert.deepEqual(result, ['a', 'c', 'd', 'b']);
});

test('sorts by mostDecisive', () => {
  const debates = [...sampleData];
  const result = sortDeliberates(debates, 'mostDecisive').map(d => d._id);
  assert.deepEqual(result, ['b', 'd', 'c', 'a']);
});

test('sorts by mostPopular', () => {
  const debates = [...sampleData];
  const result = sortDeliberates(debates, 'mostPopular').map(d => d._id);
  assert.deepEqual(result, ['d', 'a', 'b', 'c']);
});
