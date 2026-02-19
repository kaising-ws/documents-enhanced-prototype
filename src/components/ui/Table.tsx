interface Column<T> {
  id: string
  header: string
  cell: (item: T) => React.ReactNode
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-light">
            {columns.map((column) => (
              <th
                key={column.id}
                style={{ width: column.width }}
                className="h-12 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`
                border-b border-border-light last:border-b-0
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              `}
            >
              {columns.map((column) => (
                <td key={column.id} className="h-14 px-4">
                  {column.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



