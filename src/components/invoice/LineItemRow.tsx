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
    <div className="grid grid-cols-12 gap-3 items-end group animate-slide-in-up">
      <div className="col-span-6">
        <label className="block text-[10px] font-medium text-navy-400 mb-1 ml-1 uppercase tracking-wider">Item Name</label>
        <input
          {...register(`items.${index}.name` as const, { required: true })}
          placeholder="Service or Product"
          className="input-field"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-[10px] font-medium text-navy-400 mb-1 ml-1 uppercase tracking-wider">Qty</label>
        <input
          type="number"
          step="any"
          {...register(`items.${index}.quantity` as const, { valueAsNumber: true, required: true })}
          className="input-field px-2 text-center"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-[10px] font-medium text-navy-400 mb-1 ml-1 uppercase tracking-wider">Price</label>
        <input
          type="number"
          step="0.01"
          {...register(`items.${index}.price` as const, { valueAsNumber: true, required: true })}
          className="input-field px-2 text-center"
        />
      </div>
      <div className="col-span-1 text-right self-center pt-5">
         <span className="text-xs font-mono text-cyan-400">₹{total.toFixed(2)}</span>
      </div>
      <div className="col-span-1 flex justify-end pb-1.5">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
