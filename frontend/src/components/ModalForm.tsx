import { FormEvent, useState } from "react";

type Errors = Record<string, string>;
const messageOf = (error: unknown) => error instanceof Error ? error.message : "Request failed";
const fieldError = (errors: Errors, name: string) => errors[name] && <p className="field-error">{errors[name]}</p>;
const inputClass = (hasError: boolean) => `w-full ${hasError ? "input-error" : ""}`;

export function AccountForm({ onSubmit }: { onSubmit: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return <form className="space-y-4" onSubmit={async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!name.trim()) { setError("Account name is required"); return; }
    try { await onSubmit(name.trim()); setName(""); } catch (e) { setError(messageOf(e)); }
  }}>
    <div><label htmlFor="account-name">Account name <span className="required-mark">*</span></label><input id="account-name" required aria-required="true" className={inputClass(!!error)} placeholder="e.g. Operating account" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />{error && <p className="field-error">{error}</p>}</div>
    <button disabled={!name.trim()} className="btn-primary w-full">Create account</button>
  </form>;
}

export function MoneyForm({ accountId, onSubmit }: { accountId: number; onSubmit: (id: number, body: object) => Promise<void> }) {
  const [type, setType] = useState("credit"); const [amount, setAmount] = useState(""); const [referenceId, setReferenceId] = useState(""); const [description, setDescription] = useState(""); const [errors, setErrors] = useState<Errors>({});
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const next: Errors = {};
    if (!/^\d+(\.\d{1,4})?$/.test(amount) || Number(amount) <= 0) next.amount = "Enter an amount greater than 0 (up to 4 decimals)";
    if (!referenceId.trim()) next.referenceId = "Reference ID is required";
    setErrors(next); if (Object.keys(next).length) return;
    try { await onSubmit(accountId, { type, amount, referenceId: referenceId.trim(), description: description.trim() || undefined }); setAmount(""); setReferenceId(""); setDescription(""); }
    catch (e) { const message = messageOf(e); setErrors(message.toLowerCase().includes("reference") ? { referenceId: message } : { amount: message }); }
  };
  return <form className="space-y-3" onSubmit={submit}>
    <div><label htmlFor="movement-type">Movement type</label><select id="movement-type" className="w-full" value={type} onChange={(e) => setType(e.target.value)}><option value="credit">Credit</option><option value="debit">Debit</option></select></div>
    <div><label htmlFor="movement-amount">Amount <span className="required-mark">*</span></label><input id="movement-amount" required aria-required="true" inputMode="decimal" className={inputClass(!!errors.amount)} placeholder="0.00" value={amount} onChange={(e) => { setAmount(e.target.value); setErrors({}); }} />{fieldError(errors, "amount")}</div>
    <div><label htmlFor="movement-reference">Reference ID <span className="required-mark">*</span></label><input id="movement-reference" required aria-required="true" className={inputClass(!!errors.referenceId)} placeholder="invoice-1001" value={referenceId} onChange={(e) => { setReferenceId(e.target.value); setErrors({}); }} />{fieldError(errors, "referenceId")}</div>
    <div><label htmlFor="movement-description">Description <span className="optional-label">(optional)</span></label><textarea id="movement-description" className="min-h-20 w-full resize-y" maxLength={500} placeholder="What is this transaction for?" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
    <button disabled={!amount.trim() || !referenceId.trim()} className="btn-primary w-full">Post transaction</button>
  </form>;
}

export function TransferForm({ onSubmit }: { onSubmit: (body: object) => Promise<void> }) {
  const [sourceAccountId, setSource] = useState(""); const [destinationAccountId, setDestination] = useState(""); const [amount, setAmount] = useState(""); const [referenceId, setRef] = useState(""); const [errors, setErrors] = useState<Errors>({});
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const next: Errors = {};
    if (!/^\d+$/.test(sourceAccountId) || Number(sourceAccountId) < 1) next.source = "Enter a valid source account ID";
    if (!/^\d+$/.test(destinationAccountId) || Number(destinationAccountId) < 1) next.destination = "Enter a valid destination account ID";
    if (sourceAccountId && destinationAccountId && sourceAccountId === destinationAccountId) next.destination = "Destination must be different";
    if (!/^\d+(\.\d{1,4})?$/.test(amount) || Number(amount) <= 0) next.amount = "Enter an amount greater than 0 (up to 4 decimals)";
    if (!referenceId.trim()) next.referenceId = "Reference ID is required";
    setErrors(next); if (Object.keys(next).length) return;
    try { await onSubmit({ sourceAccountId: Number(sourceAccountId), destinationAccountId: Number(destinationAccountId), amount, referenceId: referenceId.trim() }); setSource(""); setDestination(""); setAmount(""); setRef(""); }
    catch (e) { const message = messageOf(e); setErrors(message.toLowerCase().includes("reference") ? { referenceId: message } : message.toLowerCase().includes("balance") ? { amount: message } : { form: message }); }
  };
  return <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
    <div><label htmlFor="source-account">Source account <span className="required-mark">*</span></label><input id="source-account" required aria-required="true" inputMode="numeric" className={inputClass(!!errors.source)} placeholder="Account ID" value={sourceAccountId} onChange={(e) => { setSource(e.target.value); setErrors({}); }} />{fieldError(errors, "source")}</div>
    <div><label htmlFor="destination-account">Destination account <span className="required-mark">*</span></label><input id="destination-account" required aria-required="true" inputMode="numeric" className={inputClass(!!errors.destination)} placeholder="Account ID" value={destinationAccountId} onChange={(e) => { setDestination(e.target.value); setErrors({}); }} />{fieldError(errors, "destination")}</div>
    <div><label htmlFor="transfer-amount">Amount <span className="required-mark">*</span></label><input id="transfer-amount" required aria-required="true" inputMode="decimal" className={inputClass(!!errors.amount)} placeholder="0.00" value={amount} onChange={(e) => { setAmount(e.target.value); setErrors({}); }} />{fieldError(errors, "amount")}</div>
    <div><label htmlFor="transfer-reference">Reference ID <span className="required-mark">*</span></label><input id="transfer-reference" required aria-required="true" className={inputClass(!!errors.referenceId)} placeholder="transfer-1001" value={referenceId} onChange={(e) => { setRef(e.target.value); setErrors({}); }} />{fieldError(errors, "referenceId")}</div>
    {errors.form && <p className="field-error sm:col-span-2">{errors.form}</p>}
    <button disabled={!sourceAccountId.trim() || !destinationAccountId.trim() || !amount.trim() || !referenceId.trim()} className="btn-primary sm:col-span-2">Transfer money atomically</button>
  </form>;
}
