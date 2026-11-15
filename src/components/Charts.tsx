import React, { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { clock, hm } from '../data/format';
import type { SleepSession } from '../data/types';
import { C, STAGE, scoreColor } from '../theme';

const ROWS = ['Awake', 'REM', 'Light', 'Deep'];

export function Hypnogram({ session, compact }: { session: SleepSession; compact?: boolean }) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const height = compact ? 46 : 150;
  const labelW = compact ? 0 : 44;
  const start = Date.parse(session.start_time);
  const end = Date.parse(session.end_time);
  const span = Math.max(1, end - start);
  const plotW = Math.max(0, w - labelW);
  const rowH = height / 4;
  const bar = compact ? rowH * 0.62 : rowH * 0.5;
  const intervals = session.sleep_stage_intervals ?? [];
  const x = (iso: string) => labelW + ((Date.parse(iso) - start) / span) * plotW;
  const yMid = (row: number) => row * rowH + rowH / 2;

  return (
    <View onLayout={onLayout} accessibilityLabel={`Sleep stages from ${clock(session.start_time)} to ${clock(session.end_time)}`}>
      {w > 0 && (
        <Svg width={w} height={height}>
          {!compact &&
            ROWS.map((_, i) => (
              <Line key={i} x1={labelW} x2={w} y1={yMid(i)} y2={yMid(i)} stroke={C.border} strokeWidth={1} strokeDasharray="2 4" />
            ))}
          {intervals.map((iv, i) => {
            const st = STAGE[iv.stage] ?? STAGE.unknown;
            const next = intervals[i + 1];
            const x1 = x(iv.start_time);
            const x2 = x(iv.end_time);
            return (
              <React.Fragment key={i}>
                <Rect
                  x={x1}
                  y={yMid(st.row) - bar / 2}
                  width={Math.max(1.2, x2 - x1)}
                  height={bar}
                  rx={Math.min(3, bar / 2)}
                  fill={st.color}
                />
                {next && (
                  <Line
                    x1={x2}
                    x2={x2}
                    y1={yMid(st.row)}
                    y2={yMid((STAGE[next.stage] ?? STAGE.unknown).row)}
                    stroke={C.faint}
                    strokeWidth={1}
                    opacity={0.6}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      )}
      {!compact && w > 0 && (
        <>
          {ROWS.map((r, i) => (
            <Text key={r} style={{ position: 'absolute', left: 0, top: yMid(i) - 8, color: C.muted, fontSize: 11 }}>
              {r}
            </Text>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: labelW, marginTop: 6 }}>
            <Text style={{ color: C.muted, fontSize: 11 }}>{clock(session.start_time)}</Text>
            <Text style={{ color: C.muted, fontSize: 11 }}>{clock(new Date((start + end) / 2).toISOString())}</Text>
            <Text style={{ color: C.muted, fontSize: 11 }}>{clock(session.end_time)}</Text>
          </View>
        </>
      )}
    </View>
  );
}

export function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const stroke = Math.max(4, size * 0.09);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.surface2} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circ * score) / 100} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ color: C.text, fontWeight: '800', fontSize: size * 0.32, letterSpacing: -0.5 }}>{score}</Text>
      {label ? <Text style={{ color: C.muted, fontSize: size * 0.13, marginTop: -2 }}>{label}</Text> : null}
    </View>
  );
}

export function StageBars({ session }: { session: SleepSession }) {
  const st = session.stages;
  const rows: [string, number | null, string][] = [
    ['Awake', st?.awake_minutes ?? null, STAGE.awake.color],
    ['REM', st?.rem_minutes ?? null, STAGE.rem.color],
    ['Light', st?.light_minutes ?? null, STAGE.light.color],
    ['Deep', st?.deep_minutes ?? null, STAGE.deep.color],
  ];
  const total = rows.reduce((a, [, v]) => a + (v ?? 0), 0) || 1;
  return (
    <View style={{ gap: 10 }}>
      {rows.map(([label, v, color]) => (
        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: C.muted, width: 46, fontSize: 13 }}>{label}</Text>
          <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: C.surface2, overflow: 'hidden' }}>
            <View style={{ width: `${((v ?? 0) / total) * 100}%`, height: 10, backgroundColor: color, borderRadius: 5 }} />
          </View>
          <Text style={{ color: C.text, width: 64, textAlign: 'right', fontSize: 13, fontWeight: '600' }}>
            {v == null ? 'n/a' : hm(v)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function WeekBars({ data, goal = 420 }: { data: { label: string; minutes: number }[]; goal?: number }) {
  const max = Math.max(goal * 1.25, ...data.map((d) => d.minutes));
  const H = 110;
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: H, gap: 8 }}>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: (goal / max) * H, borderTopWidth: 1, borderColor: C.moon, borderStyle: 'dashed', opacity: 0.6 }} />
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: H }}>
            <View
              style={{
                width: '70%',
                height: Math.max(3, (d.minutes / max) * H),
                borderRadius: 6,
                backgroundColor: d.minutes === 0 ? C.surface2 : d.minutes >= goal ? C.moon : '#7C8CFF',
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {data.map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: C.muted, fontSize: 12 }}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
