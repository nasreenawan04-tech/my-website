
import { forwardRef } from 'react';

interface LoanPrintReportProps {
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  termUnit: string;
  paymentFrequency: string;
  extraPayment: string;
  result: {
    monthlyPayment: number;
    totalAmount: number;
    totalInterest: number;
    amortizationSchedule: Array<{
      month: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
    }>;
    extraPaymentSavings?: {
      timeSaved: number;
      interestSaved: number;
      newTotalInterest: number;
      newPayoffTime: number;
    };
  };
}

const LoanPrintReport = forwardRef<HTMLDivElement, LoanPrintReportProps>(
  ({ loanAmount, interestRate, loanTerm, termUnit, paymentFrequency, extraPayment, result }, ref) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };

    const getCurrentDateTime = () => {
      const now = new Date();
      return now.toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
    };

    const termDisplay = termUnit === 'years' ? `${loanTerm} Years` : `${loanTerm} Months`;
    const freqDisplay = paymentFrequency === 'weekly' ? 'Weekly' : 
                       paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly';

    return (
      <div ref={ref} className="hidden print:block bg-white text-black p-8" style={{ pageBreakAfter: 'always' }}>
        {/* Header Section */}
        <div className="border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/dapsiwow-print-logo.svg" 
                alt="DapsiWow Logo" 
                className="w-16 h-16"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DapsiWow</h1>
                <p className="text-sm text-gray-600">Financial Tools & Calculators</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">Loan Calculation Report</h2>
              <p className="text-sm text-gray-600 mt-1">{getCurrentDateTime()}</p>
            </div>
          </div>
        </div>

        {/* User Input Summary */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-600 rotate-45 mr-3"></div>
            <h3 className="text-lg font-bold text-gray-900">User Input Summary</h3>
          </div>
          <p className="text-sm italic text-gray-600 mb-3">Summary of provided loan parameters:</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-700">Loan Amount:</span>
              <span className="text-gray-900">{formatCurrency(parseFloat(loanAmount))}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-700">Interest Rate:</span>
              <span className="text-gray-900">{interestRate}% per year</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-700">Loan Term:</span>
              <span className="text-gray-900">{termDisplay}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-semibold text-gray-700">Payment Type:</span>
              <span className="text-gray-900">{freqDisplay} Payment</span>
            </div>
            {parseFloat(extraPayment) > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Extra Payment:</span>
                <span className="text-gray-900">{formatCurrency(parseFloat(extraPayment))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Calculation Results */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-600 rotate-45 mr-3"></div>
            <h3 className="text-lg font-bold text-gray-900">Calculation Results</h3>
          </div>
          <p className="text-sm italic text-gray-600 mb-3">Key financial metrics clearly highlighted:</p>
          <div className="bg-blue-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-center border-b-2 border-blue-200 pb-3">
              <span className="font-bold text-gray-800">Monthly EMI (Equal Monthly Installment):</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(result.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-blue-200 pb-2">
              <span className="font-semibold text-gray-700">Total Payable Amount:</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(result.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Interest Payable:</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(result.totalInterest)}</span>
            </div>
          </div>

          {result.extraPaymentSavings && (
            <div className="mt-4 bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <p className="font-bold text-green-800 mb-2">Extra Payment Savings:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Interest Saved:</span>
                  <span className="font-semibold text-green-700">{formatCurrency(result.extraPaymentSavings.interestSaved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Time Saved:</span>
                  <span className="font-semibold text-green-700">
                    {Math.round(result.extraPaymentSavings.timeSaved / (paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12))} years
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amortization Table */}
        <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-600 rotate-45 mr-3"></div>
            <h3 className="text-lg font-bold text-gray-900">Amortization Table (First 24 Months)</h3>
          </div>
          <p className="text-sm italic text-gray-600 mb-3">Detailed payment breakdown:</p>
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Month</th>
                  <th className="px-3 py-2 text-right font-semibold">EMI (₹)</th>
                  <th className="px-3 py-2 text-right font-semibold">Principal Paid (₹)</th>
                  <th className="px-3 py-2 text-right font-semibold">Interest Paid (₹)</th>
                  <th className="px-3 py-2 text-right font-semibold">Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {result.amortizationSchedule.slice(0, 24).map((payment, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-3 py-2 border-t border-gray-200">{payment.month}</td>
                    <td className="px-3 py-2 border-t border-gray-200 text-right">
                      {formatCurrency(payment.payment).replace('$', 'Rs. ')}
                    </td>
                    <td className="px-3 py-2 border-t border-gray-200 text-right text-green-700 font-medium">
                      {formatCurrency(payment.principal).replace('$', 'Rs. ')}
                    </td>
                    <td className="px-3 py-2 border-t border-gray-200 text-right text-orange-600 font-medium">
                      {formatCurrency(payment.interest).replace('$', 'Rs. ')}
                    </td>
                    <td className="px-3 py-2 border-t border-gray-200 text-right font-semibold">
                      {formatCurrency(payment.balance).replace('$', 'Rs. ')}
                    </td>
                  </tr>
                ))}
                {result.amortizationSchedule.length > 24 && (
                  <tr className="bg-gray-100">
                    <td colSpan={5} className="px-3 py-2 text-center text-gray-600 italic text-xs">
                      ... (showing first 24 months of {result.amortizationSchedule.length} total payments)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t-2 border-gray-300 pt-6 mt-8">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-blue-600 rotate-45 mr-3"></div>
            <h3 className="text-lg font-bold text-gray-900">Footer Section</h3>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-sm text-gray-800">
              <span className="font-bold">Disclaimer:</span> "This calculation is based on the provided data and may vary depending on bank policies, processing fees, and other charges. Please verify with your financial institution before making any decisions."
            </p>
          </div>
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold">Website/App URL: <span className="text-blue-600">https://dapsiwow.com</span></p>
            <p className="mt-2">© {new Date().getFullYear()} DapsiWow - All Rights Reserved</p>
          </div>
        </div>
      </div>
    );
  }
);

LoanPrintReport.displayName = 'LoanPrintReport';

export default LoanPrintReport;
