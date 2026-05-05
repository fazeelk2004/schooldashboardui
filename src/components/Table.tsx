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
    <div className="mt-4 w-full overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-surface-subtle text-left text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className={`px-4 py-3 border-b border-line ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line text-sm [&_td]:px-4 [&_td]:py-3">
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
