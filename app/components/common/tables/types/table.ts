export interface DataTableAction<TData> {
  label: string
  icon?: unknown
  onClick: (rowData: TData) => void
}
