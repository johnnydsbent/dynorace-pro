import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TelemetrySample, Car } from "@shared/schema";

interface PerformanceChartProps {
  leftTelemetry: TelemetrySample[];
  rightTelemetry: TelemetrySample[];
  leftCar: Car;
  rightCar: Car;
}

export function PerformanceChart({ leftTelemetry, rightTelemetry, leftCar, rightCar }: PerformanceChartProps) {
  const maxDataPoints = Math.max(leftTelemetry.length, rightTelemetry.length);
  
  const chartData = Array.from({ length: maxDataPoints }, (_, i) => {
    const leftSample = leftTelemetry[i];
    const rightSample = rightTelemetry[i];
    
    return {
      time: (i * 50) / 1000,
      leftSpeed: leftSample?.mph ?? null,
      rightSpeed: rightSample?.mph ?? null,
      leftDistance: leftSample?.distanceFt ?? null,
      rightDistance: rightSample?.distanceFt ?? null,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-racing uppercase tracking-wider text-lg">
          Speed vs Time Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}s`}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value} mph`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                }}
                labelFormatter={(value) => `Time: ${Number(value).toFixed(2)}s`}
                formatter={(value: number, name: string) => [
                  `${value?.toFixed(1) ?? "—"} mph`,
                  name === "leftSpeed" ? leftCar.name : rightCar.name,
                ]}
              />
              <Legend 
                formatter={(value) => value === "leftSpeed" ? leftCar.name : rightCar.name}
              />
              <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: "60 mph", position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: "100 mph", position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="leftSpeed"
                stroke={leftCar.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="rightSpeed"
                stroke={rightCar.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
