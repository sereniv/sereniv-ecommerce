import { Input } from "./ui/input";
import { Entity } from "@/lib/types/entity";

function StatsDetails({ formData, setFormData, formErrors }: { formData: Entity, setFormData: (formData: Entity) => void, formErrors: any }) {
  return (
    <div className="space-y-6">
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Market Cap</label>
          <Input
            value={formData.marketCap || ""}
            onChange={(e) => setFormData({ ...formData, marketCap: parseFloat(e.target.value) })}
            className={`h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300 ${formErrors.marketCap ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
            placeholder="Enter market cap value"
            type="number"
            step="0.01"
          />
          {formErrors.marketCap && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {formErrors.marketCap}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Share Price</label>
          <Input
            value={formData.sharePrice || ""}
            onChange={(e) => setFormData({ ...formData, sharePrice: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter share price"
            type="number"
            step="0.01"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Enterprise Value</label>
          <Input
            value={formData.enterpriseValue || ""}
            onChange={(e) => setFormData({ ...formData, enterpriseValue: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter enterprise value"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Bitcoin Holdings</label>
          <Input
            type="number"
            value={formData.bitcoinHoldings || 0}
            onChange={(e) => setFormData({ ...formData, bitcoinHoldings: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter bitcoin holdings"
            step="0.00000001"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">BTC Per Share</label>
          <Input
            type="number"
            value={
              formData.btcPerShare !== undefined
                ? Number(formData.btcPerShare).toFixed(8)
                : 0
            }
            onChange={(e) => setFormData({ ...formData, btcPerShare: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter BTC per share"
            step="0.00000001"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Cost Basis</label>
          <Input
            type="number"
            value={formData.costBasis || 0}
            onChange={(e) => setFormData({ ...formData, costBasis: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter cost basis"
            step="0.01"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">USD Value</label>
          <Input
            type="number"
            value={formData.usdValue || 0}
            onChange={(e) => setFormData({ ...formData, usdValue: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter USD value"
            step="0.01"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">NGU (Number Go Up)</label>
          <Input
            type="number"
            value={formData.ngu || 0}
            onChange={(e) => setFormData({ ...formData, ngu: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter NGU value"
            step="0.01"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">M-NAV (Market to NAV)</label>
          <Input
            type="number"
            value={formData.mNav || 0}
            onChange={(e) => setFormData({ ...formData, mNav: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter M-NAV value"
            step="0.01"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Market Cap Percentage</label>
          <Input
            type="number"
            value={formData.marketCapPercentage || 0}
            onChange={(e) => setFormData({ ...formData, marketCapPercentage: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter market cap percentage"
            step="0.01"
            max="100"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Supply Percentage</label>
          <Input
            type="number"
            value={formData.supplyPercentage || 0}
            onChange={(e) => setFormData({ ...formData, supplyPercentage: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter supply percentage"
            step="0.01"
            max="100"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Profit/Loss Percentage</label>
          <Input
            type="number"
            value={formData.profitLossPercentage || 0}
            onChange={(e) => setFormData({ ...formData, profitLossPercentage: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter profit/loss percentage"
            step="0.01"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Avg Cost Per BTC</label>
          <Input
            type="number"
            value={formData.avgCostPerBTC || 0}
            onChange={(e) => setFormData({ ...formData, avgCostPerBTC: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter average cost per BTC"
            step="0.01"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">Bitcoin Value in USD</label>
          <Input
            type="number"
            value={formData.bitcoinValueInUSD || 0}
            onChange={(e) => setFormData({ ...formData, bitcoinValueInUSD: parseFloat(e.target.value) })}
            className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
            placeholder="Enter bitcoin value in USD"
            step="0.01"
          />
        </div>
      </div>
    </div>
  </div>
  )
}

export default StatsDetails;