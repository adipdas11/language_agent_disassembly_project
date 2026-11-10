import { describe, expect, it } from 'vitest'
import results from './manuscript-results.json'
import interfaces from './paper-interfaces.json'

const average = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length
const baseline = results.tables.ablation.filter((_, i) => i % 2 === 0)
const agentic = results.tables.ablation.filter((_, i) => i % 2 === 1)
const macro = (rows: string[][], col: number) => average(rows.map(row => parseFloat(row[col])))

describe('V11 manuscript data', () => {
  it('reproduces the headline device averages without including the additional HDD', () => {
    expect(results.source).toBe('RAL-mainV11.tex')
    expect(baseline).toHaveLength(3)
    expect(agentic).toHaveLength(3)
    expect(macro(baseline, 2).toFixed(1)).toBe('58.1')
    expect(macro(agentic, 2).toFixed(1)).toBe('89.7')
    expect((macro(agentic, 2) - macro(baseline, 2)).toFixed(1)).toBe('31.6')
    expect((100 * (1 - macro(agentic, 6) / macro(baseline, 6))).toFixed(1)).toBe('90.0')
    expect((100 * (macro(agentic, 3) / macro(baseline, 3) - 1)).toFixed(1)).toBe('22.2')
    // The manuscript reports 84.0%; the displayed device means are rounded.
    expect(Math.abs(macro(agentic, 5) - 84.0)).toBeLessThan(0.1)
  })

  it('preserves invocation accounting and initial-success rates across all ten skill rows', () => {
    expect(results.tables.perskill).toHaveLength(10)
    for (const row of results.tables.perskill) {
      const [successes, initial] = row[3].split('/').map(Number)
      expect(initial + Number(row[5])).toBe(Number(row[2]))
      expect((100 * successes / initial).toFixed(1)).toBe(Number(row[4]).toFixed(1))
    }
  })

  it('keeps a verified failure distinct from the requested action effect', () => {
    expect(interfaces.worldstate_packet.assembly_state.last_outcome).toBe('failure')
    expect(interfaces.worldstate_packet.assembly_state.removed).toEqual([])
    expect(interfaces.action_response.parameters.retry_limit).toBe(2)
    expect(interfaces.worldstate_packet.force_torque).toHaveProperty('force_n')
    expect(interfaces.worldstate_packet).not.toHaveProperty('device_id')
  })
})
