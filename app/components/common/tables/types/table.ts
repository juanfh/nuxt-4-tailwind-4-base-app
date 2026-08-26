// Port literal de src/components/common/tables/types/table.ts (Next).
export interface DataTableAction<TData> {
  label: string
  icon?: unknown
  onClick: (rowData: TData) => void
}
