-- Defensive database invariants. API validation remains user-friendly, while
-- these constraints protect the ledger if another client writes to the DB.
ALTER TABLE "Account"
  ADD CONSTRAINT "Account_balance_nonnegative" CHECK ("balance" >= 0);

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_amount_positive" CHECK ("amount" > 0);
