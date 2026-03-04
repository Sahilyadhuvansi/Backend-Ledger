import api from "../../../core/utils/api";

export const fetchAccounts = async (
  setAccounts,
  setFormData,
  setStatus,
  setFetching,
) => {
  try {
    const { data } = await api.get("/accounts");
    setAccounts(data.data);
    if (data.data.length > 0) {
      setFormData((prev) =>
        prev.fromAccount ? prev : { ...prev, fromAccount: data.data[0]._id },
      );
    }
  } catch (err) {
    console.error(err);
    setStatus({ type: "error", message: "Failed to fetch accounts." });
  } finally {
    setFetching(false);
  }
};

export const handleTransfer = async (
  e,
  loading,
  setLoading,
  setStatus,
  formData,
  setFormData,
  refreshCallback,
) => {
  e.preventDefault();
  if (loading) return;
  setLoading(true);
  setStatus(null);
  try {
    const idempotencyKey = crypto.randomUUID();
    await api.post("/transactions", { ...formData, idempotencyKey });
    setStatus({
      type: "success",
      message: "Funds transferred successfully! Your ledger has been updated.",
    });
    setFormData((prev) => ({ ...prev, toAccount: "", amount: "" }));
    if (refreshCallback) refreshCallback();
    setTimeout(() => setStatus(null), 5000);
  } catch (err) {
    setStatus({
      type: "error",
      message:
        err.response?.data?.message ||
        "Transaction failed. Please verify recipient ID.",
    });
  } finally {
    setLoading(false);
  }
};
