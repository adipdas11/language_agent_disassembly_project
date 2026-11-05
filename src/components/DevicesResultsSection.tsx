import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartData } from '../content/research-data'
import { SectionHeader, SourceBadge } from './Primitives'

function useReducedMotion() {
  return useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
}

function CompletionChart() {
  const reduced = useReducedMotion()
  return (
    <div className="chart-card">
      <div className="chart-heading"><div><span>Target-step completion</span><h3>Agentic vs scripted</h3></div><SourceBadge source="paper" /></div>
      <div className="chart-wrap" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData.completion} margin={{ top: 12, right: 10, bottom: 8, left: -18 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9d8d2" /><XAxis dataKey="method" tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [`${value}%`, 'Completion']} cursor={{ fill: '#f4f1e8' }} /><Bar dataKey="value" radius={[10, 10, 2, 2]} isAnimationActive={!reduced}>{chartData.completion.map((entry) => <Cell fill={entry.fill} key={entry.method} />)}</Bar></BarChart></ResponsiveContainer>
      </div>
      <table className="sr-only"><caption>Data for target-step completion chart</caption><thead><tr><th>Method</th><th>Mean completion</th></tr></thead><tbody>{chartData.completion.map((row) => <tr key={row.method}><th>{row.method}</th><td>{row.value.toFixed(1)}%</td></tr>)}</tbody></table>
      <p className="chart-note">Completion is the proportion of required target steps achieved across the task.</p>
    </div>
  )
}

function ResilienceChart() {
  const reduced = useReducedMotion()
  return (
    <div className="chart-card">
      <div className="chart-heading"><div><span>Failure handling</span><h3>Resilience indicators</h3></div><SourceBadge source="paper" /></div>
      <div className="chart-wrap" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={chartData.resilience} margin={{ top: 12, right: 18, bottom: 8, left: 28 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d9d8d2" /><XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="metric" width={118} tickLine={false} axisLine={false} fontSize={11} /><Tooltip formatter={(value) => [`${value}%`, 'Rate']} cursor={{ fill: '#f4f1e8' }} /><Bar dataKey="value" radius={[2, 10, 10, 2]} isAnimationActive={!reduced}>{chartData.resilience.map((entry) => <Cell fill={entry.fill} key={entry.metric} />)}</Bar></BarChart></ResponsiveContainer>
      </div>
      <table className="sr-only"><caption>Data for resilience indicators chart</caption><thead><tr><th>Metric</th><th>Reported value</th></tr></thead><tbody>{chartData.resilience.map((row) => <tr key={row.metric}><th>{row.metric}</th><td>{row.value.toFixed(1)}%</td></tr>)}</tbody></table>
    </div>
  )
}

export function ResultsSection() {
  return (
    <section className="section section-tint-lavender" id="results" aria-labelledby="results-title">
      <div className="section-shell">
        <SectionHeader id="results-title" eyebrow="Results" title="Higher completion. Fewer failure cascades." intro="These charts compare completed physical task targets for the agentic system and the fixed scripted baseline. They also summarise recovery from failed actions and the reduction in later failures caused by earlier errors." />
        <div className="chart-grid"><CompletionChart /><ResilienceChart /></div>
      </div>
    </section>
  )
}
