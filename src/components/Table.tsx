const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="data-table-shell mt-5 w-full overflow-x-auto rounded-2xl border border-line/75 bg-surface">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-surface-muted/75 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className={`border-b border-line/75 px-4 py-3.5 ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70 text-sm [&_tr]:transition-colors [&_td]:px-4 [&_td]:py-3.5">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-ink-subtle"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item) => renderRow(item))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
