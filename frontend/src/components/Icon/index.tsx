import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export const Icon = {
  Run: (p: P) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path fill="currentColor" d="M3 1.8l7 4.2-7 4.2z"/></svg>,
  Plot: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M1 12V2M1 12h12M3 9c2-3 3-5 5-5s3 3 5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Heatmap: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" {...p}><rect x="1" y="1" width="3.5" height="3.5" fill="currentColor" opacity=".4"/><rect x="5" y="1" width="3.5" height="3.5" fill="currentColor" opacity=".7"/><rect x="9" y="1" width="3.5" height="3.5" fill="currentColor"/><rect x="1" y="5" width="3.5" height="3.5" fill="currentColor" opacity=".3"/><rect x="5" y="5" width="3.5" height="3.5" fill="currentColor" opacity=".55"/><rect x="9" y="5" width="3.5" height="3.5" fill="currentColor" opacity=".85"/><rect x="1" y="9" width="3.5" height="3.5" fill="currentColor" opacity=".2"/><rect x="5" y="9" width="3.5" height="3.5" fill="currentColor" opacity=".4"/><rect x="9" y="9" width="3.5" height="3.5" fill="currentColor" opacity=".7"/></svg>,
  Anim: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5l4 2-4 2z" fill="currentColor"/></svg>,
  Cube: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M7 1l5 2.5v7L7 13 2 10.5v-7zM7 1v6m0 0L2 4.5M7 7l5-2.5M7 7v6" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  Gallery: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>,
  History: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M2 7a5 5 0 105-5M2 7l-1-2M2 7l2-1M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Save: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M2 2h7l3 3v7H2zM4 2v4h5V2M4 9h6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  Open: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M1 4h4l2 1.5h6V12H1z M1 4V2.5h5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  Pause: (p: P) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><rect x="3" y="2" width="2" height="8" fill="currentColor"/><rect x="7" y="2" width="2" height="8" fill="currentColor"/></svg>,
  Stop: (p: P) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><rect x="2.5" y="2.5" width="7" height="7" fill="currentColor"/></svg>,
  Reset: (p: P) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}><path d="M2 6a4 4 0 104-4 4 4 0 00-3 1.5M2 1.5V4h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  Plus: (p: P) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Close: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" {...p}><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Code: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M5 4L2 7l3 3M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Mesh: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M1 1h12v12H1zM1 5h12M1 9h12M5 1v12M9 1v12" stroke="currentColor" strokeWidth="1"/></svg>,
  Export: (p: P) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M7 1v8M4 5l3-4 3 4M2 11v1h10v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
