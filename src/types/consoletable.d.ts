declare module '@xdooi/consoletable' {
  interface DrawTableOptions {
    head?: boolean | string;
    max?: number;
  }

  interface Consoletable {
    drawTable(data: Record<string, unknown>[], options?: DrawTableOptions): void;
  }

  const consoletable: Consoletable;
  export default consoletable;
}
