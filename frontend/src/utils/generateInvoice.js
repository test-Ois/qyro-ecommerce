import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order) => {

  const doc = new jsPDF();

  // ===== HEADER =====
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo color
  doc.text("Qyro", 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("Invoice", 14, 28);

  // ===== DIVIDER LINE =====
  doc.setDrawColor(200);
  doc.line(14, 32, 196, 32);

  // ===== ORDER INFO =====
  doc.setFontSize(10);
  doc.setTextColor(50);

  doc.text(`Order ID: ${order._id}`, 14, 42);
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
    14,
    50
  );
  doc.text(`Status: ${order.status || order.orderStatus || "N/A"}`, 14, 58);

  // ===== CUSTOMER INFO =====
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("Customer Details", 14, 70);

  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.text(`Name: ${order.user?.name || "N/A"}`, 14, 78);
  doc.text(`Email: ${order.user?.email || "N/A"}`, 14, 86);

  // ===== PRODUCTS TABLE =====
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("Order Items", 14, 100);

  // Build table rows from order products
  const tableRows = order.products.map((item, index) => {
    const name = item.name || item.product?.name || "Product";
    const price = item.price !== undefined && item.price !== null ? item.price : (item.product?.price || 0);
    return [
      index + 1,
      name,
      item.quantity,
      `Rs. ${price}`,
      `Rs. ${price * item.quantity}`
    ];
  });

  autoTable(doc, {
    startY: 105,
    head: [["#", "Product", "Qty", "Unit Price", "Total"]],
    body: tableRows,
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [245, 245, 255]
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    }
  });

  // ===== TOTAL PRICE =====
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text(`Total Amount: Rs. ${order.totalPrice}`, 14, finalY);

  // ===== FOOTER =====
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    "Thank you for shopping with Qyro!",
    14,
    finalY + 15
  );

  // Save PDF with order ID as filename
  doc.save(`Qyro-Invoice-${order._id}.pdf`);

};