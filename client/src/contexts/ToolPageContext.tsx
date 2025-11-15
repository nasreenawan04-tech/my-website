import { createContext } from 'react';

// Context to override canonical URLs when rendered through ToolPage
export const ToolPageContext = createContext<{ canonicalOverride?: string }>({});
