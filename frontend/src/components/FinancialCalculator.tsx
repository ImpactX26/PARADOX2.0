import React, { useState } from 'react';
import { Calculator, Euro, PiggyBank, Briefcase, Info, ArrowUpRight } from 'lucide-react';

interface CityLivingCost {
  name: string;
  country: 'Germany' | 'Austria';
  rentAverage: number;
  foodAndMisc: number;
  totalMonthly: number;
}

export const FinancialCalculator: React.FC = () => {
  const [cityIndex, setCityIndex] = useState<number>(0);
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState<number>(15); // max 20 allowed
  const [hourlyWage, setHourlyWage] = useState<number>(13.50); // Min wage €12.41, average student job €13.50 - €15

  const cities: CityLivingCost[] = [
    { name: 'Munich (München)', country: 'Germany', rentAverage: 650, foodAndMisc: 350, totalMonthly: 1125 },
    { name: 'Berlin', country: 'Germany', rentAverage: 520, foodAndMisc: 320, totalMonthly: 965 },
    { name: 'Aachen', country: 'Germany', rentAverage: 420, foodAndMisc: 300, totalMonthly: 845 },
    { name: 'Vienna (Wien)', country: 'Austria', rentAverage: 500, foodAndMisc: 340, totalMonthly: 965 },
    { name: 'Heidelberg', country: 'Germany', rentAverage: 480, foodAndMisc: 310, totalMonthly: 915 },
  ];

  const activeCity = cities[cityIndex];

  // Statutory Germany requirements
  const annualBlockedAccount = 11904; // Statutory €992/month
  const monthlyBlockedDisbursement = 992;
  const statutoryHealthInsuranceMonthly = 125; // TK/Barmer student rate

  // Work Income Calculation (4.33 weeks in a month)
  const monthlyWorkEarnings = Math.round(workHoursPerWeek * hourlyWage * 4.33);

  // Total Estimated Monthly Expenses
  const estimatedMonthlyExpense = activeCity.rentAverage + activeCity.foodAndMisc + statutoryHealthInsuranceMonthly;

  // Monthly Net Balance (Blocked Account Payout + Part-time earnings - Expenses)
  const monthlyNetBalance = (monthlyBlockedDisbursement + monthlyWorkEarnings) - estimatedMonthlyExpense;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Immigration Law Compliance
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">German & Austrian Financial Calculator</h1>
          <p className="text-xs text-slate-500">
            Real-time projection for the statutory €11,904 Sperrkonto (Blocked Account), statutory healthcare, and permitted part-time wages.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-right">
          <div className="text-[11px] text-emerald-800 font-medium">Statutory Blocked Account Deposit</div>
          <div className="text-2xl font-black text-emerald-700">€{annualBlockedAccount.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600">€992 / month statutory payout</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Budget Parameters
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Study City</label>
            <select
              value={cityIndex}
              onChange={(e) => setCityIndex(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
            >
              {cities.map((c, i) => (
                <option key={c.name} value={i}>
                  {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Part-time Work (Hrs/Week)</span>
              <span className="text-sky-700">{workHoursPerWeek} hrs</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={workHoursPerWeek}
              onChange={(e) => setWorkHoursPerWeek(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Legal limit: 20 hrs/week (140 full days / 280 half days per year)
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Hourly Wage Rate (€)</span>
              <span className="text-emerald-700">€{hourlyWage.toFixed(2)}/hr</span>
            </div>
            <input
              type="range"
              min={12.41}
              max={22.00}
              step={0.50}
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              German statutory minimum wage is €12.41/hour
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Statutory Components:</div>
            <div>• Sperrkonto payout: €992/mo</div>
            <div>• Student health insurance: €125/mo</div>
            <div>• Free semester transit ticket included in public uni enrolment fee (~€250-€350/sem).</div>
          </div>
        </div>

        {/* Live Calculation Cards */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs md:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-900">Monthly Cashflow Forecast ({activeCity.name})</h3>

          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block">Total Monthly Inflow</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                €{(monthlyBlockedDisbursement + monthlyWorkEarnings).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">
                (€992 blocked + €{monthlyWorkEarnings} job)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block">Living & Health Expenses</span>
              <div className="text-xl font-black text-rose-700 mt-1">
                €{estimatedMonthlyExpense.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">
                (Rent + Living + Insurance)
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${monthlyNetBalance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <span className="text-[11px] font-semibold block text-slate-600">Net Monthly Buffer</span>
              <div className={`text-xl font-black mt-1 ${monthlyNetBalance >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {monthlyNetBalance >= 0 ? `+€${monthlyNetBalance}` : `-€${Math.abs(monthlyNetBalance)}`}
              </div>
              <span className="text-[10px] text-slate-500">
                {monthlyNetBalance >= 0 ? 'Surplus for travel / savings' : 'Requires minor extra funding'}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2 font-bold text-slate-700 border-b border-slate-100">
              Itemized Cost Breakdown ({activeCity.name})
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-slate-600">Average Student Accommodation (WG / Dormitory)</span>
                <span className="font-bold text-slate-800">€{activeCity.rentAverage} / month</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-slate-600">Statutory Student Public Health Insurance (TK / Barmer)</span>
                <span className="font-bold text-slate-800">€{statutoryHealthInsuranceMonthly} / month</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-slate-600">Groceries, Mobile & Personal Living Expenses</span>
                <span className="font-bold text-slate-800">€{activeCity.foodAndMisc} / month</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between bg-sky-50/50">
                <span className="font-semibold text-sky-900">Projected Part-time Employment Income ({workHoursPerWeek} hrs/wk)</span>
                <span className="font-bold text-sky-700">+€{monthlyWorkEarnings} / month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
