'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface CompetitorScoreBarChartProps {
  data: Array<{ competitor_name: string; total_weighted_score: number }>
}

export function CompetitorScoreBarChart({ data }: CompetitorScoreBarChartProps) {
  const chartData = data.map((item) => ({
    name: item.competitor_name,
    score: Math.round(item.total_weighted_score * 10) / 10, // Round to 1 decimal
  }))

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number | undefined) => [
              value !== undefined ? `${value}/100` : 'N/A',
              'Score',
            ]}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {/* Table fallback for accessibility */}
      <div className="mt-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 font-semibold">Competitor</th>
              <th className="text-right py-2 font-semibold">Score</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={index} className="border-b border-border-subtle">
                <td className="py-2">{item.name}</td>
                <td className="text-right py-2">{item.score}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

