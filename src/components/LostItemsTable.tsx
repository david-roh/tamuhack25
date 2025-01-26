export function LostItemsTable({ items }: { items: LostItem[] }) {
  return (
    <table>
      {/* ... other columns ... */}
      <td>
        <button
          onClick={() => onViewDetails(item)}
          className="text-blue-600 hover:text-blue-800"
        >
          View Details ({item.claimToken})
        </button>
      </td>
      {/* ... */}
    </table>
  );
} 