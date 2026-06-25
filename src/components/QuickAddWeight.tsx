import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Loader2, Scale } from 'lucide-react';

interface QuickAddWeightProps {
  date: Date;
  onClose: () => void;
}

export function QuickAddWeight({ date, onClose }: QuickAddWeightProps) {
  const { user, profile } = useAuth();
  const [weight, setWeight] = useState(profile?.current_weight_kg?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!user || !weight) return;
    setLoading(true);

    const { error } = await supabase.from('weight_records').upsert(
      {
        user_id: user.id,
        weight_kg: parseFloat(weight),
        recorded_at: date.toISOString().split('T')[0],
      },
      { onConflict: 'user_id,recorded_at' }
    );

    if (!error) {
      await supabase
        .from('profiles')
        .update({ current_weight_kg: parseFloat(weight), updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-white dark:bg-secondary-800 w-full lg:max-w-md lg:rounded-2xl rounded-t-2xl animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Registrar Peso</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex items-center justify-center py-4">
            <div className="w-20 h-20 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
              <Scale className="w-10 h-10 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input text-center text-2xl font-semibold"
              placeholder="75.5"
              min={30}
              max={300}
              step={0.1}
            />
          </div>

          {profile && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-700">
                <p className="text-xs text-secondary-500">Inicial</p>
                <p className="font-semibold text-secondary-900 dark:text-white">
                  {profile.current_weight_kg?.toFixed(1)} kg
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-700">
                <p className="text-xs text-secondary-500">Meta</p>
                <p className="font-semibold text-primary-500">
                  {profile.target_weight_kg?.toFixed(1)} kg
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-700">
                <p className="text-xs text-secondary-500">Diferença</p>
                <p className="font-semibold text-secondary-900 dark:text-white">
                  {weight && profile.current_weight_kg
                    ? `${(parseFloat(weight) - profile.current_weight_kg).toFixed(1)} kg`
                    : '--'}
                </p>
              </div>
            </div>
          )}

          <button onClick={handleAdd} disabled={loading || !weight} className="btn-primary w-full">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
