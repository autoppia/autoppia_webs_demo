"use client";

import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useSeed } from "@/context/SeedContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { generateMockTransaction } from "@/data/generators";
import { formatNumber } from "@/library/formatters";
import { Check, AlertCircle, Loader2, ArrowLeft, Wallet, Send, X } from "lucide-react";

type TransferStep = "form" | "confirm" | "executing" | "success";

interface FormState {
  to: string;
  amount: string;
  memo: string;
}

function isValidSS58(address: string): boolean {
  return address.startsWith("5") && address.length === 48;
}

interface SendTransferPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SendTransferPanel({ open, onClose }: SendTransferPanelProps) {
  const { connected, address, balance } = useWallet();
  const { seed } = useSeed();

  const [step, setStep] = useState<TransferStep>("form");
  const [form, setForm] = useState<FormState>({ to: "", amount: "", memo: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [txResult, setTxResult] = useState<{
    hash: string;
    blockNumber: number;
    amount: number;
    fee: number;
  } | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};

    if (!form.to.trim()) {
      newErrors.to = "Recipient address is required";
    } else if (!isValidSS58(form.to.trim())) {
      newErrors.to = "Invalid SS58 address (must start with '5', 48 characters)";
    }

    const amt = Number.parseFloat(form.amount);
    if (!form.amount.trim() || Number.isNaN(amt)) {
      newErrors.amount = "Amount is required";
    } else if (amt <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (balance !== null && amt > balance) {
      newErrors.amount = "Insufficient balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReview = () => {
    if (!validate()) return;
    logEvent(EVENT_TYPES.INITIATE_TRANSFER, {
      to: form.to,
      amount: form.amount,
      memo: form.memo,
    });
    setStep("confirm");
  };

  const handleConfirm = async () => {
    logEvent(EVENT_TYPES.CONFIRM_TRANSFER, {
      to: form.to,
      amount: form.amount,
    });
    setStep("executing");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const amt = Number.parseFloat(form.amount);
    const result = generateMockTransaction(seed, address || "", form.to, amt);

    setTxResult({
      hash: result.hash,
      blockNumber: result.blockNumber,
      amount: result.amount,
      fee: result.fee,
    });

    logEvent(EVENT_TYPES.TRANSFER_COMPLETE, {
      hash: result.hash,
      from: address,
      to: form.to,
      amount: amt,
      block_number: result.blockNumber,
    });

    setStep("success");
  };

  const handleReset = () => {
    setStep("form");
    setForm({ to: "", amount: "", memo: "" });
    setErrors({});
    setTxResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden backdrop-blur-sm mb-8">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Send Transfer</h3>
        </div>
        <button
          onClick={handleClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Panel Body */}
      <div className="p-6">
        {!connected ? (
          <NotConnectedPrompt />
        ) : step === "form" ? (
          <FormStep
            form={form}
            errors={errors}
            balance={balance}
            address={address}
            onFormChange={setForm}
            onReview={handleReview}
          />
        ) : step === "confirm" ? (
          <ConfirmStep
            form={form}
            address={address}
            onConfirm={handleConfirm}
            onBack={() => setStep("form")}
          />
        ) : step === "executing" ? (
          <ExecutingStep />
        ) : step === "success" && txResult ? (
          <SuccessStep
            txResult={txResult}
            to={form.to}
            onNewTransfer={handleReset}
            onDone={handleClose}
          />
        ) : null}
      </div>
    </div>
  );
}

function NotConnectedPrompt() {
  return (
    <div className="text-center py-8">
      <Wallet className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-white mb-1">Wallet Not Connected</h3>
      <p className="text-sm text-zinc-400">
        Connect your wallet using the button in the header to send transfers
      </p>
    </div>
  );
}

function FormStep({
  form,
  errors,
  balance,
  address,
  onFormChange,
  onReview,
}: {
  form: FormState;
  errors: Partial<FormState>;
  balance: number | null;
  address: string | null;
  onFormChange: (form: FormState) => void;
  onReview: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column: From + To */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">From</label>
          <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-2.5">
            <div className="font-mono text-sm text-zinc-300 truncate">
              {address || "Not connected"}
            </div>
            {balance !== null && (
              <div className="text-xs text-zinc-500 mt-0.5">
                Balance: {formatNumber(balance, 4)} TAO
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">To</label>
          <input
            type="text"
            value={form.to}
            onChange={(e) => onFormChange({ ...form, to: e.target.value })}
            placeholder="5..."
            className={`w-full rounded-xl bg-zinc-800/50 border ${
              errors.to ? "border-red-500" : "border-zinc-700"
            } px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono`}
          />
          {errors.to && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {errors.to}
            </div>
          )}
        </div>
      </div>

      {/* Right column: Amount + Memo + Submit */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Amount (TAO)</label>
          <div className="relative">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => onFormChange({ ...form, amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.0001"
              className={`w-full rounded-xl bg-zinc-800/50 border ${
                errors.amount ? "border-red-500" : "border-zinc-700"
              } px-4 py-2.5 pr-16 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500`}
            />
            {balance !== null && (
              <button
                onClick={() => onFormChange({ ...form, amount: balance.toFixed(4) })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                Max
              </button>
            )}
          </div>
          {errors.amount && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {errors.amount}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Memo <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="text"
            value={form.memo}
            onChange={(e) => onFormChange({ ...form, memo: e.target.value })}
            placeholder="Add a note..."
            className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onReview}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20"
        >
          Review Transfer
        </button>
      </div>
    </div>
  );
}

function ConfirmStep({
  form,
  address,
  onConfirm,
  onBack,
}: {
  form: FormState;
  address: string | null;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const amount = Number.parseFloat(form.amount);
  const fee = 0.01;
  const total = amount + fee;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-base font-semibold text-white">Confirm Transfer</h3>
      </div>

      <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">From</span>
          <span className="font-mono text-zinc-300 text-xs truncate max-w-[200px]">
            {address}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">To</span>
          <span className="font-mono text-zinc-300 text-xs truncate max-w-[200px]">
            {form.to}
          </span>
        </div>
        <div className="border-t border-zinc-700" />
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Amount</span>
          <span className="text-white font-medium">{formatNumber(amount, 4)} TAO</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Network Fee</span>
          <span className="text-zinc-300">{fee} TAO</span>
        </div>
        <div className="border-t border-zinc-700" />
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400 font-medium">Total</span>
          <span className="text-white font-semibold">{formatNumber(total, 4)} TAO</span>
        </div>
        {form.memo && (
          <>
            <div className="border-t border-zinc-700" />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Memo</span>
              <span className="text-zinc-300">{form.memo}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20"
        >
          Confirm & Send
        </button>
      </div>
    </div>
  );
}

function ExecutingStep() {
  return (
    <div className="text-center py-10">
      <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-white mb-1">Processing Transfer</h3>
      <p className="text-sm text-zinc-400">
        Submitting your transaction to the Bittensor network...
      </p>
    </div>
  );
}

function SuccessStep({
  txResult,
  to,
  onNewTransfer,
  onDone,
}: {
  txResult: { hash: string; blockNumber: number; amount: number; fee: number };
  to: string;
  onNewTransfer: () => void;
  onDone: () => void;
}) {
  return (
    <div className="max-w-md mx-auto text-center py-4">
      <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
        <Check className="h-7 w-7 text-green-400" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">Transfer Successful</h3>
      <p className="text-sm text-zinc-400 mb-5">
        {formatNumber(txResult.amount, 4)} TAO has been sent
      </p>

      <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 text-left space-y-2.5 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Tx Hash</span>
          <span className="font-mono text-xs text-cyan-400 truncate max-w-[200px]">
            {txResult.hash}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Block</span>
          <span className="text-zinc-300">#{txResult.blockNumber.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Amount</span>
          <span className="text-white font-medium">{formatNumber(txResult.amount, 4)} TAO</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">To</span>
          <span className="font-mono text-xs text-zinc-300 truncate max-w-[200px]">
            {to}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDone}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Done
        </button>
        <button
          onClick={onNewTransfer}
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20"
        >
          Send Another
        </button>
      </div>
    </div>
  );
}
