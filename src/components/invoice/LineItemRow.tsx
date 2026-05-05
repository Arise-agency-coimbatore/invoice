'use client';

import { Trash2 } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';

interface LineItemRowProps {
  index: number;
  register: UseFormRegister<any>;
  onRemove: (index: number) => void;
  total: number;
}

export default function LineItemRow({ index, register, onRemove, total }: LineItemRowProps) {
  return (
    <div className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-4 items-center group animate-slide-in-up">
      <div className="relative">
        <input
          {...register(`items.${index}.name` as const, { required: true })}
          placeholder="Service or Product"
          className="input-field py-2"
        />
      </div>
      <div>
        <input
          type="number"
          step="any"
          {...register(`items.${index}.quantity` as const, { valueAsNumber: true, required: true })}
          className="input-field py-2 px-2 text-center"
        />
      </div>
      <div>
        <input
          type="number"
          step="0.01"
          {...register(`items.${index}.price` as const, { valueAsNumber: true, required: true })}
          className="input-field py-2 px-2 text-center"
          placeholder="0.00"
        />
      </div>
      <div className="text-center">
         <span className="text-sm font-bold text-white">₹{total.toLocaleString()}</span>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
          title="Remove Item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
