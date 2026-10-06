import { describe, it, expect } from 'vitest';
import { issueTypes, findIssueByQuery } from '../data/issueTypes';

describe('Issue Type Matching & Diagnosis Queries', () => {
  it('contains all 8 standard breakdown issue categories with valid labels', () => {
    expect(issueTypes.length).toBe(8);
    const values = issueTypes.map((i) => i.value);
    expect(values).toContain('BIKE_NOT_STARTING');
    expect(values).toContain('PUNCTURE');
    expect(values).toContain('BATTERY_ELECTRICAL');
    expect(values).toContain('FUEL_SHORTAGE');
    expect(values).toContain('ENGINE_PROBLEM');
    expect(values).toContain('CHAIN_CLUTCH');
    expect(values).toContain('ACCIDENT');
    expect(values).toContain('OTHER');
  });

  it('correctly maps query string synonyms to issue categories', () => {
    expect(findIssueByQuery('puncture')).toBe('PUNCTURE');
    expect(findIssueByQuery('flat tyre')).toBe('PUNCTURE');
    expect(findIssueByQuery('flat-tyre')).toBe('PUNCTURE');

    expect(findIssueByQuery('battery')).toBe('BATTERY_ELECTRICAL');
    expect(findIssueByQuery('electrical')).toBe('BATTERY_ELECTRICAL');

    expect(findIssueByQuery('chain')).toBe('CHAIN_CLUTCH');
    expect(findIssueByQuery('clutch')).toBe('CHAIN_CLUTCH');

    expect(findIssueByQuery('engine')).toBe('ENGINE_PROBLEM');
    expect(findIssueByQuery('overheating')).toBe('ENGINE_PROBLEM');

    expect(findIssueByQuery('fuel')).toBe('FUEL_SHORTAGE');
    expect(findIssueByQuery('petrol')).toBe('FUEL_SHORTAGE');

    expect(findIssueByQuery('accident')).toBe('ACCIDENT');
    expect(findIssueByQuery('crash')).toBe('ACCIDENT');

    expect(findIssueByQuery('bike-wont-start')).toBe('BIKE_NOT_STARTING');
    expect(findIssueByQuery('start')).toBe('BIKE_NOT_STARTING');

    expect(findIssueByQuery('other')).toBe('OTHER');
  });

  it('handles null, empty, or unmapped queries safely without throwing exceptions', () => {
    expect(findIssueByQuery(null)).toBeUndefined();
    expect(findIssueByQuery(undefined)).toBeUndefined();
    expect(findIssueByQuery('')).toBeUndefined();
    expect(findIssueByQuery('some-unknown-random-query')).toBeUndefined();
  });
});
