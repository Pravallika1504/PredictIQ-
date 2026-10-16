export interface Sale {
  product: string;
  category: string;
  region: string;
  quantity: number;
  sales: number;
  profit: number;
  date?: string;
}

interface SalesTableProps {
  data?: Sale[];
}

const defaultSalesData: Sale[] = [
  {
    product: "Laptop",
    category: "Electronics",
    region: "South",
    quantity: 2,
    sales: 104500,
    profit: 12000,
  },
  {
    product: "Monitor",
    category: "Electronics",
    region: "South",
    quantity: 4,
    sales: 68400,
    profit: 12500,
  },
  {
    product: "Chair",
    category: "Furniture",
    region: "West",
    quantity: 3,
    sales: 18900,
    profit: 4200,
  },
  {
    product: "Desk",
    category: "Furniture",
    region: "North",
    quantity: 2,
    sales: 21600,
    profit: 5000,
  },
  {
    product: "Keyboard",
    category: "Electronics",
    region: "East",
    quantity: 8,
    sales: 12000,
    profit: 4000,
  },
];

function SalesTable({ data }: SalesTableProps) {
  const items = data && data.length > 0 ? data : defaultSalesData;

  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <h3>Recent Sales</h3>
          <p>Latest transactions from your dataset</p>
        </div>

        <button className="view-button">
          View all
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Region</th>
              <th>Quantity</th>
              <th>Sales</th>
              <th>Profit</th>
            </tr>
          </thead>

          <tbody>
            {items.map((sale, index) => (
              <tr key={index}>
                <td className="product-name">
                  {sale.product}
                </td>

                <td>
                  <span className="category-badge">
                    {sale.category}
                  </span>
                </td>

                <td>{sale.region}</td>

                <td>{sale.quantity}</td>

                <td>
                  ₹{(sale.sales ?? 0).toLocaleString("en-IN")}
                </td>

                <td className="profit-text">
                  ₹{(sale.profit ?? 0).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesTable;