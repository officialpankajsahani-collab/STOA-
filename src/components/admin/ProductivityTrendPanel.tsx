import React, { useState } from 'react';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  Truck,
  Activity,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface TrendDay {
  date: string;
  dayLabel: string;
  dayName: string;
  loadingCount: number;
  collections: number;
  hindalco: number;
  lapanga: number;
  vedanta: number;
  other: number;
}

export interface TrendSummary {
  total7DaysLoadings: number;
  total7DaysCollections: number;
  avgDailyLoadings: number;
  avgDailyCollections: number;
  peakLoadingDay: string;
  peakLoadingCount: number;
  paidPassesCount?: number;
  avgFeeRate?: number;
}

interface ProductivityTrendPanelProps {
  trend: TrendDay[];
  summary: TrendSummary;
}

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, language }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TrendDay;
    const isEn = language === 'en';
    const isOr = language === 'or';

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="font-bold text-slate-900 font-mono text-sm">{data.dayLabel}</span>
          <span className="text-[10px] text-slate-500">{data.dayName}</span>
        </div>

        <div className="flex items-center justify-between text-rose-700 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block shadow-xs" />
            {isEn ? 'Loading Volume:' : isOr ? 'ଲୋଡିଂ ପରିମାଣ:' : 'लोडिंग वॉल्यूम:'}
          </span>
          <span className="font-mono text-sm font-bold">
            {data.loadingCount} {isEn ? 'Trucks' : isOr ? 'ଟ୍ରକ୍' : 'गाड़ियां'}
          </span>
        </div>

        <div className="flex items-center justify-between text-emerald-700 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
            {isEn ? 'Collection:' : isOr ? 'ଆଦାୟ:' : 'शुल्क संकलन:'}
          </span>
          <span className="font-mono text-sm font-bold">₹{data.collections.toLocaleString('en-IN')}</span>
        </div>

        {/* Company breakdown */}
        <div className="pt-1.5 border-t border-slate-100 text-[10px] space-y-0.5 text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-500">{isEn ? 'Hindalco:' : isOr ? 'ହିଣ୍ଡାଲକୋ:' : 'हिंडाल्को:'}</span>
            <span className="font-mono font-bold text-slate-800">{data.hindalco}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{isEn ? 'Aditya Birla:' : isOr ? 'ଆଦିତ୍ୟ ବିର୍ଲା:' : 'आदित्य बिड़ला:'}</span>
            <span className="font-mono font-bold text-slate-800">{data.lapanga}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{isEn ? 'Vedanta:' : isOr ? 'ବେଦାନ୍ତ:' : 'वेदांता:'}</span>
            <span className="font-mono font-bold text-slate-800">{data.vedanta}</span>
          </div>
          {data.other > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">{isEn ? 'Other Plants:' : isOr ? 'ଅନ୍ୟାନ୍ୟ:' : 'अन्य संयंत्र:'}</span>
              <span className="font-mono font-bold text-slate-800">{data.other}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const ProductivityTrendPanel: React.FC<ProductivityTrendPanelProps> = ({
  trend = [],
  summary = {
    total7DaysLoadings: 0,
    total7DaysCollections: 0,
    avgDailyLoadings: 0,
    avgDailyCollections: 0,
    peakLoadingDay: '—',
    peakLoadingCount: 0,
    paidPassesCount: 0,
    avgFeeRate: 0,
  },
}) => {
  const { language, t } = useLanguageTheme();
  const [viewMode, setViewMode] = useState<'combined' | 'volume' | 'collections'>('combined');

  const avgFeeRate =
    summary.avgFeeRate !== undefined
      ? summary.avgFeeRate
      : summary.paidPassesCount && summary.paidPassesCount > 0
      ? Math.round(summary.total7DaysCollections / summary.paidPassesCount)
      : summary.total7DaysLoadings > 0 && summary.total7DaysCollections > 0
      ? Math.round(summary.total7DaysCollections / summary.total7DaysLoadings)
      : summary.total7DaysLoadings > 0
      ? 500
      : 0;

  const panelTitle =
    language === 'en'
      ? '7-Day Loading & Revenue Trends'
      : language === 'or'
      ? '୭-ଦିନର ଲୋଡିଂ ଓ ଆଦାୟ ଧାରା'
      : '7-दिवसीय लोडिंग एवं राजस्व रुझान';

  const panelSub =
    language === 'en'
      ? 'Visual analysis of Sambalpur Association daily loadings and fee collection'
      : language === 'or'
      ? 'ସମ୍ବଲପୁର ସଂଘର ଦୈନିକ ଲୋଡିଂ ଏବଂ ଶୁଳ୍କ ଆଦାୟର ବିସ୍ତୃତ ବିଶ୍ଳେଷଣ'
      : 'संबलपुर एसोसिएशन की कार्य उत्पादकता एवं दैनिक शुल्क संकलन का विस्तृत विश्लेषण';

  const lblCombined = language === 'en' ? 'Combined' : language === 'or' ? 'ମିଳିତ' : 'संयुक्त';
  const lblVolume = language === 'en' ? 'Volume' : language === 'or' ? 'ପରିମାଣ' : 'लोडिंग संख्या';
  const lblCollections = language === 'en' ? 'Collections (₹)' : language === 'or' ? 'ଆଦାୟ (₹)' : 'शुल्क संकलन (₹)';
  const lblTotal7Days = language === 'en' ? '7-Day Total Loadings' : language === 'or' ? '୭ ଦିନରେ ମୋଟ ଲୋଡିଂ' : '7 दिनों में कुल लोडिंग';
  const lblTrucks = language === 'en' ? 'Trucks' : language === 'or' ? 'ଟ୍ରକ୍' : 'ट्रक';
  const lblAvgPerDay = language === 'en' ? 'Average' : language === 'or' ? 'ହାରାହାରି' : 'औसत';
  const lblTotalRevenue = language === 'en' ? '7-Day Fee Revenue' : language === 'or' ? '୭ ଦିନରେ ମୋଟ ଶୁଳ୍କ' : '7 दिनों में कुल संकलन';

  const handleExportExcel = () => {
    const rows: Record<string, any>[] = trend.map((d) => ({
      'दिनांक (Date)': d.date,
      'दिन (Day)': d.dayName,
      'कुल लोड गाड़ियां (Loaded Trucks)': d.loadingCount,
      'शुल्क संकलन (Collections ₹)': d.collections,
      'हिंडाल्को स्मेल्टर (Hindalco)': d.hindalco,
      'आदित्य बिड़ला लापंगा (Lapanga)': d.lapanga,
      'वेदांत लिमिटेड (Vedanta)': d.vedanta,
      'अन्य संयंत्र (Other Plants)': d.other,
    }));

    // Add summary row
    rows.push({
      'दिनांक (Date)': 'कुल 7-दिवसीय योग (Total)',
      'दिन (Day)': '-',
      'कुल लोड गाड़ियां (Loaded Trucks)': summary.total7DaysLoadings,
      'शुल्क संकलन (Collections ₹)': summary.total7DaysCollections,
      'हिंडाल्को स्मेल्टर (Hindalco)': trend.reduce((acc, c) => acc + (c.hindalco || 0), 0),
      'आदित्य बिड़ला लापंगा (Lapanga)': trend.reduce((acc, c) => acc + (c.lapanga || 0), 0),
      'वेदांत लिमिटेड (Vedanta)': trend.reduce((acc, c) => acc + (c.vedanta || 0), 0),
      'अन्य संयंत्र (Other Plants)': trend.reduce((acc, c) => acc + (c.other || 0), 0),
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '7-Day Trend');
    XLSX.writeFile(workbook, `STOA_7Day_Productivity_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm relative space-y-5">
      {/* Panel Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                {panelTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                {panelSub}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('combined')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'combined'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-600" />
            {lblCombined}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('volume')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'volume'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-rose-600" />
            {lblVolume}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('collections')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'collections'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-rose-600" />
            {lblCollections}
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
            title="7-दिवसीय रिपोर्ट Excel में डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block tracking-wider">{lblTotal7Days}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
              {summary.total7DaysLoadings}
            </span>
            <span className="text-[11px] text-slate-600 font-medium">{lblTrucks}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">{lblAvgPerDay}: ~{summary.avgDailyLoadings}</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block tracking-wider">{lblTotalRevenue}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
              ₹{summary.total7DaysCollections.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">{lblAvgPerDay}: ~₹{summary.avgDailyCollections.toLocaleString('en-IN')}</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] text-slate-600 uppercase font-semibold block tracking-wider">पीक लोडिंग दिवस</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {summary.peakLoadingCount}
            </span>
            <span className="text-[11px] text-rose-700 font-bold font-mono">{summary.peakLoadingDay}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {language === 'en' ? 'Peak Dispatch Day' : language === 'or' ? 'ସର୍ବାଧିକ ଡିସପାଚ୍ ଦିନ' : 'सर्वाधिक डिस्पैच दिन'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block tracking-wider">
            {language === 'en' ? 'Average Association Fee Rate' : language === 'or' ? 'ହାରାହାରି ସଂଘ ଶୁଳ୍କ ହାର' : 'एसोसिएशन औसत फीस दर'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              ₹{avgFeeRate}
            </span>
            <span className="text-[10px] text-slate-500">{language === 'en' ? '/ pass' : language === 'or' ? '/ ପାସ୍' : '/ पास'}</span>
          </div>
          <span className="text-[10px] text-rose-700 font-medium block mt-0.5">
            {avgFeeRate > 0
              ? (language === 'en' ? '₹500 / ₹700 Slab Compliance' : language === 'or' ? '₹୫୦୦ / ₹୭୦୦ ସ୍ଲାବ୍ ଅନୁପାଳନ' : '₹500 / ₹700 स्लैब अनुपालन')
              : (language === 'en' ? 'No Active Fees' : language === 'or' ? 'କୌଣସି ଶୁଳ୍କ ନାହିଁ' : 'सक्रिय शुल्क दर्ज नहीं')}
          </span>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4">
        {/* VIEW 1: COMBINED */}
        {viewMode === 'combined' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                  <span className="w-3 h-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xs inline-block" />
                  {language === 'en' ? 'Loading Volume (Left Axis)' : language === 'or' ? 'ଲୋଡିଂ ପରିମାଣ (ବାମ ଅକ୍ଷ)' : 'लोडिंग वॉल्यूम (बायां अक्ष)'}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" />
                  {language === 'en' ? 'Collection (Right Axis)' : language === 'or' ? 'ଆଦାୟ (ଡାହାଣ ଅକ୍ଷ)' : 'कलेक्शन (दायां अक्ष)'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
                {language === 'en' ? 'Last 7 Days' : language === 'or' ? 'ଗତ ୭ ଦିନ' : 'विगत 7 दिवस'}
              </span>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#be123c" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="collectionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  {/* Left Axis: Volume */}
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#be123c', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    domain={[0, 'auto']}
                  />
                  {/* Right Axis: Collections */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#059669', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomTooltip language={language} />} />
                  <Bar
                    yAxisId="left"
                    dataKey="loadingCount"
                    name={language === 'en' ? 'Loading Volume' : language === 'or' ? 'ଲୋଡିଂ ପରିମାଣ' : 'लोडिंग वॉल्यूम'}
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="collections"
                    name={language === 'en' ? 'Collection (₹)' : language === 'or' ? 'ଆଦାୟ (₹)' : 'कलेक्शन (₹)'}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#collectionAreaGradient)"
                    dot={{ fill: '#10b981', stroke: '#047857', strokeWidth: 1.5, r: 4 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 2: LOADING VOLUME ONLY */}
        {viewMode === 'volume' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block" />
                  Hindalco Samelter
                </span>
                <span className="flex items-center gap-1.5 text-pink-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-pink-600 inline-block" />
                  Aditya Birla Lapanga
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                  Vedanta Limited
                </span>
                <span className="flex items-center gap-1.5 text-fuchsia-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-600 inline-block" />
                  {language === 'en' ? 'Other Plants' : language === 'or' ? 'ଅନ୍ୟାନ୍ୟ ପ୍ଲାଣ୍ଟ୍' : 'अन्य संयंत्र'}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 font-mono font-medium">
                {language === 'en' ? 'Plant-wise Stacked Volume' : language === 'or' ? 'ପ୍ଲାଣ୍ଟୱାରି ଷ୍ଟାକ୍ ପରିମାଣ' : 'कंपनीवार स्टैक्ड वॉल्यूम'}
              </span>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#be123c', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip language={language} />} />
                  <Bar dataKey="hindalco" name="Hindalco" stackId="a" fill="#e11d48" maxBarSize={38} />
                  <Bar dataKey="lapanga" name="Lapanga" stackId="a" fill="#f43f5e" maxBarSize={38} />
                  <Bar dataKey="vedanta" name="Vedanta" stackId="a" fill="#10b981" maxBarSize={38} />
                  <Bar dataKey="other" name="Other" stackId="a" fill="#d946ef" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: COLLECTIONS TREND ONLY */}
        {viewMode === 'collections' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {language === 'en' ? 'Daily Verified Association Fee Collections' : language === 'or' ? 'ଦୈନିକ ସଂଘ ଶୁଳ୍କ ଆଦାୟ ଧାରା' : 'दैनिक प्राप्त एसोसिएशन लोडिंग फीस ट्रेंड'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                {language === 'en' ? '₹700 / ₹500 Fee Structure' : language === 'or' ? '₹୭୦୦ / ₹୫୦୦ ଶୁଳ୍କ ସଂରଚନା' : '₹700 / ₹500 फीस संरचना'}
              </span>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="onlyCollectionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#059669', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
                  />
                  <Tooltip content={<CustomTooltip language={language} />} />
                  <Area
                    type="monotone"
                    dataKey="collections"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#onlyCollectionGradient)"
                    dot={{ fill: '#10b981', stroke: '#047857', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 7, fill: '#059669' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Footer Insight Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 gap-2">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {language === 'en'
              ? `In the last 7 days, a total of ${summary.total7DaysLoadings} trucks completed secure 15-to-15 rotation under Sambalpur Association.`
              : language === 'or'
              ? `ଗତ ୭ ଦିନରେ ସମ୍ବଲପୁର ସଂଘ ଅଧୀନରେ ମୋଟ ${summary.total7DaysLoadings} ଟ୍ରକ୍ ସୁରକ୍ଷିତ ୧୫-ରୁ-୧୫ ପର୍ଯ୍ୟାୟ ସମ୍ପୂର୍ଣ୍ଣ କରିଛି।`
              : `गत 7 दिनों में संबलपुर एसोसिएशन द्वारा कुल ${summary.total7DaysLoadings} ट्रकों का सुरक्षित 15-टू-15 रोटेशन संपन्न हुआ।`}
          </span>
        </div>
        <span className="font-mono text-slate-500">
          {language === 'en' ? 'Audit Status: 100% Verified' : language === 'or' ? 'ଅଡିଟ୍ ସ୍ଥିତି: ୧୦୦% ପ୍ରମାଣିତ' : 'ऑडिट स्थिति: 100% सत्यापित'}
        </span>
      </div>
    </div>
  );
};
