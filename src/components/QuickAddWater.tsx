import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Loader2, Droplets } from 'lucide-react';

interface QuickAddWaterProps {
  date: Date;
  onClose: () => void;
}

const QUICK_AMOUNTS = [200, 300, 500, 1000];

export function QuickAddWater({ date, onClose }: QuickAddWaterProps) {
  const { user } = useAuth();
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (amount: number) => {
    if (!user) return;
    setLoading(true);

    await supabase.from('water_consumption').insert({
      user_id: user.id,
      amount_ml: amount,
      consumed_at: date.toISOString(),
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-white dark:bg-secondary-800 w-full lg:max-w-md lg:rounded-2xl rounded-t-2xl animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Adicionar Água</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAdd(amount)}
                disabled={loading}
                className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center disabled:opacity-50"
              >
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold text-secondary-900 dark:text-white">
                  {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
                </p>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Quantidade personalizada (ml)
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="input"
              placeholder="Ex: 350"
              min={1}
            />
          </div>

          <button
            onClick={() => handleAdd(parseInt(customAmount))}
            disabled={loading || !customAmount}
            className="btn-primary w-full"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
