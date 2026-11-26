import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X } from 'lucide-react';
import { rejectionSchema, type RejectionInput } from '../../lib/validation';
export function RejectionControl({approve,reject,disabled=false}:{approve:()=>void;reject:(s:string)=>void;disabled?:boolean}) {
 const {register,handleSubmit,formState:{errors}}=useForm<RejectionInput>({resolver:zodResolver(rejectionSchema)});
 return <div className="actions"><button type="button" disabled={disabled} onClick={approve}><Check size={16} aria-hidden/> Approve</button><form onSubmit={handleSubmit(({comment})=>reject(comment))} noValidate><label>Reason for rejection<textarea {...register('comment')} disabled={disabled}/>{errors.comment&&<small role="alert">{errors.comment.message}</small>}</label><button disabled={disabled}><X size={16} aria-hidden/> Reject</button></form></div>;
}
