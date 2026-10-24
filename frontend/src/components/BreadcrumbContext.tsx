import React, { createContext, useContext, useEffect, useState } from 'react';

interface BreadcrumbCtx {
  dynamicLabel: string | null;
  setDynamicLabel: (label: string | null) => void;
}

const Ctx = createContext<BreadcrumbCtx>({ dynamicLabel: null, setDynamicLabel: () => {} });

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dynamicLabel, setDynamicLabel] = useState<string | null>(null);
  return <Ctx.Provider value={{ dynamicLabel, setDynamicLabel }}>{children}</Ctx.Provider>;
};

export const useBreadcrumbContext = () => useContext(Ctx);

export const useDynamicCrumb = (label: string | null | undefined) => {
  const { setDynamicLabel } = useContext(Ctx);
  useEffect(() => {
    setDynamicLabel(label || null);
    return () => setDynamicLabel(null);
  }, [label, setDynamicLabel]);
};
