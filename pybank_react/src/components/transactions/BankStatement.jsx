import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    border: '1px solid #000',
  },
});

// Create Document Component
const BankStatement = ({ transactions }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Bank Statement</Text>
      {transactions.map((transaction) => (
        <View key={transaction.id} style={styles.section}>
          <Text>Transaction ID: {transaction.id}</Text>
          <Text>Amount: {transaction.amount} €</Text>
          <Text>Sender: {transaction.sender}</Text>
          <Text>Receiver: {transaction.receiver}</Text>
          <Text>Date: {new Date(transaction.created_at).toLocaleString()}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

export default BankStatement;