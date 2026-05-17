import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  rightText: {
    textAlign: "right",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  label: {
    color: "#6b7280",
    marginBottom: 2,
  },
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 6,
    color: "#6b7280",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  col1: { flex: 4 },
  col2: { flex: 1, textAlign: "right" },
  totals: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 3,
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    width: 200,
    marginVertical: 4,
  },
  notes: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    color: "#6b7280",
  },
});

interface InvoicePDFProps {
  invoice: {
    number: string;
    issueDate: Date;
    dueDate: Date;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes?: string | null;
    items: { description: string; quantity: number; rate: number; amount: number }[];
    client: { name: string; email: string; phone?: string | null; address?: string | null };
    user: { name?: string | null; email?: string | null };
  };
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  const discountAmount = (invoice.subtotal * invoice.discount) / 100;
  const taxAmount = ((invoice.subtotal - discountAmount) * invoice.tax) / 100;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{invoice.user.name}</Text>
            <Text style={styles.subtitle}>{invoice.number}</Text>
          </View>
          <View>
            <Text style={[styles.bold, styles.rightText]}>{invoice.user.name}</Text>
            <Text style={[styles.subtitle, styles.rightText]}>{invoice.user.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.bold}>{invoice.client.name}</Text>
            <Text style={styles.subtitle}>{invoice.client.email}</Text>
            {invoice.client.phone && <Text style={styles.subtitle}>{invoice.client.phone}</Text>}
            {invoice.client.address && <Text style={styles.subtitle}>{invoice.client.address}</Text>}
          </View>
          <View>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Issue Date</Text>
              <Text>{new Date(invoice.issueDate).toLocaleDateString()}</Text>
            </View>
            <View>
              <Text style={styles.label}>Due Date</Text>
              <Text>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col2}>Rate</Text>
            <Text style={styles.col2}>Amount</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col2}>${item.rate.toFixed(2)}</Text>
              <Text style={styles.col2}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={{ color: "#6b7280" }}>Subtotal</Text>
            <Text>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ color: "#16a34a" }}>Discount ({invoice.discount}%)</Text>
              <Text style={{ color: "#16a34a" }}>-${discountAmount.toFixed(2)}</Text>
            </View>
          )}
          {invoice.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ color: "#6b7280" }}>Tax ({invoice.tax}%)</Text>
              <Text>${taxAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Total</Text>
            <Text style={styles.bold}>${invoice.total.toFixed(2)}</Text>
          </View>
        </View>

       
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={[styles.bold, { marginBottom: 4 }]}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}