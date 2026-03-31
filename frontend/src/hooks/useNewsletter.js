import { useState } from "react";

export default function useNewsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subscribe = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      // fake API (replace later)
      await new Promise((res) => setTimeout(res, 1000));
      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, subscribe, loading, success };
}