
import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

interface DataTableProps<TData> {
  columns: {
    accessorKey?: string;
    header?: string;
    id?: string;
    cell?: (props: { row: any }) => React.ReactNode;
  }[];
  data: TData[];
}

export function DataTable<TData>({
  columns,
  data
}: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={column.id || column.accessorKey || index}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, columnIndex) => (
                <TableCell key={column.id || column.accessorKey || columnIndex}>
                  {column.cell 
                    ? column.cell({ row }) 
                    : column.accessorKey 
                      ? String(row[column.accessorKey as keyof typeof row] ?? '') 
                      : null
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                没有数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
