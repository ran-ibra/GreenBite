import { useCallback, useState } from "react";

export function useDialogone(initial = []) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(initial);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const open = useCallback(async (fetcherOrData, index = 0) => {
    setIsOpen(true);
    setActiveIndex(index);
    setError(null);

    // if you pass direct data
    if (typeof fetcherOrData !== "function") {
      setData(fetcherOrData);
      return;
    }

    setLoading(true);
    try {
      const res = await fetcherOrData();
      setData(res);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setLoading(false);
    setError(null);
  }, []);

  return { isOpen, open, close, data, activeIndex, setActiveIndex, loading, error };
}
export default function useDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState([]); // array of IDs or data

  // Open dialog with meal ID(s)
  const open = (payload = [], index = 0) => {
    setIsOpen(true);
    setActiveIndex(index);

    if (Array.isArray(payload)) {
      setData(payload);
    } else {
      // Single ID or value
      setData([payload]);
    }
  };

  const close = () => {
    setIsOpen(false);
    setData([]);
    setActiveIndex(0);
  };

  const prev = () => setActiveIndex((i) => Math.max(i - 1, 0));
  const next = () => setActiveIndex((i) => Math.min(i + 1, data.length - 1));

  return {
    isOpen,
    data,
    activeIndex,
    open,
    close,
    prev,
    next,
    setActiveIndex,
  };
}