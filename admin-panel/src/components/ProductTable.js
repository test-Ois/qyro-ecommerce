function ProductTable({ products, deleteProduct, editProduct }) {

  return (

    <table border="1" width="100%">

      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Price</th>
          <th>Description</th>
          <th>Category</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {products.map((p) => (
          <tr key={p._id}>

            <td>
              <img src={p.image} width="50" alt={p.name} />
            </td>

            <td>{p.name}</td>
            <td>₹{p.price}</td>
            <td>{p.description}</td>
            <td>{p.category}</td>

            {/* Stock column with low stock warning */}
            <td>
              {p.stock}
              {p.stock < 10 && (
                <span style={{
                  marginLeft: "8px",
                  color: "white",
                  background: "#dc2626",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "11px"
                }}>
                  Low Stock
                </span>
              )}
            </td>

            <td>
              {/* Passes full product object to trigger EditProductModal */}
              <button onClick={() => editProduct(p)}>Edit</button>
              <button onClick={() => deleteProduct(p._id)}>Delete</button>
            </td>

          </tr>
        ))}
      </tbody>

    </table>

  );

}

export default ProductTable;