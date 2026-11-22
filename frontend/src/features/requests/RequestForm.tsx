import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { calculateTotal } from '../../lib/money';
import { requestSchema, type RequestInput } from '../../lib/validation';
type Fields = Omit<RequestInput, 'quantity'> & { quantity: string };
export function RequestForm({ onSubmit, error }: { onSubmit: (v: RequestInput) => void; error: string }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Fields>({ resolver: zodResolver(requestSchema) as never, defaultValues: { quantity: '1' } });
  const values = watch();
  return <form className="form" onSubmit={handleSubmit((v) => onSubmit(requestSchema.parse(v)))} noValidate>{(['title','description','category','quantity','unitCost','requiredDate','justification'] as const).map((name) => <label key={name}>{name.replace(/([A-Z])/g, ' $1')}<input {...register(name)} type={name === 'requiredDate' ? 'date' : name === 'quantity' ? 'number' : 'text'} />{errors[name] && <small role="alert">{errors[name]?.message}</small>}</label>)}<output>Total preview: {calculateTotal(values.quantity || '', values.unitCost || '')}</output>{error && <p role="alert">{error}</p>}<button><Plus size={16} aria-hidden /> Create draft</button></form>;
}
