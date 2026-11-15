import React, { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { clock, hm } from '../data/format';
import type { SleepSession } from '../data/types';
import { C, F, STAGE, T } from '../theme';

const ROWS = ['Awake', 'REM', 'Light', 'Deep'];

export function Hypnogram({ session, compact, height: h }: { session: SleepSession; compact?: boolean; height?: number }) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const height = h ?? (compact ? 52 : 156);
  const labelW = compact ? 0 : 48;
  const start = Date.parse(session.start_time);
  const end = Date.parse(session.end_time);
  const span = Math.max(1, end - start);
  const plotW = Math.max(0, w - labelW);
  const rowH = height / 4;
  const bar = compact ? rowH * 0.66 : rowH * 0.46;
  const intervals = session.sleep_stage_intervals ?? [];
  const x = (iso: string) => labelW + ((Date.parse(iso) - start) / span) * plotW;
  const yMid = (row: number) => row * rowH + rowH / 2;

  return (
    <View onLayout={onLayout} accessibilityLabel={`Sleep stages from ${clock(session.start_time)} to ${clock(session.end_time)}`}>
      {w > 0 && (
        <Svg width={w} height={height}>
          {!compact &&
            ROWS.map((_, i) => (
              <Line key={i} x1={labelW} x2={w} y1={yMid(i)} y2={yMid(i)} stroke={C.line} strokeWidth={1} strokeDasharray="2 5" />
            ))}
          {intervals.map((iv, i) => {
            const st = STAGE[iv.stage] ?? STAGE.unknown;
            const next = intervals[i + 1];
            const x1 = x(iv.start_time);
            const x2 = x(iv.end_time);
            return (
              <React.Fragment key={i}>
                {next && (
                  <Line
                    x1={x2}
                    x2={x2}
                    y1={yMid(st.row)}
                    y2={yMid((STAGE[next.stage] ?? STAGE.unknown).row)}
                    stroke={C.faint}
                    strokeWidth={1}
                    opacity={0.5}
                  />
                )}
                <Rect x={x1} y={yMid(st.row) - bar / 2} width={Math.max(1.5, x2 - x1)} height={bar} rx={Math.min(3, bar / 2)} fill={st.color} />
              </React.Fragment>
            );
          })}
        </Svg>
      )}
      {!compact && w > 0 && (
        <>
          {ROWS.map((r, i) => (
            <Text key={r} style={[T.caption, { position: 'absolute', left: 0, top: yMid(i) - 9 }]}>
              {r}
            </Text>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: labelW, marginTop: 8 }}>
            <Text style={T.caption}>{clock(session.start_time)}</Text>
            <Text style={T.caption}>{clock(new Date((start + end) / 2).toISOString())}</Text>
            <Text style={T.caption}>{clock(session.end_time)}</Text>
          </View>
        </>
      )}
    </View>
  );
}

/** Score ring. On the night band it uses mint on lagoon; on paper it uses lagoon on parchment. */
export function ScoreRing({ score, size = 72, dark, label }: { score: number; size?: number; dark?: boolean; label?: string }) {
  const stroke = Math.max(4, size * 0.075);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`Score ${score} out of 100`}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={dark ? C.onDarkLine : C.inset} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={dark ? C.mint : C.lagoon}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circ * score) / 100} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ fontFamily: F.serif, color: dark ? C.onDark : C.ink, fontSize: size * 0.36, letterSpacing: -1 }}>{score}</Text>
      {label ? <Text style={{ fontFamily: F.sansMedium, color: dark ? C.onDarkMuted : C.muted, fontSize: Math.max(10, size * 0.12), marginTop: -2 }}>{label}</Text> : null}
    </View>
  );
}

export function StageLegend() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {(['deep', 'light', 'rem', 'awake'] as const).map((k) => (
        <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: STAGE[k].color }} />
          <Text style={T.caption}>{STAGE[k].label}</Text>
        </View>
      ))}
    </View>
  );
}

export function StageBars({ session }: { session: SleepSession }) {
  const st = session.stages;
  const rows: [string, number | null, string][] = [
    ['Deep', st?.deep_minutes ?? null, STAGE.deep.color],
    ['Light', st?.light_minutes ?? null, STAGE.light.color],
    ['REM', st?.rem_minutes ?? null, STAGE.rem.color],
    ['Awake', st?.awake_minutes ?? null, STAGE.awake.color],
  ];
  const total = rows.reduce((a, [, v]) => a + (v ?? 0), 0) || 1;
  return (
    <View style={{ gap: 12 }}>
      {rows.map(([label, v, color]) => (
        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={[T.small, { width: 48, color: C.ink }]}>{label}</Text>
          <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: C.inset, overflow: 'hidden' }}>
            <View style={{ width: `${((v ?? 0) / total) * 100}%`, height: 8, backgroundColor: color, borderRadius: 4 }} />
          </View>
          <Text style={[T.smallStrong, { width: 64, textAlign: 'right', fontVariant: ['tabular-nums'] }]}>{v == null ? 'n/a' : hm(v)}</Text>
          <Text style={[T.caption, { width: 34, textAlign: 'right', fontVariant: ['tabular-nums'] }]}>{v == null ? '' : `${Math.round((v / total) * 100)}%`}</Text>
        </View>
      ))}
    </View>
  );
}

/** Seven nights against a 7-hour goal line. Nights that reach the goal are lagoon, the rest periwinkle. */
export function WeekBars({ data, goal = 420, dark }: { data: { label: string; minutes: number }[]; goal?: number; dark?: boolean }) {
  const max = Math.max(goal * 1.3, ...data.map((d) => d.minutes));
  const H = dark ? 64 : 112;
  const reached = dark ? C.mint : C.lagoon;
  const below = dark ? 'rgba(255,255,255,0.32)' : '#93ABEC';
  return (
    <View accessibilityLabel={`Last ${data.length} nights against a ${goal / 60} hour goal`}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: H, gap: dark ? 6 : 10 }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: (goal / max) * H,
            borderTopWidth: 1,
            borderColor: dark ? 'rgba(255,255,255,0.4)' : C.wine,
            borderStyle: 'dashed',
          }}
        />
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: H }}>
            <View
              style={{
                width: '72%',
                maxWidth: 28,
                height: Math.max(3, (d.minutes / max) * H),
                borderRadius: 5,
                backgroundColor: d.minutes === 0 ? (dark ? C.onDarkLine : C.inset) : d.minutes >= goal ? reached : below,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: dark ? 6 : 10, marginTop: 6 }}>
        {data.map((d, i) => (
          <Text key={i} style={[T.caption, { flex: 1, textAlign: 'center' }, dark && { color: C.onDarkMuted }]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
